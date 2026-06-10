package com.ailms.exam.service;

import com.ailms.certificate.entity.Certificate;
import com.ailms.certificate.repository.CertificateRepository;
import com.ailms.common.enums.RoleName;
import com.ailms.common.exception.BadRequestException;
import com.ailms.common.exception.ResourceNotFoundException;
import com.ailms.course.entity.Course;
import com.ailms.course.repository.CourseRepository;
import com.ailms.enrollment.repository.EnrollmentRepository;
import com.ailms.exam.dto.CreateQuestionRequest;
import com.ailms.exam.dto.CreateQuizRequest;
import com.ailms.exam.dto.ExamResultResponse;
import com.ailms.exam.dto.LeaderboardEntryResponse;
import com.ailms.exam.dto.QuestionResponse;
import com.ailms.exam.dto.QuizResponse;
import com.ailms.exam.dto.StartAttemptResponse;
import com.ailms.exam.dto.SubmitAnswerRequest;
import com.ailms.exam.dto.SubmitExamRequest;
import com.ailms.exam.entity.AttemptAnswer;
import com.ailms.exam.entity.ExamAttempt;
import com.ailms.exam.entity.Question;
import com.ailms.exam.entity.Quiz;
import com.ailms.exam.enums.ExamAttemptStatus;
import com.ailms.exam.repository.AttemptAnswerRepository;
import com.ailms.exam.repository.ExamAttemptRepository;
import com.ailms.exam.repository.QuestionRepository;
import com.ailms.exam.repository.QuizRepository;
import com.ailms.notification.service.NotificationService;
import com.ailms.user.entity.User;
import com.ailms.user.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ExamServiceImpl implements ExamService {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final ExamAttemptRepository examAttemptRepository;
    private final AttemptAnswerRepository attemptAnswerRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CertificateRepository certificateRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public QuizResponse createQuiz(CreateQuizRequest request, String instructorEmail) {
        User instructor = findUserByEmail(instructorEmail);
        ensureRole(instructor, RoleName.INSTRUCTOR);

        Course course = courseRepository.findById(request.courseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        if (!course.getInstructor().getId().equals(instructor.getId())) {
            throw new BadRequestException("You can create quiz only for your own course");
        }

        Quiz quiz = Quiz.builder()
                .course(course)
                .title(request.title())
                .durationMinutes(request.durationMinutes())
                .passPercentage(request.passPercentage())
                .build();
        return toQuizResponse(quizRepository.save(quiz));
    }

    @Override
    @Transactional
    public QuestionResponse addQuestion(CreateQuestionRequest request, String instructorEmail) {
        User instructor = findUserByEmail(instructorEmail);
        ensureRole(instructor, RoleName.INSTRUCTOR);

        Quiz quiz = quizRepository.findById(request.quizId())
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
        if (!quiz.getCourse().getInstructor().getId().equals(instructor.getId())) {
            throw new BadRequestException("You can add questions only to your own quiz");
        }

        Question question = Question.builder()
                .quiz(quiz)
                .questionText(request.questionText())
                .optionA(request.optionA())
                .optionB(request.optionB())
                .optionC(request.optionC())
                .optionD(request.optionD())
                .correctOption(request.correctOption())
                .difficulty(request.difficulty())
                .build();
        return toQuestionResponse(questionRepository.save(question));
    }

    @Override
    @Transactional
    public StartAttemptResponse startAttempt(Long quizId, String studentEmail) {
        User student = findUserByEmail(studentEmail);
        ensureRole(student, RoleName.STUDENT);

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
        if (!quiz.isActive()) {
            throw new BadRequestException("Quiz is not active");
        }
        if (!enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), quiz.getCourse().getId())) {
            throw new BadRequestException("You are not enrolled in this course");
        }

        examAttemptRepository.findByQuizIdAndStudentIdAndStatus(quizId, student.getId(), ExamAttemptStatus.IN_PROGRESS)
                .ifPresent(existing -> {
                    throw new BadRequestException("You already have an in-progress attempt");
                });

        List<Question> questions = questionRepository.findByQuizId(quizId);
        if (questions.isEmpty()) {
            throw new BadRequestException("Quiz has no questions");
        }

        ExamAttempt attempt = ExamAttempt.builder()
                .quiz(quiz)
                .student(student)
                .totalQuestions(questions.size())
                .status(ExamAttemptStatus.IN_PROGRESS)
                .build();
        ExamAttempt saved = examAttemptRepository.save(attempt);

        return new StartAttemptResponse(
                saved.getId(),
                quiz.getId(),
                quiz.getTitle(),
                quiz.getDurationMinutes(),
                saved.getStartedAt(),
                saved.getStartedAt().plusMinutes(quiz.getDurationMinutes()),
                questions.stream().map(this::toQuestionResponse).toList()
        );
    }

    @Override
    @Transactional
    public ExamResultResponse submitAttempt(Long attemptId, SubmitExamRequest request, String studentEmail) {
        User student = findUserByEmail(studentEmail);
        ensureRole(student, RoleName.STUDENT);

        ExamAttempt attempt = examAttemptRepository.findByIdAndStudentId(attemptId, student.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found"));
        if (attempt.getStatus() != ExamAttemptStatus.IN_PROGRESS) {
            throw new BadRequestException("Attempt is already submitted");
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiry = attempt.getStartedAt().plusMinutes(attempt.getQuiz().getDurationMinutes());
        boolean timedOut = now.isAfter(expiry);

        Map<Long, SubmitAnswerRequest> answerByQuestionId = request.answers()
                .stream()
                .collect(Collectors.toMap(SubmitAnswerRequest::questionId, a -> a, (a, b) -> b));

        List<Question> questions = questionRepository.findByQuizId(attempt.getQuiz().getId());
        int correct = 0;
        int attempted = 0;

        for (Question question : questions) {
            SubmitAnswerRequest incoming = answerByQuestionId.get(question.getId());
            if (incoming == null) {
                continue;
            }

            boolean isCorrect = question.getCorrectOption().equalsIgnoreCase(incoming.selectedOption());
            attempted++;
            if (isCorrect) {
                correct++;
            }

            AttemptAnswer answer = attemptAnswerRepository.findByAttemptIdAndQuestionId(attempt.getId(), question.getId())
                    .orElseGet(() -> AttemptAnswer.builder().attempt(attempt).question(question).build());
            answer.setSelectedOption(incoming.selectedOption());
            answer.setCorrect(isCorrect);
            attemptAnswerRepository.save(answer);
        }

        double score = questions.isEmpty() ? 0.0 : ((double) correct / questions.size()) * 100.0;
        boolean passed = score >= attempt.getQuiz().getPassPercentage();

        attempt.setAttemptedQuestions(attempted);
        attempt.setCorrectAnswers(correct);
        attempt.setScorePercentage(score);
        attempt.setPassed(passed);
        attempt.setSubmittedAt(now);
        attempt.setStatus(timedOut ? ExamAttemptStatus.AUTO_SUBMITTED : ExamAttemptStatus.SUBMITTED);
        ExamAttempt saved = examAttemptRepository.save(attempt);

        String certificateCode = null;
        if (passed) {
            Certificate cert = certificateRepository.findByStudentIdAndCourseId(student.getId(), saved.getQuiz().getCourse().getId())
                    .orElseGet(() -> certificateRepository.save(Certificate.builder()
                            .certificateCode(generateCertificateCode())
                            .student(student)
                            .course(saved.getQuiz().getCourse())
                            .build()));
            certificateCode = cert.getCertificateCode();
            notificationService.notifyUser(
                    student.getId(),
                    "Exam passed",
                    "Congratulations! You passed quiz '" + saved.getQuiz().getTitle() + "'. Certificate: " + certificateCode
            );
        } else {
            notificationService.notifyUser(
                    student.getId(),
                    "Exam result available",
                    "You scored " + Math.round(saved.getScorePercentage()) + "% in quiz '" + saved.getQuiz().getTitle() + "'."
            );
        }

        return new ExamResultResponse(
                saved.getId(),
                saved.getQuiz().getId(),
                saved.getStatus(),
                saved.getTotalQuestions(),
                saved.getAttemptedQuestions(),
                saved.getCorrectAnswers(),
                saved.getScorePercentage(),
                saved.isPassed(),
                certificateCode,
                saved.getSubmittedAt()
        );
    }

    @Override
    public List<LeaderboardEntryResponse> getLeaderboard(Long quizId) {
        return examAttemptRepository.findTop10ByQuizIdAndStatusOrderByScorePercentageDescSubmittedAtAsc(quizId, ExamAttemptStatus.SUBMITTED)
                .stream()
                .map(a -> new LeaderboardEntryResponse(
                        a.getStudent().getId(),
                        a.getStudent().getFullName(),
                        a.getScorePercentage(),
                        a.getCorrectAnswers(),
                        a.getTotalQuestions()
                ))
                .toList();
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void ensureRole(User user, RoleName role) {
        if (user.getRole().getName() != role) {
            throw new BadRequestException("Operation requires role: " + role.name());
        }
    }

    private QuizResponse toQuizResponse(Quiz quiz) {
        return new QuizResponse(
                quiz.getId(),
                quiz.getCourse().getId(),
                quiz.getTitle(),
                quiz.getDurationMinutes(),
                quiz.getPassPercentage(),
                quiz.isActive()
        );
    }

    private QuestionResponse toQuestionResponse(Question question) {
        return new QuestionResponse(
                question.getId(),
                question.getQuestionText(),
                question.getOptionA(),
                question.getOptionB(),
                question.getOptionC(),
                question.getOptionD(),
                question.getDifficulty()
        );
    }

    private String generateCertificateCode() {
        return "CERT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}

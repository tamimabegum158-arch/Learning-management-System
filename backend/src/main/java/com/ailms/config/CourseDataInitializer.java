package com.ailms.config;

import com.ailms.course.entity.Course;
import com.ailms.course.entity.CourseModule;
import com.ailms.course.entity.Lesson;
import com.ailms.course.enums.CourseLevel;
import com.ailms.course.enums.CourseStatus;
import com.ailms.course.repository.CourseModuleRepository;
import com.ailms.course.repository.CourseRepository;
import com.ailms.course.repository.LessonRepository;
import com.ailms.role.entity.Role;
import com.ailms.role.repository.RoleRepository;
import com.ailms.user.entity.User;
import com.ailms.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Component
@Profile({"dev", "test", "h2"})
@RequiredArgsConstructor
public class CourseDataInitializer implements CommandLineRunner {

    private final CourseRepository courseRepository;
    private final CourseModuleRepository moduleRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) {
        if (courseRepository.count() > 0) {
            log.info("Courses already exist, skipping data initialization");
            return;
        }

        log.info("Initializing sample courses with modules and lessons...");

        try {
            // Get or create instructor role
            Role instructorRole = roleRepository.findByName(com.ailms.common.enums.RoleName.INSTRUCTOR)
                    .orElseGet(() -> {
                        Role role = new Role();
                        role.setName(com.ailms.common.enums.RoleName.INSTRUCTOR);
                        return roleRepository.save(role);
                    });

            // Get or create instructor user
            User instructor = userRepository.findByEmail("instructor@lms.com")
                    .orElseGet(() -> {
                        User user = User.builder()
                                .fullName("John Instructor")
                                .email("instructor@lms.com")
                                .password("$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy") // password: test123
                                .role(instructorRole)
                                .enabled(true)
                                .build();
                        return userRepository.save(user);
                    });

            // Course 1: Java Programming
            Course javaCourse = createCourse(
                    "Complete Java Programming Masterclass",
                    "Learn Java from scratch to advanced concepts. This comprehensive course covers everything you need to become a Java developer.",
                    new BigDecimal("49.99"),
                    CourseLevel.BEGINNER,
                    instructor
            );

            addModulesAndLessons(javaCourse, List.of(
                    new ModuleData("Introduction to Java", List.of(
                            new LessonData("What is Java?", 10),
                            new LessonData("Setting Up Java Environment", 15),
                            new LessonData("Your First Java Program", 20)
                    )),
                    new ModuleData("Java Basics", List.of(
                            new LessonData("Variables and Data Types", 25),
                            new LessonData("Operators and Expressions", 20),
                            new LessonData("Control Flow Statements", 30)
                    )),
                    new ModuleData("Object-Oriented Programming", List.of(
                            new LessonData("Classes and Objects", 35),
                            new LessonData("Inheritance and Polymorphism", 40),
                            new LessonData("Interfaces and Abstract Classes", 30)
                    ))
            ));

            // Course 2: Web Development
            Course webCourse = createCourse(
                    "Modern Web Development with React",
                    "Master modern web development using React, TypeScript, and best practices for building scalable applications.",
                    new BigDecimal("59.99"),
                    CourseLevel.INTERMEDIATE,
                    instructor
            );

            addModulesAndLessons(webCourse, List.of(
                    new ModuleData("React Fundamentals", List.of(
                            new LessonData("Introduction to React", 15),
                            new LessonData("Components and Props", 25),
                            new LessonData("State and Lifecycle", 30)
                    )),
                    new ModuleData("Advanced React", List.of(
                            new LessonData("Hooks Deep Dive", 35),
                            new LessonData("Context API and Redux", 40),
                            new LessonData("Performance Optimization", 30)
                    )),
                    new ModuleData("TypeScript with React", List.of(
                            new LessonData("TypeScript Basics", 20),
                            new LessonData("Typing React Components", 25),
                            new LessonData("Best Practices", 20)
                    ))
            ));

            // Course 3: Python for Data Science
            Course pythonCourse = createCourse(
                    "Python for Data Science and Machine Learning",
                    "Complete guide to Python programming for data science, analytics, and machine learning applications.",
                    new BigDecimal("69.99"),
                    CourseLevel.INTERMEDIATE,
                    instructor
            );

            addModulesAndLessons(pythonCourse, List.of(
                    new ModuleData("Python Basics", List.of(
                            new LessonData("Python Introduction", 15),
                            new LessonData("Data Types and Structures", 25),
                            new LessonData("Functions and Modules", 30)
                    )),
                    new ModuleData("Data Analysis with Pandas", List.of(
                            new LessonData("Introduction to Pandas", 20),
                            new LessonData("Data Manipulation", 35),
                            new LessonData("Data Visualization", 30)
                    )),
                    new ModuleData("Machine Learning Basics", List.of(
                            new LessonData("Introduction to ML", 25),
                            new LessonData("Supervised Learning", 40),
                            new LessonData("Model Evaluation", 30)
                    ))
            ));

            // Course 4: JavaScript Masterclass
            Course jsCourse = createCourse(
                    "JavaScript: The Complete Guide",
                    "Master JavaScript from basics to advanced concepts including ES6+, async programming, and modern development practices.",
                    new BigDecimal("44.99"),
                    CourseLevel.BEGINNER,
                    instructor
            );

            addModulesAndLessons(jsCourse, List.of(
                    new ModuleData("JavaScript Fundamentals", List.of(
                            new LessonData("What is JavaScript?", 10),
                            new LessonData("Variables and Types", 20),
                            new LessonData("Functions and Scope", 25)
                    )),
                    new ModuleData("DOM Manipulation", List.of(
                            new LessonData("Understanding the DOM", 20),
                            new LessonData("Event Handling", 30),
                            new LessonData("Dynamic Content", 25)
                    )),
                    new ModuleData("Modern JavaScript (ES6+)", List.of(
                            new LessonData("Arrow Functions and Destructuring", 25),
                            new LessonData("Promises and Async/Await", 35),
                            new LessonData("Modules and Classes", 30)
                    ))
            ));

            // Course 5: SQL and Database Design
            Course sqlCourse = createCourse(
                    "SQL and Database Design Fundamentals",
                    "Learn SQL from scratch, database design principles, normalization, and advanced query techniques for real-world applications.",
                    new BigDecimal("39.99"),
                    CourseLevel.BEGINNER,
                    instructor
            );

            addModulesAndLessons(sqlCourse, List.of(
                    new ModuleData("Introduction to Databases", List.of(
                            new LessonData("What is a Database?", 10),
                            new LessonData("Relational vs Non-Relational", 15),
                            new LessonData("Setting Up MySQL", 20)
                    )),
                    new ModuleData("SQL Basics", List.of(
                            new LessonData("SELECT Statements", 25),
                            new LessonData("WHERE and Filtering", 20),
                            new LessonData("JOIN Operations", 30)
                    )),
                    new ModuleData("Advanced SQL", List.of(
                            new LessonData("Subqueries", 30),
                            new LessonData("Stored Procedures", 35),
                            new LessonData("Database Optimization", 25)
                    ))
            ));

            // Course 6: DevOps and Cloud
            Course devopsCourse = createCourse(
                    "DevOps and Cloud Computing Essentials",
                    "Master DevOps practices, Docker, Kubernetes, CI/CD pipelines, and cloud deployment on AWS and Azure.",
                    new BigDecimal("79.99"),
                    CourseLevel.ADVANCED,
                    instructor
            );

            addModulesAndLessons(devopsCourse, List.of(
                    new ModuleData("DevOps Fundamentals", List.of(
                            new LessonData("What is DevOps?", 15),
                            new LessonData("CI/CD Concepts", 25),
                            new LessonData("Version Control with Git", 30)
                    )),
                    new ModuleData("Docker and Containers", List.of(
                            new LessonData("Introduction to Docker", 30),
                            new LessonData("Docker Compose", 35),
                            new LessonData("Container Orchestration", 40)
                    )),
                    new ModuleData("Cloud Deployment", List.of(
                            new LessonData("AWS Essentials", 35),
                            new LessonData("Azure Fundamentals", 30),
                            new LessonData("Deploying Applications", 40)
                    ))
            ));

            // Course 7: Mobile Development
            Course mobileCourse = createCourse(
                    "Mobile App Development with React Native",
                    "Build cross-platform mobile applications for iOS and Android using React Native and modern development tools.",
                    new BigDecimal("64.99"),
                    CourseLevel.INTERMEDIATE,
                    instructor
            );

            addModulesAndLessons(mobileCourse, List.of(
                    new ModuleData("React Native Basics", List.of(
                            new LessonData("Setting Up Development Environment", 20),
                            new LessonData("Components and Styling", 30),
                            new LessonData("Navigation", 35)
                    )),
                    new ModuleData("Advanced Features", List.of(
                            new LessonData("State Management", 30),
                            new LessonData("API Integration", 35),
                            new LessonData("Device APIs", 25)
                    )),
                    new ModuleData("Publishing Your App", List.of(
                            new LessonData("Testing and Debugging", 30),
                            new LessonData("App Store Guidelines", 20),
                            new LessonData("Deployment Strategies", 25)
                    ))
            ));

            // Course 8: Cybersecurity
            Course securityCourse = createCourse(
                    "Cybersecurity Essentials: Protect Your Applications",
                    "Learn cybersecurity fundamentals, common vulnerabilities, encryption, and best practices for secure application development.",
                    new BigDecimal("54.99"),
                    CourseLevel.INTERMEDIATE,
                    instructor
            );

            addModulesAndLessons(securityCourse, List.of(
                    new ModuleData("Security Fundamentals", List.of(
                            new LessonData("Introduction to Cybersecurity", 15),
                            new LessonData("Common Threats and Attacks", 25),
                            new LessonData("Security Best Practices", 20)
                    )),
                    new ModuleData("Web Application Security", List.of(
                            new LessonData("OWASP Top 10", 35),
                            new LessonData("Authentication and Authorization", 30),
                            new LessonData("Input Validation", 25)
                    )),
                    new ModuleData("Advanced Security", List.of(
                            new LessonData("Encryption Techniques", 30),
                            new LessonData("Secure API Design", 25),
                            new LessonData("Security Testing", 30)
                    ))
            ));

            log.info("Successfully initialized {} courses with modules and lessons", courseRepository.count());

        } catch (Exception e) {
            log.error("Error initializing course data", e);
        }
    }

    private Course createCourse(String title, String description, BigDecimal price, CourseLevel level, User instructor) {
        Course course = Course.builder()
                .title(title)
                .description(description)
                .price(price)
                .level(level)
                .status(CourseStatus.PUBLISHED)
                .instructor(instructor)
                .active(true)
                .build();
        return courseRepository.save(course);
    }

    private void addModulesAndLessons(Course course, List<ModuleData> modulesData) {
        int moduleOrder = 1;
        for (ModuleData moduleData : modulesData) {
            CourseModule module = CourseModule.builder()
                    .course(course)
                    .title(moduleData.title())
                    .moduleOrder(moduleOrder++)
                    .build();
            module = moduleRepository.save(module);

            int lessonOrder = 1;
            for (LessonData lessonData : moduleData.lessons()) {
                Lesson lesson = Lesson.builder()
                        .module(module)
                        .title(lessonData.title())
                        .lessonOrder(lessonOrder++)
                        .durationMinutes(lessonData.durationMinutes())
                        .build();
                lessonRepository.save(lesson);
            }
        }
    }

    record ModuleData(String title, List<LessonData> lessons) {}
    record LessonData(String title, Integer durationMinutes) {}
}

import { useEffect, useState } from 'react'
import { fetchCourses } from '../api'

interface CoursesPageProps {
  setStatus: (value: string) => void
}

interface Course {
  id: number
  title: string
  description: string
  price: number
  level: string
  status: string
  instructorName: string
  totalEnrollments: number
  averageRating?: number
  reviewCount: number
}

export default function CoursesPage({ setStatus }: CoursesPageProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setStatus('Loading course catalog...')
    setLoading(true)
    fetchCourses()
      .then((response) => {
        const apiResponse = response.data
        if (apiResponse?.success && apiResponse?.data) {
          // Handle paginated response (Page<CourseResponse>)
          const pageData = apiResponse.data as any
          const courseList = pageData.content || []
          setCourses(courseList)
          setStatus(`Loaded ${courseList.length} courses`)
        } else {
          setCourses([])
          setStatus('No courses found')
        }
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error loading courses:', error)
        setStatus('Unable to load courses')
        setCourses([])
        setLoading(false)
      })
  }, [setStatus])

  if (loading) {
    return (
      <section className="courses-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading courses...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="courses-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Course Catalog</p>
          <h2>Explore available courses</h2>
          <p>Browse {courses.length} courses with lessons, quizzes, and AI guidance.</p>
        </div>
      </div>

      <div className="courses-grid">
        {courses.length > 0 ? (
          courses.map((course) => (
            <article key={course.id} className="course-card">
              <div className="course-header">
                <h3>{course.title}</h3>
                <span className={`badge badge-${course.level?.toLowerCase()}`}>
                  {course.level}
                </span>
              </div>
              <p className="course-description">{course.description}</p>
              <div className="course-meta">
                <span className="course-instructor">
                  👤 {course.instructorName}
                </span>
                <span className="course-price">
                  ${course.price}
                </span>
              </div>
              <div className="course-footer">
                <span className="course-enrollments">
                  {course.totalEnrollments} students
                </span>
                {course.averageRating && (
                  <span className="course-rating">
                    ⭐ {course.averageRating.toFixed(1)} ({course.reviewCount})
                  </span>
                )}
              </div>
            </article>
          ))
        ) : (
          <div className="empty-state">
            <p>No courses are available yet.</p>
            <p style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '0.5rem' }}>
              Make sure the backend is running on <strong>http://localhost:8080</strong>
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

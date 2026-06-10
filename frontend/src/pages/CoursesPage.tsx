import { useEffect, useState } from 'react'
import { fetchCourses } from '../api'

interface CoursesPageProps {
  setStatus: (value: string) => void
}

export default function CoursesPage({ setStatus }: CoursesPageProps) {
  const [courses, setCourses] = useState<string[]>([])

  useEffect(() => {
    setStatus('Loading course catalog...')
    fetchCourses()
      .then((response) => {
        const data = response.data?.data
        setCourses(Array.isArray(data) ? data.map((item: any) => item.title ?? item.name ?? 'Untitled course') : [])
        setStatus('Course catalog loaded')
      })
      .catch((error) => {
        console.error(error)
        setStatus('Unable to load courses')
      })
  }, [setStatus])

  return (
    <section className="courses-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Course Catalog</p>
          <h2>Explore available courses</h2>
          <p>Browse the full public course catalog exposed by the backend.</p>
        </div>
      </div>

      <div className="courses-grid">
        {courses.length > 0 ? (
          courses.map((title) => (
            <article key={title} className="course-card">
              <h3>{title}</h3>
              <p>Interactive course content with lessons, quizzes, and AI guidance.</p>
            </article>
          ))
        ) : (
          <div className="empty-state">
            <p>No public courses are available yet. Ensure the backend is running on <strong>http://localhost:8080</strong>.</p>
          </div>
        )}
      </div>
    </section>
  )
}

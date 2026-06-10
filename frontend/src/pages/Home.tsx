import { Link } from 'react-router-dom'

interface HomeProps {
  status: string
}

export default function Home({ status }: HomeProps) {
  return (
    <section className="home-page">
      <div className="hero-card">
        <div>
          <span className="eyebrow">AI LMS Platform</span>
          <h1>Launch your learning portal with modern AI-driven course workflows</h1>
          <p>Built to connect students, instructors and admins with a powerful backend and slick frontend.</p>
          <div className="hero-actions">
            <Link to="/auth" className="button primary">Get started</Link>
            <Link to="/courses" className="button secondary">Browse courses</Link>
          </div>
        </div>
        <div className="hero-panel">
          <h2>Platform readiness</h2>
          <p>{status}</p>
          <ul>
            <li>Secure auth and JWT login</li>
            <li>Course catalog browsing</li>
            <li>Backend health and API connectivity</li>
          </ul>
        </div>
      </div>

      <div className="feature-grid">
        <article>
          <h3>Modern UI</h3>
          <p>Responsive React pages with route-based navigation and clean course discovery.</p>
        </article>
        <article>
          <h3>Secure backend</h3>
          <p>Spring Boot backend with H2 runtime profile for local development and JWT auth.</p>
        </article>
        <article>
          <h3>Future-ready</h3>
          <p>Designed to extend with instructor dashboards, enrollments, payments, and AI features.</p>
        </article>
      </div>
    </section>
  )
}

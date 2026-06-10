import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="not-found-page">
      <h2>Page not found</h2>
      <p>The page you are looking for does not exist.</p>
      <Link to="/" className="button secondary">Back to home</Link>
    </section>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthUser, clearAuth, loadAuth } from './auth'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import CoursesPage from './pages/CoursesPage'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import NotFound from './pages/NotFound'
import './styles.css'

function App() {
  const [status, setStatus] = useState('Welcome to AI LMS Portal')
  const [auth, setAuth] = useState<AuthUser | null>(null)

  useEffect(() => {
    const storedAuth = loadAuth()
    if (storedAuth) {
      setAuth(storedAuth)
      setStatus(`Welcome back, ${storedAuth.email}`)
    }
  }, [])

  const isAuthenticated = useMemo(() => Boolean(auth), [auth])

  const handleLogout = () => {
    clearAuth()
    setAuth(null)
    setStatus('Logged out')
  }

  return (
    <BrowserRouter>
      <div className="page-shell">
        <header className="site-header">
          <div className="brand">
            <h1>AI LMS</h1>
            <p>Learning Management Portal</p>
          </div>
          <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        </header>

        <main className="page-content">
          <Routes>
            <Route path="/" element={<Home status={status} />} />
            <Route path="/courses" element={<CoursesPage setStatus={setStatus} />} />
            <Route path="/profile" element={isAuthenticated ? <DashboardPage /> : <AuthPage setAuth={setAuth} setStatus={setStatus} />} />
            <Route path="/auth" element={<AuthPage setAuth={setAuth} setStatus={setStatus} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <footer className="site-footer">
          <p>Run backend in <code>backend</code> and frontend from <code>frontend</code>.</p>
          <p>Frontend development URL: <strong>http://localhost:4173</strong></p>
        </footer>
      </div>
    </BrowserRouter>
  )
}

export default App

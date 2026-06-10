import { FormEvent, useState } from 'react'
import { login, registerInstructor, registerStudent } from '../api'
import { AuthUser, saveAuth } from '../auth'

interface AuthPageProps {
  setAuth: (user: AuthUser) => void
  setStatus: (value: string) => void
}

export default function AuthPage({ setAuth, setStatus }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [role, setRole] = useState<'student' | 'instructor'>('student')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const submitLabel = mode === 'login' ? 'Sign In' : `Register as ${role}`

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus(mode === 'login' ? 'Signing in...' : `Registering as ${role}...`)

    try {
      const response = mode === 'login'
        ? await login({ email, password })
        : role === 'student'
          ? await registerStudent({ fullName, email, password })
          : await registerInstructor({ fullName, email, password })

      const data = response.data?.data
      if (!data) {
        throw new Error(response.data?.message ?? 'Unexpected response')
      }

      const authUser: AuthUser = {
        email: data.email,
        role: data.role,
        accessToken: data.accessToken
      }

      saveAuth(authUser)
      setAuth(authUser)
      setStatus(`Signed in as ${authUser.email}`)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setStatus(`Authentication failed: ${message}`)
    }
  }

  return (
    <section className="auth-page">
      <div className="page-header">
        <p className="eyebrow">Account</p>
        <h2>{mode === 'login' ? 'Sign in to your account' : 'Create a new account'}</h2>
        <p>Use your email and password to access the LMS backend.</p>
      </div>

      <div className="auth-layout">
        <div className="auth-card">
          <div className="auth-toggle">
            <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')} type="button">Login</button>
            <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')} type="button">Register</button>
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <label>
                Full name
                <input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Jane Doe" required minLength={3} />
              </label>
            )}

            <label>
              Email
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />
            </label>

            <label>
              Password
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" required minLength={8} />
            </label>

            {mode === 'register' && (
              <div className="role-buttons">
                <button type="button" className={role === 'student' ? 'active' : ''} onClick={() => setRole('student')}>Student</button>
                <button type="button" className={role === 'instructor' ? 'active' : ''} onClick={() => setRole('instructor')}>Instructor</button>
              </div>
            )}

            <button type="submit" className="button primary">{submitLabel}</button>
          </form>
        </div>

        <div className="auth-info">
          <h3>Why use this LMS?</h3>
          <p>Sign in and test the backend APIs for courses, authentication, and future learning experiences.</p>
          <ul>
            <li>Secure JWT auth</li>
            <li>Roles for students and instructors</li>
            <li>Fast local development with H2</li>
          </ul>
        </div>
      </div>
    </section>
  )
}

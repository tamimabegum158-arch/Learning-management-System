import { NavLink } from 'react-router-dom'

interface NavbarProps {
  onLogout?: () => void
  isAuthenticated: boolean
}

export default function Navbar({ onLogout, isAuthenticated }: NavbarProps) {
  return (
    <nav className="site-nav">
      <NavLink to="/" end>Home</NavLink>
      <NavLink to="/courses">Courses</NavLink>
      <NavLink to="/auth">Account</NavLink>
      {isAuthenticated && onLogout && (
        <button className="logout-button" onClick={onLogout}>Logout</button>
      )}
    </nav>
  )
}

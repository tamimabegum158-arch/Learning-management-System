import { useEffect, useState } from 'react'
import { loadAuth } from '../auth'
import { api } from '../api'

interface Course {
  id: number
  title: string
  description: string
  price: number
  level: string
  status: string
  instructor: {
    fullName: string
  }
  active: boolean
}

interface Enrollment {
  id: number
  course: Course
  progressPercentage: number
  enrolledAt: string
}

interface DashboardStats {
  totalEnrolled: number
  completedCourses: number
  inProgressCourses: number
  averageProgress: number
}

export default function DashboardPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalEnrolled: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    averageProgress: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const auth = loadAuth()
  const userName = auth?.email?.split('@')[0] || 'User'

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch enrollments
      const enrollmentsResponse = await api.get('/v1/enrollments')
      const enrollmentsData = enrollmentsResponse.data.data || []
      setEnrollments(enrollmentsData)
      
      // Calculate stats
      const totalEnrolled = enrollmentsData.length
      const completedCourses = enrollmentsData.filter(
        (e: Enrollment) => e.progressPercentage >= 100
      ).length
      const inProgressCourses = enrollmentsData.filter(
        (e: Enrollment) => e.progressPercentage > 0 && e.progressPercentage < 100
      ).length
      const averageProgress = totalEnrolled > 0
        ? enrollmentsData.reduce((sum: number, e: Enrollment) => sum + e.progressPercentage, 0) / totalEnrolled
        : 0
      
      setStats({
        totalEnrolled,
        completedCourses,
        inProgressCourses,
        averageProgress
      })
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return '#10b981'
    if (progress >= 50) return '#3b82f6'
    if (progress > 0) return '#f59e0b'
    return '#6b7280'
  }

  const getProgressLabel = (progress: number) => {
    if (progress >= 100) return 'Completed'
    if (progress >= 50) return 'In Progress'
    if (progress > 0) return 'Just Started'
    return 'Not Started'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  if (loading) {
    return (
      <section className="dashboard-page">
        <div className="dashboard-loading">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="dashboard-page">
      {/* Profile Header */}
      <div className="dashboard-profile-header">
        <div className="profile-avatar">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="profile-info">
          <h1>Welcome back, {userName}!</h1>
          <p>Role: {auth?.role || 'Student'}</p>
          <p>Email: {auth?.email}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon enrolled">📚</div>
          <div className="stat-content">
            <h3>{stats.totalEnrolled}</h3>
            <p>Enrolled Courses</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon completed">✅</div>
          <div className="stat-content">
            <h3>{stats.completedCourses}</h3>
            <p>Completed</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon in-progress">🔄</div>
          <div className="stat-content">
            <h3>{stats.inProgressCourses}</h3>
            <p>In Progress</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon average">📊</div>
          <div className="stat-content">
            <h3>{stats.averageProgress.toFixed(1)}%</h3>
            <p>Average Progress</p>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="dashboard-overall-progress">
        <h2>Overall Progress</h2>
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${stats.averageProgress}%` }}
          ></div>
        </div>
        <p className="progress-text">{stats.averageProgress.toFixed(1)}% complete across all courses</p>
      </div>

      {/* Enrolled Courses */}
      <div className="dashboard-enrolled-courses">
        <h2>My Courses</h2>
        
        {error && (
          <div className="error-message">{error}</div>
        )}

        {enrollments.length === 0 ? (
          <div className="empty-state">
            <p>You haven't enrolled in any courses yet.</p>
            <a href="/courses" className="button primary">Browse Courses</a>
          </div>
        ) : (
          <div className="enrolled-courses-grid">
            {enrollments.map((enrollment) => (
              <div key={enrollment.id} className="enrolled-course-card">
                <div className="course-header">
                  <h3>{enrollment.course.title}</h3>
                  <span 
                    className="course-status-badge"
                    style={{ 
                      backgroundColor: getProgressColor(enrollment.progressPercentage) 
                    }}
                  >
                    {getProgressLabel(enrollment.progressPercentage)}
                  </span>
                </div>
                
                <p className="course-description">{enrollment.course.description}</p>
                
                <div className="course-meta">
                  <span>👨‍🏫 {enrollment.course.instructor.fullName}</span>
                  <span>📅 Enrolled: {formatDate(enrollment.enrolledAt)}</span>
                </div>
                
                <div className="course-progress">
                  <div className="progress-info">
                    <span>Progress</span>
                    <span>{enrollment.progressPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="progress-bar-container small">
                    <div 
                      className="progress-bar-fill" 
                      style={{ 
                        width: `${enrollment.progressPercentage}%`,
                        backgroundColor: getProgressColor(enrollment.progressPercentage)
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="course-actions">
                  {enrollment.progressPercentage >= 100 ? (
                    <button className="button primary">🎓 Download Certificate</button>
                  ) : (
                    <button className="button secondary" disabled>🔒 Certificate Locked</button>
                  )}
                  <button className="button secondary">View Details</button>
                </div>
                
                {/* Certificate Status */}
                <div className={`certificate-status ${enrollment.progressPercentage >= 100 ? 'unlocked' : 'locked'}`}>
                  <div className="certificate-icon">
                    {enrollment.progressPercentage >= 100 ? '🏆' : '🔒'}
                  </div>
                  <div className="certificate-info">
                    <h4>
                      {enrollment.progressPercentage >= 100 
                        ? 'Certificate Unlocked!' 
                        : 'Certificate Locked'}
                    </h4>
                    <p>
                      {enrollment.progressPercentage >= 100 
                        ? 'Congratulations! You can now download your certificate.' 
                        : `Complete the course to unlock your certificate (${(100 - enrollment.progressPercentage).toFixed(1)}% remaining)`}
                    </p>
                  </div>
                  {enrollment.progressPercentage >= 100 && (
                    <div className="certificate-badge">
                      <span>✓ VERIFIED</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="dashboard-quick-actions">
        <h2>Quick Actions</h2>
        <div className="quick-actions-grid">
          <a href="/courses" className="action-card">
            <div className="action-icon">📚</div>
            <h3>Browse Courses</h3>
            <p>Explore new courses to enroll</p>
          </a>
          <div className="action-card">
            <div className="action-icon">🎯</div>
            <h3>Set Learning Goals</h3>
            <p>Track your learning objectives</p>
          </div>
          <div className="action-card">
            <div className="action-icon">🏆</div>
            <h3>Achievements</h3>
            <p>View your certificates and badges</p>
          </div>
          <div className="action-card">
            <div className="action-icon">⚙️</div>
            <h3>Settings</h3>
            <p>Manage your profile preferences</p>
          </div>
        </div>
      </div>
    </section>
  )
}

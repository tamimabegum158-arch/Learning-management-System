import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
  timeout: 6000
})

export type ApiResponse<T> = {
  success: boolean
  message: string
  data: T | null
}

export type JwtAuthResponse = {
  accessToken: string
  tokenType: string
  userId: number
  email: string
  role: string
}

export function checkHealth() {
  return api.get<ApiResponse<unknown>>('/health')
}

export function fetchCourses() {
  return api.get<ApiResponse<unknown>>('/v1/courses')
}

export function login(request: { email: string; password: string }) {
  return api.post<ApiResponse<JwtAuthResponse>>('/v1/auth/login', request)
}

export function registerStudent(request: { fullName: string; email: string; password: string }) {
  return api.post<ApiResponse<JwtAuthResponse>>('/v1/auth/register/student', request)
}

export function registerInstructor(request: { fullName: string; email: string; password: string }) {
  return api.post<ApiResponse<JwtAuthResponse>>('/v1/auth/register/instructor', request)
}

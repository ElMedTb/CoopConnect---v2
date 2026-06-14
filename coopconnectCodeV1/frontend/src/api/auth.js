import client from './client'

export const authApi = {
  login: (credentials) => client.post('/auth/login', credentials),
  googleLogin: (credential) => client.post('/auth/google', { credential }),
  register: (data) => client.post('/auth/register', data),
  logout: () => client.post('/auth/logout'),
  refresh: (refreshToken) => client.post('/auth/refresh', { refreshToken }),
  verifyEmail: (token) => client.post('/auth/verify-email', null, { params: { token } }),
  sendEmailVerification: (data) => client.post('/auth/email/send-verification', data),
  forgotPassword: (email) => client.post('/auth/forgot-password', null, { params: { email } }),
  resetPassword: (token, password) => client.post('/auth/reset-password', null, { params: { token, newPassword: password } }),
  sendPhoneCode: (data) => client.post('/auth/phone/send-code', data),
  verifyPhoneCode: (data) => client.post('/auth/phone/verify-code', data),
}

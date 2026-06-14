import client from './client'

export const usersApi = {
  getMe: () => client.get('/users/me'),
  updateMe: (data) => client.put('/users/me', data),
  completeOnboarding: (data) => client.put('/users/me/onboarding', data),
  markPhoneVerified: (data) => client.put('/users/me/phone-verified', data),
  changePassword: (data) => client.post('/auth/change-password', data),
  adminList: (params) => client.get('/users', { params }),
  adminUpdateSubscription: (id, data) => client.put(`/users/${id}/subscription`, data),
}

export const authVerificationApi = {
  sendPhoneCode: (data) => client.post('/auth/phone/send-code', data),
  verifyPhoneCode: (data) => client.post('/auth/phone/verify-code', data),
}

export const exchangesApi = {
  create: (data) => client.post('/exchanges', data),
  getMy: () => client.get('/exchanges/my'),
  getById: (id) => client.get(`/exchanges/${id}`),
  accept: (id, message) => client.put(`/exchanges/${id}/accept`, { message }),
  reject: (id, message) => client.put(`/exchanges/${id}/reject`, { message }),
  cancel: (id) => client.put(`/exchanges/${id}/cancel`),
  scanQr: (id, payload) => client.post(`/exchanges/${id}/scan-qr`, { payload }),
  getMessages: (id) => client.get(`/exchanges/${id}/messages`),
  sendMessage: (id, content) => client.post(`/exchanges/${id}/messages`, { content }),
}

export const notificationsApi = {
  getMy: (page = 0, size = 20) => client.get('/notifications', { params: { page, size } }),
  unreadCount: () => client.get('/notifications/unread-count'),
  markRead: (id) => client.put(`/notifications/${id}/read`),
  markAllRead: () => client.put('/notifications/read-all'),
}

import client from './client'

export const usersApi = {
  getMe: () => client.get('/users/me'),
  updateMe: (data) => client.put('/users/me', data),
  changePassword: (data) => client.put('/users/me/password', data),
}

export const exchangesApi = {
  create: (data) => client.post('/exchanges', data),
  getMy: () => client.get('/exchanges/my'),
  getById: (id) => client.get(`/exchanges/${id}`),
  accept: (id, message) => client.put(`/exchanges/${id}/accept`, { message }),
  reject: (id, message) => client.put(`/exchanges/${id}/reject`, { message }),
  cancel: (id) => client.put(`/exchanges/${id}/cancel`),
  getMessages: (id) => client.get(`/exchanges/${id}/messages`),
  sendMessage: (id, content) => client.post(`/exchanges/${id}/messages`, { content }),
}

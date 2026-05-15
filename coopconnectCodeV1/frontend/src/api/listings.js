import client from './client'

export const listingsApi = {
  getAll: (params) => client.get('/listings', { params }),
  getById: (id) => client.get(`/listings/${id}`),
  getMine: (params) => client.get('/listings/my', { params }),
  search: (q, params) => client.get('/listings/search', { params: { q, ...params } }),
  getByCategory: (category, params) =>
    client.get('/listings', { params: { category, ...params } }),
  create: (data) => client.post('/listings', data),
  update: (id, data) => client.put(`/listings/${id}`, data),
  remove: (id) => client.delete(`/listings/${id}`),
}

export const matchesApi = {
  findForListing: (listingId, params) =>
    client.post(`/matches/listing/${listingId}`, null, { params }),
  getRecommendations: (params) => client.get('/matches/recommendations', { params }),
}

module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'API SAST Example',
    version: '0.1.0',
    description: 'Minimal API used for P2 DevSecOps CI/CD demo'
  },
  servers: [ { url: '/' } ],
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        responses: { '200': { description: 'OK' } }
      }
    },
    '/api/items': {
      get: { summary: 'List items', responses: { '200': { description: 'OK' } } },
      post: { summary: 'Create item', responses: { '201': { description: 'Created' } } }
    },
    '/api/items/{id}': {
      get: { summary: 'Get item', responses: { '200': { description: 'OK' }, '404': { description: 'Not found' } } },
      put: { summary: 'Update item', responses: { '200': { description: 'OK' }, '404': { description: 'Not found' } } },
      delete: { summary: 'Delete', responses: { '204': { description: 'Deleted' } } }
    }
  }
};

const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const routes = require('./routes');
const { Pool } = require('pg');

const app = express();
app.use(bodyParser.json());

// Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Routes (includes CRUD placeholders)
app.use('/api', routes);

// PostgreSQL connection pool
let pool;
async function tryDbConnect() {
  const { DATABASE_URL } = process.env;
  if (!DATABASE_URL) {
    console.log('No DATABASE_URL provided, running without database');
    return;
  }
  try {
    pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    const client = await pool.connect();
    console.log('Connected to PostgreSQL');
    client.release();
  } catch (err) {
    console.warn('Could not connect to PostgreSQL:', err.message);
  }
}

// Export pool for use in routes
app.locals.pool = pool;

const port = process.env.PORT || 3000;
app.listen(port, async () => {
  console.log(`API listening on port ${port}`);
  await tryDbConnect();
});

module.exports = app;

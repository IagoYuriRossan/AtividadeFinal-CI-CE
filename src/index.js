const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const routes = require('./routes');
const mysql = require('mysql2/promise');

const app = express();
app.use(bodyParser.json());

// Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Routes (includes CRUD placeholders)
app.use('/api', routes);

// Attempt to connect to DB if env provided (optional)
async function tryDbConnect() {
  const { MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE } = process.env;
  if (!MYSQL_HOST) return;
  try {
    const conn = await mysql.createConnection({
      host: MYSQL_HOST,
      user: MYSQL_USER,
      password: MYSQL_PASSWORD,
      database: MYSQL_DATABASE
    });
    console.log('Connected to MySQL');
    await conn.end();
  } catch (err) {
    console.warn('Could not connect to MySQL:', err.message);
  }
}

const port = process.env.PORT || 3000;
app.listen(port, async () => {
  console.log(`API listening on port ${port}`);
  await tryDbConnect();
});

module.exports = app;

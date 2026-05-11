// app.js
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const { createClient } = require('redis');

// Load env vars
process.loadEnvFile('./.env');

const models = require('./models');
const router = require('./routes');

const PORT = process.env.PORT || '3000';
const ENV = process.env.NODE_ENV || 'development';

let app; // singleton Express app
let server; // http.Server
let redisClient; // Redis client

function createApp() {
  if (app) return app;

  app = express();

  // Serve frontend static files (useful in dev/prod, skipped in tests if you want)
  app.use(express.static(path.join(__dirname, '../dist')));

  app.use(express.json());
  app.use(cookieParser());

  // API routes
  app.use(router);

  // TEST-ONLY helper: reset DB between specs
  if (process.env.NODE_ENV === 'test') {
    const testApi = require('./routes/test.api');
    app.use('/test', testApi);
  }

  // Fallback to SPA index
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });

  return app;
}

/*
 * Initialize DB + models and (optionally) start listening.
 * @param {{listen?: boolean, port?: string|number}} options
 * @returns {Promise<{app: import('express').Express, server?: import('http').Server, db: any}>}
 */
async function initApp(options = {}) {
  const { listen = true, port = PORT } = options;

  const theApp = createApp();

  const mongoUri =
    process.env.MONGO_URI ||
    `mongodb://app_backend:app_password@localhost:27017/db_todoapp?authSource=db_todoapp`;

  try {
    await mongoose.connect(mongoUri);
    console.info('✅ Connecté à MongoDB');
  } catch (err) {
    console.error('❌ Erreur de connexion MongoDB:', err);
    throw err;
  }

  const redisUrl = process.env.REDIS_URL || `redis://:admin_pwd@localhost:6379`;
  redisClient = createClient({
    url: redisUrl
  });

  try {
    await redisClient.connect();
    console.info('✅ Connecté à Redis');
  } catch (err) {
    console.warn('⚠️ Impossible de se connecter à Redis, le cache sera désactivé.');
  }

  theApp.locals.models = models;
  theApp.locals.redis = redisClient;

  if (listen) {
    server = theApp.listen(port, () => {
      console.info(`Serveur sur le port ${port} (env: ${ENV})`);
    });
  }

  return { app: theApp, server, db: mongoose.connection, redis: redisClient };
}

/** Gracefully stop the server (useful in tests) */
async function stopApp() {
  if (server) {
    await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
    server = undefined;
  }
  if (mongoose.connection) {
    await mongoose.disconnect();
  }
  if (redisClient) {
    await redisClient.quit();
  }
}

module.exports = { createApp, initApp, stopApp };

// If run directly (node app.js), start the server.
if (require.main === module) {
  initApp({ listen: true }).catch((err) => {
    console.error("Impossible de démarrer l'app:", err);
    process.exit(1);
  });
}

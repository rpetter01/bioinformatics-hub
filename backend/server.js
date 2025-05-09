// server.js - Com verificação de roteadores
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { join } = require('path');
const fs = require('fs').promises;
const connectDB = require('./config/database');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
console.log('Inicializando conexão com MongoDB...');
connectDB()
  .then(() => {
    console.log('✅ MongoDB conectado com sucesso');
  })
  .catch(error => {
    console.error('❌ Erro ao conectar ao MongoDB:', error.message);
    // Don't exit in production - server can still run without DB
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  });

// Root route
app.get('/', (req, res) => {
  res.json({
    name: "Bioinformatics Hub API",
    version: "1.0.0",
    status: "online",
    availableEndpoints: [
      "/api",
      "/api/health",
      "/api/jobs"
    ]
  });
});

// API base route
app.get('/api', (req, res) => {
  res.json({ status: "ok", message: "API funcionando" });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'API funcionando',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Load routes
console.log('Verificando roteadores...');

let authRoutes, resourcesRoutes, tagsRoutes, configRoutes, analyticsRoutes, jobsRoutes;

try {
  authRoutes = require('./routes/auth');
  console.log('✅ Auth routes carregado com sucesso');
} catch (error) {
  console.error('❌ Erro ao carregar auth routes:', error.message);
}

try {
  resourcesRoutes = require('./routes/resources');
  console.log('✅ Resources routes carregado com sucesso');
} catch (error) {
  console.error('❌ Erro ao carregar resources routes:', error.message);
}

try {
  tagsRoutes = require('./routes/tags');
  console.log('✅ Tags routes carregado com sucesso');
} catch (error) {
  console.error('❌ Erro ao carregar tags routes:', error.message);
}

try {
  configRoutes = require('./routes/config');
  console.log('✅ Config routes carregado com sucesso');
} catch (error) {
  console.error('❌ Erro ao carregar config routes:', error.message);
}

try {
  analyticsRoutes = require('./routes/analytics');
  console.log('✅ Analytics routes carregado com sucesso');
} catch (error) {
  console.error('❌ Erro ao carregar analytics routes:', error.message);
}

try {
  jobsRoutes = require('./routes/jobs');
  console.log('✅ Jobs routes carregado com sucesso');
} catch (error) {
  console.error('❌ Erro ao carregar jobs routes:', error.message);
}

// Register valid routes
if (typeof authRoutes === 'function') {
  app.use('/api/auth', authRoutes);
}

if (typeof resourcesRoutes === 'function') {
  app.use('/api/resources', resourcesRoutes);
}

if (typeof tagsRoutes === 'function') {
  app.use('/api/tags', tagsRoutes);
}

if (typeof configRoutes === 'function') {
  app.use('/api/config', configRoutes);
}

if (typeof analyticsRoutes === 'function') {
  app.use('/api/analytics', analyticsRoutes);
}

if (typeof jobsRoutes === 'function') {
  app.use('/api/jobs', jobsRoutes);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit process in production
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

// Start server - Listen on all interfaces
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ Servidor rodando na porta ${PORT}`);
  console.log(`🔗 Access locally at: http://localhost:${PORT}`);
  console.log(`🔗 Deployed at: ${process.env.RENDER_EXTERNAL_URL || 'Check Render dashboard'}`);
});
// server.js - Com verificação de roteadores
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { join } = require('path');
const fs = require('fs').promises;
// Add this after other requires but before app initialization
const connectDB = require('./config/database');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));


app.use(express.json());

// Add this after middleware setup but before route verification
// Connect to MongoDB
console.log('Inicializando conexão com MongoDB...');
connectDB()
  .then(() => {
    console.log('✅ MongoDB conectado com sucesso');
  })
  .catch(error => {
    console.error('❌ Erro ao conectar ao MongoDB:', error.message);
    process.exit(1);
  });

// Verificar cada roteador individualmente
console.log('Verificando roteadores...');

let authRoutes, resourcesRoutes, tagsRoutes, configRoutes, analyticsRoutes;

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

// Add this with other route imports
try {
  jobsRoutes = require('./routes/jobs');
  console.log('✅ Jobs routes carregado com sucesso');
} catch (error) {
  console.error('❌ Erro ao carregar jobs routes:', error.message);
}

// Add this with other route registrations
if (typeof jobsRoutes === 'function') {
  app.use('/api/jobs', jobsRoutes);
}

// Verificar tipos
console.log('\nVerificando tipos dos roteadores:');
console.log('- authRoutes:', typeof authRoutes === 'function' ? '✅ função' : '❌ não é função');
console.log('- resourcesRoutes:', typeof resourcesRoutes === 'function' ? '✅ função' : '❌ não é função');
console.log('- tagsRoutes:', typeof tagsRoutes === 'function' ? '✅ função' : '❌ não é função');
console.log('- configRoutes:', typeof configRoutes === 'function' ? '✅ função' : '❌ não é função');
console.log('- analyticsRoutes:', typeof analyticsRoutes === 'function' ? '✅ função' : '❌ não é função');

// Rota básica de teste
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API funcionando' });
});

// Registrar apenas rotas válidas
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

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n✅ Servidor rodando na porta ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});
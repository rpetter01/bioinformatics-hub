// routes/auth.js - Versão corrigida 
const express = require('express');
const router = express.Router();  // Isso cria um router do Express
const { checkJwt } = require('../middleware/auth');

// Health check endpoint
router.get('/check', (req, res) => {
  res.json({ message: 'Auth route working' });
});

// Protected route example
router.get('/profile', checkJwt, (req, res) => {
  res.json({ message: 'Protected profile route', user: req.auth });
});

// Exportar o router corretamente como uma função
module.exports = router;  // Isso precisa ser um router Express
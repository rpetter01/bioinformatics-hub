// middleware/auth.js - Auth0 Authentication Middleware
const { auth } = require('express-oauth2-jwt-bearer');
const jwt = require('jsonwebtoken');
const jwksRsa = require('jwks-rsa');

// Auth0 configuration
const domain = process.env.AUTH0_DOMAIN;
const audience = process.env.AUTH0_AUDIENCE;

// Set up Auth0 middleware
const checkJwt = auth({
  audience: audience,
  issuerBaseURL: `https://${domain}/`,
  tokenSigningAlg: 'RS256'
});

// Middleware to check if user has admin role
const checkAdmin = async (req, res, next) => {
  try {
    // Get user permissions from Auth0
    const token = req.headers.authorization.split(' ')[1];
    
    // Set up JWT verification with JWKS
    const client = jwksRsa({
      jwksUri: `https://${domain}/.well-known/jwks.json`
    });
    
    // Get token header
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || !decoded.header || !decoded.header.kid) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Get signing key from Auth0
    const getKey = (header, callback) => {
      client.getSigningKey(header.kid, (err, key) => {
        if (err) return callback(err);
        const signingKey = key.publicKey || key.rsaPublicKey;
        callback(null, signingKey);
      });
    };
    
    // Verify token and check permissions
    jwt.verify(token, getKey, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      
      // Check if user has admin role
      // Auth0 puts roles in permissions claim
      const permissions = decoded.permissions || [];
      const isAdmin = permissions.includes('admin:all');
      
      if (!isAdmin) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      // User is admin, proceed to route
      next();
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = {
  checkJwt,
  checkAdmin
};
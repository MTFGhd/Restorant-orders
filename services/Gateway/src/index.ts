import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT ?? 8000);
const JWT_SECRET = process.env.JWT_SECRET ?? '';

if (!JWT_SECRET) {
  console.error('JWT_SECRET est requis pour la Gateway.');
  process.exit(1);
}

const rawOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost').trim();
const allowAllOrigins = rawOrigins === '*';
const allowedOrigins = rawOrigins
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      if (allowAllOrigins) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Origine non autorisee par CORS.'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

const publicPrefixes = ['/api/auth', '/health'];

app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }

  if (publicPrefixes.some((prefix) => req.path.startsWith(prefix))) {
    return next();
  }

  const authHeader = req.headers.authorization ?? '';
  const [scheme, token] = authHeader.split(' ');

  if (!token || scheme.toLowerCase() !== 'bearer') {
    return res.status(401).json({ message: 'Token manquant.' });
  }

  try {
    jwt.verify(token, JWT_SECRET);
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide.' });
  }
});

app.get('/health', (_req, res) => {
  res.json({ statut: 'OK', service: 'api-gateway' });
});

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL ?? 'http://auth-service:3001';
const MENU_SERVICE_URL = process.env.MENU_SERVICE_URL ?? 'http://menu-service:3002';
const CUISINE_SERVICE_URL = process.env.CUISINE_SERVICE_URL ?? 'http://cuisine-service:3003';

const createProxy = (target: string) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    xfwd: true
  });

app.use('/api/auth', createProxy(AUTH_SERVICE_URL));
app.use('/api/menu', createProxy(MENU_SERVICE_URL));
app.use('/api/categories', createProxy(MENU_SERVICE_URL));
app.use('/api/commandes', createProxy(MENU_SERVICE_URL));
app.use('/api/cuisine', createProxy(CUISINE_SERVICE_URL));

app.listen(PORT, () => {
  console.log(`API Gateway demarree sur le port ${PORT}`);
});

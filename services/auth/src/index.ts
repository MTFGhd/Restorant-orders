import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connecterBD from './config/db';
import routesAuth from './routes/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Intergiciels
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', routesAuth);

// Vérification de santé
app.get('/health', (_req, res) => {
  res.json({ statut: 'OK', service: 'service-auth' });
});

// Démarrage du serveur
const demarrer = async () => {
  await connecterBD();
  app.listen(PORT, () => {
    console.log(`🔐 Service Auth démarré sur le port ${PORT}`);
  });
};

demarrer();

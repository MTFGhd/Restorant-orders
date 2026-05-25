import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connecterBD from './config/db.js';
import routesMenu from './routes/menu.js';
import routesCategories from './routes/categories.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Intergiciels
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/menu', routesMenu);
app.use('/api/categories', routesCategories);

// Vérification de santé
app.get('/health', (_req, res) => {
  res.json({ statut: 'OK', service: 'service-menu' });
});

// Démarrage du serveur
const demarrer = async () => {
  await connecterBD();
  app.listen(PORT, () => {
    console.log(`🍽️  Service Menu démarré sur le port ${PORT}`);
  });
};

demarrer();

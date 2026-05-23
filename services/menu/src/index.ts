import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connecterBD from './config/db';
import { connecterRabbitMQ } from './config/rabbitmq';
import routesMenu from './routes/menu';
import routesCategories from './routes/categories';
import routesCommandes from './routes/commandes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Intergiciels
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/menu', routesMenu);
app.use('/api/categories', routesCategories);
app.use('/api/commandes', routesCommandes);

// Vérification de santé
app.get('/health', (_req, res) => {
  res.json({ statut: 'OK', service: 'service-menu' });
});

// Démarrage du serveur
const demarrer = async () => {
  await connecterBD();
  await connecterRabbitMQ();
  app.listen(PORT, () => {
    console.log(`🍽️  Service Menu démarré sur le port ${PORT}`);
  });
};

demarrer();

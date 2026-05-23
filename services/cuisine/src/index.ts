import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connecterBD from './config/db';
import { connecterRabbitMQ } from './config/rabbitmq';
import routesCuisine from './routes/cuisine';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// Intergiciels
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/cuisine', routesCuisine);

// Vérification de santé
app.get('/health', (_req, res) => {
  res.json({ statut: 'OK', service: 'service-cuisine' });
});

// Démarrage du serveur
const demarrer = async () => {
  await connecterBD();
  await connecterRabbitMQ();
  app.listen(PORT, () => {
    console.log(`👨‍🍳 Service Cuisine démarré sur le port ${PORT}`);
  });
};

demarrer();

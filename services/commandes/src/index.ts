import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import connecterBD from './config/db';
import { connecterRabbitMQ } from './config/rabbitmq';
import routesCommandes from './routes/commandes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

app.use('/api/commandes', routesCommandes);

app.get('/health', (_req, res) => {
  res.json({ statut: 'OK', service: 'service-commandes' });
});

const demarrer = async () => {
  await connecterBD();
  await connecterRabbitMQ();
  app.listen(PORT, () => {
    console.log(`Service Commandes demarre sur le port ${PORT}`);
  });
};

demarrer();

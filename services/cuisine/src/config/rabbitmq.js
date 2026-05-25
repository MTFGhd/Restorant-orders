import CommandeCuisine from '../models/CuisineOrder.js';
import { createRabbitMQConsumer } from 'rabbitmq-client';
import { StatutLigneCommande, StatutCommande } from 'shared-types';

let consumer = null;

const NOM_FILE = 'cuisine_orders';

const traiterMessageCommande = async (donneesCommande) => {
  console.log(
    `Commande recue - Table ${donneesCommande.numeroTable}, ID: ${donneesCommande.idCommande}`
  );

  const commandeCuisine = await CommandeCuisine.create({
    idCommande: donneesCommande.idCommande,
    numeroTable: donneesCommande.numeroTable,
    serveurId: donneesCommande.serveurId,
    serveurNom: donneesCommande.serveurNom,
    lignes: donneesCommande.lignes.map((ligne) => ({
      platId: ligne.platId,
      nom: ligne.nom,
      prix: ligne.prix,
      quantite: ligne.quantite,
      statut: StatutLigneCommande.EN_ATTENTE,
      notes: ligne.notes,
    })),
    statut: StatutCommande.EN_ATTENTE,
    total: donneesCommande.total,
    commandeRecueA: new Date(),
  });

  console.log(`Commande enregistree en cuisine - ID: ${commandeCuisine._id}`);
};

export const connecterRabbitMQ = async () => {
  consumer = await createRabbitMQConsumer(
    {
      queueName: NOM_FILE,
      url: process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672',
      logPrefix: 'Service Cuisine',
      prefetch: 1,
    },
    traiterMessageCommande
  );
};

export const fermerRabbitMQ = async () => {
  if (!consumer) return;
  await consumer.close();
};

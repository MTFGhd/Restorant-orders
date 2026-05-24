import CommandeCuisine from '../models/CuisineOrder';
import { createRabbitMQConsumer, RabbitMQConsumer } from 'rabbitmq-client';
import { MessageCommande, StatutLigneCommande, StatutCommande } from 'shared-types';

let consumer: RabbitMQConsumer | null = null;

const NOM_FILE = 'cuisine_orders';

const traiterMessageCommande = async (donneesCommande: MessageCommande): Promise<void> => {
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

export const connecterRabbitMQ = async (): Promise<void> => {
  consumer = await createRabbitMQConsumer<MessageCommande>(
    {
      queueName: NOM_FILE,
      url: process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672',
      logPrefix: 'Service Cuisine',
      prefetch: 1,
    },
    traiterMessageCommande
  );
};

export const fermerRabbitMQ = async (): Promise<void> => {
  if (!consumer) return;
  await consumer.close();
};

import amqplib, { ConsumeMessage } from 'amqplib';
import CommandeCuisine from '../models/CuisineOrder';
import { MessageCommande, StatutArticle, StatutCommande } from 'shared-types';

let connexion: Awaited<ReturnType<typeof amqplib.connect>> | null = null;
let canal: Awaited<ReturnType<Awaited<ReturnType<typeof amqplib.connect>>['createChannel']>> | null = null;

const NOM_FILE = 'cuisine_orders';

/**
 * Traitement d'un message reçu de la file
 */
const traiterMessageCommande = async (msg: ConsumeMessage | null): Promise<void> => {
  if (!msg || !canal) return;

  try {
    const donneesCommande: MessageCommande = JSON.parse(msg.content.toString());
    console.log(`📥 Commande reçue — Table ${donneesCommande.numeroTable}, ID: ${donneesCommande.idCommande}`);

    // Sauvegarder la commande dans la base cuisine
    const commandeCuisine = await CommandeCuisine.create({
      idCommande: donneesCommande.idCommande,
      numeroTable: donneesCommande.numeroTable,
      serveurId: donneesCommande.serveurId,
      serveurNom: donneesCommande.serveurNom,
      articles: donneesCommande.articles.map((article) => ({
        platId: article.platId,
        nom: article.nom,
        prix: article.prix,
        quantite: article.quantite,
        statut: StatutArticle.EN_ATTENTE,
        notes: article.notes,
      })),
      statut: StatutCommande.EN_ATTENTE,
      total: donneesCommande.total,
      commandeRecueA: new Date(),
    });

    console.log(`✅ Commande enregistrée en cuisine — ID: ${commandeCuisine._id}`);

    // Acquitter le message
    canal.ack(msg);
  } catch (erreur) {
    console.error('❌ Erreur lors du traitement du message:', erreur);
    // Rejeter et ne pas remettre en file en cas d'erreur
    canal.nack(msg, false, false);
  }
};

/**
 * Connexion à RabbitMQ et démarrage de la consommation
 */
export const connecterRabbitMQ = async (): Promise<void> => {
  const url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
  const maxTentatives = 10;
  let tentatives = 0;

  while (tentatives < maxTentatives) {
    try {
      connexion = await amqplib.connect(url);
      canal = await connexion.createChannel();
      await canal.assertQueue(NOM_FILE, { durable: true });

      // Limiter à 1 message à la fois pour un traitement ordonné
      await canal.prefetch(1);

      // Démarrer la consommation
      await canal.consume(NOM_FILE, traiterMessageCommande);

      console.log('✅ Service Cuisine — RabbitMQ connecté, en écoute sur:', NOM_FILE);
      return;
    } catch (erreur) {
      tentatives++;
      console.log(`⏳ RabbitMQ non disponible, tentative ${tentatives}/${maxTentatives}...`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  console.error('❌ Impossible de se connecter à RabbitMQ après', maxTentatives, 'tentatives');
  process.exit(1);
};

/**
 * Ferme la connexion RabbitMQ
 */
export const fermerRabbitMQ = async (): Promise<void> => {
  try {
    if (canal) await canal.close();
    if (connexion) await connexion.close();
    console.log('🔌 RabbitMQ déconnecté');
  } catch (erreur) {
    console.error('❌ Erreur lors de la fermeture RabbitMQ:', erreur);
  }
};

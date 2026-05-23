import amqplib from 'amqplib';

let connexion: Awaited<ReturnType<typeof amqplib.connect>> | null = null;
let canal: Awaited<ReturnType<Awaited<ReturnType<typeof amqplib.connect>>['createChannel']>> | null = null;

const NOM_FILE = 'cuisine_orders';

/**
 * Connexion à RabbitMQ avec réessai
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
      console.log('✅ Service Menu — RabbitMQ connecté');
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
 * Publie un message dans la file cuisine_orders
 */
export const publierDansFile = async (message: object): Promise<boolean> => {
  if (!canal) {
    console.error('❌ Canal RabbitMQ non initialisé');
    return false;
  }

  try {
    const succes = canal.sendToQueue(
      NOM_FILE,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );
    console.log('📤 Message publié dans la file:', NOM_FILE);
    return succes;
  } catch (erreur) {
    console.error('❌ Erreur lors de la publication:', erreur);
    return false;
  }
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

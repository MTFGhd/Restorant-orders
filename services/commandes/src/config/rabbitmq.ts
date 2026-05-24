import { createRabbitMQPublisher, RabbitMQPublisher } from 'rabbitmq-client';

const NOM_FILE = 'cuisine_orders';
let publisher: RabbitMQPublisher | null = null;

export const connecterRabbitMQ = async (): Promise<void> => {
  publisher = await createRabbitMQPublisher({
    queueName: NOM_FILE,
    url: process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672',
    logPrefix: 'Service Commandes',
  });
};

export const publierDansFile = async (message: object): Promise<boolean> => {
  if (!publisher) {
    console.error('RabbitMQ non initialise');
    return false;
  }

  return publisher.publish(message);
};

export const fermerRabbitMQ = async (): Promise<void> => {
  if (!publisher) return;
  await publisher.close();
};

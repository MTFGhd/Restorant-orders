import amqplib, { Channel, Connection, ConsumeMessage } from 'amqplib';

export interface RabbitMQBaseOptions {
  url?: string;
  queueName: string;
  logPrefix?: string;
  maxRetries?: number;
  retryDelayMs?: number;
}

export interface RabbitMQConsumerOptions extends RabbitMQBaseOptions {
  prefetch?: number;
  requeueOnError?: boolean;
}

export type RabbitMQMessageHandler<T> = (
  message: T,
  raw: ConsumeMessage
) => Promise<void> | void;

export interface RabbitMQPublisher {
  publish: (message: object) => Promise<boolean>;
  close: () => Promise<void>;
}

export interface RabbitMQConsumer {
  close: () => Promise<void>;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const connectWithRetry = async (
  options: RabbitMQBaseOptions
): Promise<{ connection: Connection; channel: Channel }> => {
  const url = options.url || 'amqp://rabbitmq:5672';
  const maxRetries = options.maxRetries ?? 10;
  const retryDelayMs = options.retryDelayMs ?? 5000;
  const prefix = options.logPrefix ? `${options.logPrefix} - ` : '';

  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      const connection = await amqplib.connect(url);
      const channel = await connection.createChannel();
      await channel.assertQueue(options.queueName, { durable: true });
      console.log(`${prefix}RabbitMQ connecte`);
      return { connection, channel };
    } catch (error) {
      attempts += 1;
      console.log(
        `${prefix}RabbitMQ non disponible, tentative ${attempts}/${maxRetries}...`
      );
      await sleep(retryDelayMs);
    }
  }

  console.error(`${prefix}Impossible de se connecter a RabbitMQ`);
  process.exit(1);
};

export const createRabbitMQPublisher = async (
  options: RabbitMQBaseOptions
): Promise<RabbitMQPublisher> => {
  const { connection, channel } = await connectWithRetry(options);
  const prefix = options.logPrefix ? `${options.logPrefix} - ` : '';

  return {
    publish: async (message: object) => {
      try {
        const success = channel.sendToQueue(
          options.queueName,
          Buffer.from(JSON.stringify(message)),
          { persistent: true }
        );
        console.log(`${prefix}Message publie dans la file: ${options.queueName}`);
        return success;
      } catch (error) {
        console.error(`${prefix}Erreur lors de la publication:`, error);
        return false;
      }
    },
    close: async () => {
      await channel.close();
      await connection.close();
      console.log(`${prefix}RabbitMQ deconnecte`);
    },
  };
};

export const createRabbitMQConsumer = async <T>(
  options: RabbitMQConsumerOptions,
  handler: RabbitMQMessageHandler<T>
): Promise<RabbitMQConsumer> => {
  const { connection, channel } = await connectWithRetry(options);
  const prefix = options.logPrefix ? `${options.logPrefix} - ` : '';
  const requeueOnError = options.requeueOnError ?? false;

  if (options.prefetch) {
    await channel.prefetch(options.prefetch);
  }

  await channel.consume(options.queueName, async (msg) => {
    if (!msg) return;

    try {
      const payload = JSON.parse(msg.content.toString()) as T;
      await handler(payload, msg);
      channel.ack(msg);
    } catch (error) {
      console.error(`${prefix}Erreur lors du traitement:`, error);
      channel.nack(msg, false, requeueOnError);
    }
  });

  console.log(`${prefix}RabbitMQ en ecoute sur: ${options.queueName}`);

  return {
    close: async () => {
      await channel.close();
      await connection.close();
      console.log(`${prefix}RabbitMQ deconnecte`);
    },
  };
};

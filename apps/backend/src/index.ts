import { buildApp } from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';

async function main() {
  const app = await buildApp();

  await connectDatabase();
  app.log.info('[APIForge] Database connected');

  const gracefulShutdown = async (signal: string) => {
    app.log.info(`[APIForge] Received ${signal}, shutting down gracefully...`);
    await app.close();
    await disconnectDatabase();
    app.log.info('[APIForge] Goodbye.');
    process.exit(0);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  try {
    await app.listen({ port: env.PORT, host: env.HOST });
    app.log.info(`[APIForge] Server running on http://${env.HOST}:${env.PORT}`);
  } catch (error) {
    app.log.error(error);
    await disconnectDatabase();
    process.exit(1);
  }
}

main();

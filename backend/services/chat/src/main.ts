import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("Bootstrap");

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableCors({ credentials: true });

  const port = process.env.SERVICE_PORT || 3006;
  await app.listen(port);
  logger.log(`Chat Service running on port ${port}`);
}

bootstrap().catch((err) => {
  console.error("Failed to start Chat Service:", err);
  process.exit(1);
});

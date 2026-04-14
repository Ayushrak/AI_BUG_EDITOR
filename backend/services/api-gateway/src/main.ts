import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("Bootstrap");

  // Validation
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(",") || ["*"],
    credentials: true,
  });

  const port = process.env.API_GATEWAY_PORT || 3000;
  await app.listen(port);
  logger.log(`API Gateway running on port ${port}`);
}

bootstrap().catch((err) => {
  console.error("Failed to start API Gateway:", err);
  process.exit(1);
});

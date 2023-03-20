import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
    app.enableCors({
        origin: true,
        //preflightContinue: true,
        methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE'],
        optionsSuccessStatus: 200,
    })
  await app.listen(8000)
}
bootstrap().then()

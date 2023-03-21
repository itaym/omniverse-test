import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

    const config = new DocumentBuilder()
        .setTitle('Omnivers')
        .setDescription('The todos API description')
        .build()
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document)

    app.enableCors({
        origin: true,
        //preflightContinue: true,
        methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE'],
        optionsSuccessStatus: 200,
    })
  await app.listen(8000)
}
bootstrap().then()

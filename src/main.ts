import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'
import helmet from 'helmet'
import compression from 'compression'

async function bootstrap() {
    const app = await NestFactory.create(AppModule)

    // Seguridad
    app.use(helmet())
    app.use(compression())

    // CORS — solo permite el frontend
    app.enableCors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    })

    // Validación global de DTOs
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,    // elimina campos no declarados en el DTO
        forbidNonWhitelisted: true,
        transform: true,    // convierte tipos automáticamente
        transformOptions: { enableImplicitConversion: true },
    }))

    // Prefijo global de API
    app.setGlobalPrefix('api/v1')

    await app.listen(process.env.PORT ?? 3001)
    console.log(`API corriendo en: http://localhost:${process.env.PORT ?? 3001}/api/v1`)
}

bootstrap()
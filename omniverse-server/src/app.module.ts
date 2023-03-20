import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Todo } from './entities/todo.entity'

@Module({
    imports: [TypeOrmModule.forRoot(
        {
            type: 'mysql',
            host: 'localhost',
            port: 3306,
            username: 'Itaymer',
            password: 'vCdGUL22',
            database: 'omniverse',
            entities: [Todo],
            synchronize: false,
            migrationsRun: true,
            // logging: true
        }),
        TypeOrmModule.forFeature([Todo])
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}

import {Module} from '@nestjs/common';

import {AppController} from './app.controller';
import {AppService} from './app.service';
import {CurrentDateGenerator} from './adapters/current-date-generator';
import {RandomIdGenerator} from './adapters/random-id-generator';
import {I_USER_REPOSITORY} from '../users/adapters/in-memory-user-repository';
import {Authenticator} from '../users/services/authenticator';
import {APP_GUARD} from '@nestjs/core';
import {AuthGuard} from './auth.guard';
import {WebinarModule} from '../webinars/webinar.module';
import {CommonModule} from './common.module';
import {UsersModule} from '../users/user.module';
import {MongooseModule} from '@nestjs/mongoose';
import {ConfigModule, ConfigService} from '@nestjs/config';

@Module({
    imports: [
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => {
                return {
                    uri: config.get<string>('DB'),
                };
            }
        }),
        WebinarModule, UsersModule, CommonModule
    ],

    controllers: [AppController],
    providers: [
        AppService,
        CurrentDateGenerator,
        RandomIdGenerator,
        {
            provide: Authenticator,
            inject: [I_USER_REPOSITORY],
            useFactory: (userRepository) => {
                return new Authenticator(userRepository);
            }
        },
        {
            provide: APP_GUARD,
            inject: [Authenticator],
            useFactory: (authenticator) => {
                return new AuthGuard(authenticator);
            }
        },
    ],
})
export class AppModule {}

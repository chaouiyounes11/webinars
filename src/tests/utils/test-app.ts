import {INestApplication} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import {AppModule} from '../../core/app.module';
import {IFixture} from './fixture';
import {ConfigModule} from '@nestjs/config';
import {Model} from 'mongoose';
import {MongoUser} from '../../users/adapters/mongo/mongo-user';
import {getModelToken} from '@nestjs/mongoose';
import {MongoWebinar} from '../../webinars/adapters/mongo/mongo-webinar';
import {
    MongoParticipation
} from '../../webinars/adapters/mongo/mongo-participation';

export class TestApp {
    private app: INestApplication;

    async setup() {
        const module = await Test.createTestingModule({
            imports: [
                AppModule,
                ConfigModule.forRoot({
                    ignoreEnvFile: true,
                    ignoreEnvVars: true,
                    isGlobal: true,
                    load: [
                        () => ({DATABASE_URL: 'mongodb+srv://YounesRun:Younes0802.@cluster0.wg6oytc.mongodb.net/webinar?retryWrites=true&w=majority'})
                    ],
                })
            ]
        }).compile();
        this.app = module.createNestApplication();
        await this.app.init();
        await this.clearDataBase();
    }

    loadFixtures(fixture: IFixture[]) {
        return Promise.all(fixture.map(f => f.load(this)));
    }

    async cleanup() {
        await this.app.close();
    }

    get<T>(name: any) {
        return this.app.get<T>(name);
    }

    getHttpServer() {
        return this.app.getHttpServer();
    }

    private async clearDataBase() {
        await this.app
            .get<Model<MongoUser.SchemaClass>>(getModelToken(MongoUser.collectionName))
            .deleteMany({});

        await this.app
            .get<Model<MongoWebinar.SchemaClass>>(getModelToken(MongoWebinar.collectionName))
            .deleteMany({});

        await this.app
            .get<Model<MongoParticipation.SchemaClass>>(getModelToken(MongoParticipation.collectionName))
            .deleteMany({});
    }

}


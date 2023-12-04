import {Module} from '@nestjs/common';
import {I_USER_REPOSITORY} from './adapters/in-memory-user-repository';
import {getModelToken, MongooseModule} from '@nestjs/mongoose';
import {MongoUser} from './adapters/mongo/mongo-user';
import {MongoUserRepository} from './adapters/mongo/mongo-user-repository';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: MongoUser.collectionName,
                schema: MongoUser.Schema
            }
        ])
    ],
    providers: [
        {
            provide: I_USER_REPOSITORY,
            inject: [getModelToken(MongoUser.collectionName)],
            useFactory: (model) => {
                return new MongoUserRepository(model);
            }
        },
    ],
    exports: [I_USER_REPOSITORY],
})
export class UsersModule {}

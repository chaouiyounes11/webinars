import {Module} from '@nestjs/common';
import {I_WEBINAR_REPOSITORY} from './adapters/in-memory-webinar-repository';
import {OrganizeWebinar} from './usecases/organize-webinar/organize-webinar';
import {I_ID_GENERATOR} from '../core/adapters/random-id-generator';
import {I_DATE_GENERATOR} from '../core/adapters/current-date-generator';
import {WebinarController} from './controllers/webinar.controller';
import {CommonModule} from '../core/common.module';
import {ChangeSeats} from './usecases/change-seats-webinar/change-seats';
import {ChangeDates} from './usecases/change-date-webinar/change-dates';

import {I_MAILER} from '../core/ports/mailer.interface';
import {I_USER_REPOSITORY} from '../users/adapters/in-memory-user-repository';
import {
    I_PARTICIPATION_REPOSITORY
} from './ports/participation-repository.interface';
import {UsersModule} from '../users/user.module';
import {CancelWebinar} from './usecases/cancel-webinar/cancel-webinar';
import {
    ParticipationsController
} from './controllers/participations.controller';
import {ReserveSeats} from './usecases/reserve-seats-webinar/reserve-seats';
import {CancelSeat} from './usecases/cancel-seat-webinar/cancel-seat';
import {getModelToken, MongooseModule} from '@nestjs/mongoose';
import {MongoWebinar} from './adapters/mongo/mongo-webinar';
import {
    MongoWebinarRepository
} from './adapters/mongo/mongo-webinar-repository';
import {MongoParticipation} from './adapters/mongo/mongo-participation';
import {
    MongoParticipationRepository
} from './adapters/mongo/mongo-participation-repository';
import {ChangeTitle} from './usecases/change-title-webinar/change-title';

@Module({
    imports: [
        CommonModule,
        UsersModule,
        MongooseModule.forFeature([
            {
                name: MongoWebinar.collectionName,
                schema: MongoWebinar.Schema
            },
            {
                name: MongoParticipation.collectionName,
                schema: MongoParticipation.Schema
            },
        ])
    ],
    controllers: [WebinarController, ParticipationsController],
    providers: [
        {
            provide: I_WEBINAR_REPOSITORY,
            inject: [getModelToken(MongoWebinar.collectionName)],
            useFactory: (model) => {
                return new MongoWebinarRepository(model);
            }
        },
        {
            provide: I_PARTICIPATION_REPOSITORY,
            inject: [getModelToken(MongoParticipation.collectionName)],
            useFactory: (model) => {
                return new MongoParticipationRepository(model);
            }
        },
        {
            provide: OrganizeWebinar,
            inject: [I_WEBINAR_REPOSITORY, I_ID_GENERATOR, I_DATE_GENERATOR],
            useFactory: (webinarRepository, idGenerator, dateGenerator) => {
                return new OrganizeWebinar(webinarRepository, idGenerator, dateGenerator);
            }
        },
        {
            provide: ChangeSeats,
            inject: [I_WEBINAR_REPOSITORY],
            useFactory: (webinarRepository) => {
                return new ChangeSeats(webinarRepository);
            }
        },
        {
            provide: ChangeTitle,
            inject: [I_WEBINAR_REPOSITORY],
            useFactory: (webinarRepository) => {
                return new ChangeTitle(webinarRepository);
            }
        },
        {
            provide: ChangeDates,
            inject: [I_WEBINAR_REPOSITORY, I_DATE_GENERATOR, I_PARTICIPATION_REPOSITORY, I_MAILER, I_USER_REPOSITORY],
            useFactory: (webinarRepository, dateGenerator, participationRepository, mailer, userRepository) => {
                return new ChangeDates(webinarRepository, dateGenerator, participationRepository, mailer, userRepository);
            }
        },
        {
            provide: CancelWebinar,
            inject: [I_WEBINAR_REPOSITORY, I_MAILER, I_PARTICIPATION_REPOSITORY, I_USER_REPOSITORY],
            useFactory: (webinarRepository, mailer, participationRepository, userRepository) => {
                return new CancelWebinar(webinarRepository, mailer, participationRepository, userRepository);
            }
        },
        {
            provide: ReserveSeats,
            inject: [I_PARTICIPATION_REPOSITORY, I_MAILER, I_WEBINAR_REPOSITORY, I_USER_REPOSITORY],
            useFactory: (participationRepository, mailer, webinarRepository, userRepository) => {
                return new ReserveSeats(participationRepository, mailer, webinarRepository, userRepository);
            }

        },
        {
            provide: CancelSeat,
            inject: [I_PARTICIPATION_REPOSITORY, I_USER_REPOSITORY, I_WEBINAR_REPOSITORY, I_MAILER],
            useFactory: (participationRepository, userRepository, webinarRepository, mailer) => {
                return new CancelSeat(participationRepository, userRepository, webinarRepository, mailer);
            }
        }
    ],
    exports: [I_WEBINAR_REPOSITORY],
})
export class WebinarModule {}


import {MongoParticipationRepository} from './mongo-participation-repository';
import {TestApp} from '../../../tests/utils/test-app';
import {Model} from 'mongoose';
import {MongoParticipation} from './mongo-participation';
import {Participation} from '../../entities/participation.entity';
import {getModelToken} from '@nestjs/mongoose';

describe('MongoParticipationRepository', () => {
    let app: TestApp;
    let repository: MongoParticipationRepository;
    let model: Model<MongoParticipation.SchemaClass>;

    const createParticipationInDb = async (participation: Participation) => {
        const record = new model({
            _id: MongoParticipation.SchemaClass.makeId(participation),
            webinarId: participation.props.webinarId,
            userId: participation.props.userId,
        });

        await record.save();
    };

    const savedParticipation = new Participation({
        webinarId: 'webinar-1',
        userId: 'user-1',
    });

    beforeEach(async () => {
        app = new TestApp();
        await app.setup();
        model = app.get<Model<MongoParticipation.SchemaClass>>(getModelToken(MongoParticipation.collectionName));
        repository = new MongoParticipationRepository(model);
        await createParticipationInDb(savedParticipation);
    });

    describe('findOne', () => {
        it('should find the participation', async () => {
            const participation = await repository.findOne(savedParticipation.props.userId, savedParticipation.props.webinarId);
            expect(participation!.props).toEqual(savedParticipation.props);
        });

        it('should return null', async () => {
            const participation = await repository.findOne('no-user', 'no-webinar');
            expect(participation).toBeNull();
        });
    })
    describe('findByWebinarId', () => {
        it('should find all participations', async () => {
            const participation = await repository.findByWebinarId(savedParticipation.props.webinarId);
            expect(participation).toHaveLength(1);
            expect(participation[0].props).toEqual(savedParticipation.props);
        });
    })
    describe('findByParticipationCount', () => {
        it('should return number of participations', async () => {
            const participation = await repository.findParticipationCount(savedParticipation.props.webinarId);
            expect(participation).toBe(1);
        });
    })
    describe('delete', () => {
        it('should delete participation', async () => {
            await repository.delete(savedParticipation);
            const record = await model.findOne({
                userId: savedParticipation.props.userId,
                webinarId: savedParticipation.props.webinarId,
            });
            expect(record).toBeNull();
        });
    })
    describe('create', () => {
        it('should create participation', async () => {
            const participation = new Participation({
                webinarId: 'webinar-2',
                userId: 'user-2',
            });

            await repository.create(participation);

            const record = await model.findOne({
                userId: participation.props.userId,
                webinarId: participation.props.webinarId,
            });

            expect(record!.toObject()).toEqual({
                __v: 0,
                _id: MongoParticipation.SchemaClass.makeId(participation),
                userId: participation.props.userId,
                webinarId: participation.props.webinarId,
            });
        });
    })

    afterEach(async () => {
        await app.cleanup();
    });

});

import {TestApp} from '../../../tests/utils/test-app';
import {Model} from 'mongoose';
import {getModelToken} from '@nestjs/mongoose';
import {MongoWebinar} from './mongo-webinar';
import {MongoWebinarRepository} from './mongo-webinar-repository';
import {Webinar} from '../../entities/webinar.entity';

const cleanArchitectureWebinar = new Webinar({
    id: 'clean-architecture-id',
    title: 'title',
    organizerId: 'organizerId',
    seats: 10,
    startDate: new Date('2023-01-01T00:00:00.000Z'),
    endDate: new Date('2023-01-01T01:00:00.000Z'),
});
const cqrsWebinar = new Webinar({
    id: 'cqrs-id',
    title: 'CQRS',
    organizerId: 'organizerId',
    seats: 10,
    startDate: new Date('2023-01-01T00:00:00.000Z'),
    endDate: new Date('2023-01-01T01:00:00.000Z'),
});
describe('MongoWebinarRepository', () => {
    let app: TestApp;
    let model: Model<MongoWebinar.SchemaClass>
    let repository: MongoWebinarRepository;

    const createWebinarInDb = async (webinar: Webinar) => {
        const record = new model({
            _id: webinar.props.id,
            title: webinar.props.title,
            organizerId: webinar.props.organizerId,
            seats: webinar.props.seats,
            startDate: webinar.props.startDate,
            endDate: webinar.props.endDate,
        });

        await record.save();
    }
    beforeEach(async () => {
        app = new TestApp();
        await app.setup();
        model = app.get<Model<MongoWebinar.SchemaClass>>(getModelToken(MongoWebinar.collectionName));

        repository = new MongoWebinarRepository(model);

        await createWebinarInDb(cleanArchitectureWebinar);
    });

    describe('findById', () => {
        it('should find the webinar corresponding to the id', async () => {
            const webinar = await repository.findById(cleanArchitectureWebinar.props.id);
            expect(webinar!.props).toEqual(cleanArchitectureWebinar.props);
        });

        it('should return null if id does not exist', async () => {
            const webinar = await repository.findById('no-id');
            expect(webinar).toEqual(null);
        });
    });
    describe('create', () => {
        it('should create the webinar', async () => {
            await repository.create(cqrsWebinar);

            const record = await model.findById(cqrsWebinar.props.id);

            expect(record?.toObject()).toEqual({
                __v: 0,
                _id: cqrsWebinar.props.id,
                title: cqrsWebinar.props.title,
                organizerId: cqrsWebinar.props.organizerId,
                seats: cqrsWebinar.props.seats,
                startDate: cqrsWebinar.props.startDate,
                endDate: cqrsWebinar.props.endDate,
            });
        });
    });
    describe('update', () => {
        it('should update the webinar', async () => {
            await createWebinarInDb(cqrsWebinar);
            const cqrsCopy = cqrsWebinar.clone() as Webinar;
            cqrsCopy.update(
                {
                    title: 'CQRS - Command Query Responsibility Segregation',
                    seats: 100,
                });
            await repository.update(cqrsCopy);

            const record = await model.findById(cqrsWebinar.props.id);

            expect(record?.toObject()).toEqual({
                __v: 0,
                _id: cqrsCopy.props.id,
                title: cqrsCopy.props.title,
                organizerId: cqrsCopy.props.organizerId,
                seats: cqrsCopy.props.seats,
                startDate: cqrsCopy.props.startDate,
                endDate: cqrsCopy.props.endDate,
            });
            expect(cqrsCopy.props).toEqual(cqrsCopy.initialState);
        });
    });
    describe('delete', () => {
        it('should delete the webinar', async () => {
            await repository.delete(cleanArchitectureWebinar);

            const record = await model.findById(cleanArchitectureWebinar.props.id);

            expect(record).toEqual(null);
        });
    });

    afterEach(async () => {
        await app.cleanup();
    });
});

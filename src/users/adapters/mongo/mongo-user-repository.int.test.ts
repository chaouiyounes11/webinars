import {TestApp} from '../../../tests/utils/test-app';
import {Model} from 'mongoose';
import {MongoUser} from './mongo-user';
import {MongoUserRepository} from './mongo-user-repository';
import {getModelToken} from '@nestjs/mongoose';
import {unitUsers} from '../../tests/user.seeds';
import {User} from '../../entities/user.entity';

describe('MongoUserRepository', () => {
    let app: TestApp;
    let model: Model<MongoUser.SchemaClass>
    let repository: MongoUserRepository;

    const createUserInDb = async (user: User) => {
        const record = new model({
            _id: user.props.id,
            emailAddress: user.props.emailAddress,
            password: user.props.password,
        });

        await record.save();
    }
    beforeEach(async () => {
        app = new TestApp();
        await app.setup();
        model = app.get<Model<MongoUser.SchemaClass>>(getModelToken(MongoUser.collectionName));

        repository = new MongoUserRepository(model);

        await createUserInDb(unitUsers.alice);
    });

    describe('FindByEmailAddress', () => {
        it('should find the user corresponding to the email address', async () => {

            const user = await repository.findByEmailAddress(unitUsers.alice.props.emailAddress);
            expect(user?.props).toEqual(unitUsers.alice.props);
        });

        it('should failed when address does not exist', async () => {

            const user = await repository.findByEmailAddress('no-email@gmail.com');
            expect(user).toEqual(null);
        });
        afterEach(async () => {
            await app.cleanup();
        })
    });
    describe('FindById', () => {
        it('should find the user corresponding to the id', async () => {

            const user = await repository.findById(unitUsers.alice.props.id);
            expect(user?.props).toEqual(unitUsers.alice.props);
        });

        it('should failed when address does not exist', async () => {

            const user = await repository.findByEmailAddress('no-id');
            expect(user).toEqual(null);
        });
        afterEach(async () => {
            await app.cleanup();
        })
    });
    describe('create', () => {
        it('should create an user', async () => {
            await repository.create(unitUsers.bob);
            const record = await model.findById(unitUsers.bob.props.id);
            expect(record!.toObject()).toEqual({
                __v: 0,
                _id: unitUsers.bob.props.id,
                emailAddress: unitUsers.bob.props.emailAddress,
                password: unitUsers.bob.props.password,
            });
        });

        it('should failed when address does not exist', async () => {

            const user = await repository.findByEmailAddress('no-id');
            expect(user).toEqual(null);
        });
        afterEach(async () => {
            await app.cleanup();
        });
    });
});

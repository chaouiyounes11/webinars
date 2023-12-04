import {OrganizeWebinar} from './organize-webinar';
import {
    InMemoryWebinarRepository
} from '../../adapters/in-memory-webinar-repository';
import {FixedIdGenerator} from '../../../core/adapters/fixed-id-generator';
import {Webinar} from '../../entities/webinar.entity';
import {FixedDateGenerator} from '../../../core/adapters/fixed-date-generator';
import {User} from '../../../users/entities/user.entity';

describe('Feature: Organizing webinars', () => {
    const expectedWebinarToEqual = (webinar: Webinar) => {
        expect(webinar.props).toEqual({
            id: 'id-1',
            organizerId: 'john-doe',
            title: 'My first webinars',
            startDate: new Date('2020-01-10T10:00:00.000Z'),
            endDate: new Date('2020-01-10T11:00:00.000Z'),
            seats: 10
        })
    };

    let repository: InMemoryWebinarRepository;
    let idGenerator: FixedIdGenerator;
    let dateGenerator: FixedDateGenerator;

    let useCase: OrganizeWebinar;
    const user = new User({
        id: 'john-doe',
        emailAddress: 'john@gmail.com',
        password: 'azerty'
    });

    beforeEach(() => {
        repository = new InMemoryWebinarRepository();
        idGenerator = new FixedIdGenerator();
        dateGenerator = new FixedDateGenerator();
        useCase = new OrganizeWebinar(repository, idGenerator, dateGenerator);
    })

    describe('Scenario: Happy path', () => {

        const payload = {
            user,
            title: 'My first webinars',
            startDate: new Date('2020-01-10T10:00:00.000Z'),
            endDate: new Date('2020-01-10T11:00:00.000Z'),
            seats: 10
        }
        it('should return the Id', async () => {
            const result = await useCase.execute(payload);

            expect(result.id).toEqual('id-1');
        });
        it('should insert the webinars into the database', async () => {
            await useCase.execute(payload);

            expect(repository.database.length).toBe(1);

            const createdWebinar = repository.database[0];
            expectedWebinarToEqual(createdWebinar);
        })
    });

    describe('Scenario: Webinar happens too soon', () => {

        const payload = {
            user,
            title: 'My first webinars',
            startDate: new Date('2020-01-01T10:00:00.000Z'),
            endDate: new Date('2020-01-01T11:00:00.000Z'),
            seats: 10
        }
        it('should throw an error', async () => {
            await expect(useCase.execute(payload)).rejects.toThrow('The webinar must happen in at least 3 days');
        });
        it('should not create a webinars', async () => {
            try {
                await expect(useCase.execute(payload)).rejects.toThrow();

            } catch (e) {}
            expect(repository.database.length).toBe(0);
        });
    });

    describe('Scenario: Webinar has too many seats', () => {

        const payload = {
            user,
            title: 'My first webinars',
            startDate: new Date('2020-01-05T10:00:00.000Z'),
            endDate: new Date('2020-01-01T11:00:00.000Z'),
            seats: 1001
        }
        it('should throw an error', async () => {
            await expect(useCase.execute(payload)).rejects.toThrow('The webinar cannot have more than 1000 seats');
        });

    });

    describe('Scenario: Webinar must have 1 participant at least', () => {

        const payload = {
            user,
            title: 'My first webinars',
            startDate: new Date('2020-01-05T10:00:00.000Z'),
            endDate: new Date('2020-01-01T11:00:00.000Z'),
            seats: 0
        }
        it('should throw an error', async () => {
            await expect(useCase.execute(payload)).rejects.toThrow('Webinar must have at least one participant');
        });

    });
});

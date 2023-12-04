import {ChangeSeats} from './change-seats';
import {Webinar} from '../../entities/webinar.entity';
import {
    InMemoryWebinarRepository
} from '../../adapters/in-memory-webinar-repository';
import {unitUsers} from '../../../users/tests/user.seeds';

describe('Feature: Change seats', () => {
    let useCase: ChangeSeats;
    let webinarRepository: InMemoryWebinarRepository;

    const expectNumberOfSeatsRemainUnchanged = () => {
        const webinar = webinarRepository.findByIdSync('id-1');
        expect(webinar!.props.seats).toEqual(50);
    }

    const [alice, bob] = [unitUsers.alice, unitUsers.bob]
    const webinar = new Webinar({
        id: 'id-1',
        organizerId: 'Alice',
        title: 'My first webinar',
        seats: 50,
        startDate: new Date('2023-01-01T10:00:00.000Z'),
        endDate: new Date('2023-01-01T11:00:00.000Z')
    });

    beforeEach(() => {

        webinarRepository = new InMemoryWebinarRepository([webinar]);
        useCase = new ChangeSeats(webinarRepository);
    });

    describe('Scenario: Happy path', () => {
        const payload = {
            user: alice,
            webinarId: 'id-1',
            seats: 100
        };
        it('should change the number of seats', async () => {
            await useCase.execute(payload);

            const webinar = await webinarRepository.findById('id-1');
            expect(webinar!.props.seats).toEqual(100);
        });
    });

    describe('Scenario: webinar does not exist', () => {
        const payload = {
            user: alice,
            webinarId: 'id-2',
            seats: 100
        }
        it('should reject', async () => {
            await expect(useCase.execute(payload)).rejects.toThrow('Webinar' +
                ' not found');
            expectNumberOfSeatsRemainUnchanged();
        });
    });

    describe('Scenario: webinar cannot be updated by another user', () => {
        const payload = {
            user: bob,
            webinarId: 'id-1',
            seats: 100
        }
        it('should reject', async () => {
            await expect(useCase.execute(payload)).rejects.toThrow('You are not allowed to update this webinar');
            expectNumberOfSeatsRemainUnchanged();
        });
    });

    describe('Scenario: seats cannot not be less than the initial number of' +
        ' seats', () => {
        const payload = {
            user: alice,
            webinarId: 'id-1',
            seats: 49
        }

        it('should reject', async () => {
            await expect(useCase.execute(payload)).rejects.toThrow('Seats' +
                ' cannot' +
                ' be decreased');
            expectNumberOfSeatsRemainUnchanged();
        });
    });

    describe('Scenario: decrease number of seats', () => {
        it('should reject', async () => {
            const payload = {
                user: alice,
                webinarId: 'id-1',
                seats: 49
            }
            await expect(useCase.execute(payload)).rejects.toThrow('Seats' +
                ' cannot be decreased');
            expectNumberOfSeatsRemainUnchanged();
        });
    });

    describe('Scenario: Webinar must have less than 1000 seats', () => {
        it('should reject', async () => {
            const payload = {
                user: alice,
                webinarId: 'id-1',
                seats: 1001
            }
            await expect(useCase.execute(payload)).rejects.toThrow('The webinar cannot have more than 1000 seats');
            expectNumberOfSeatsRemainUnchanged();
        });
    });

});

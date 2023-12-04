import {ReserveSeats} from './reserve-seats';
import {unitUsers} from '../../../users/tests/user.seeds';
import {
    InMemoryParticipationRepository
} from '../../adapters/in-memory-participation-repository';
import {Webinar} from '../../entities/webinar.entity';
import {InMemoryMailer} from '../../../core/adapters/in-memory-mailer';
import {
    InMemoryWebinarRepository
} from '../../adapters/in-memory-webinar-repository';
import {
    InMemoryUserRepository
} from '../../../users/adapters/in-memory-user-repository';
import {Participation} from '../../entities/participation.entity';

describe('Feature: Reserve seats for a webinar', () => {
    let useCase: ReserveSeats;
    let participationRepository: InMemoryParticipationRepository;
    let webinarRepository: InMemoryWebinarRepository;
    let userRepository: InMemoryUserRepository;
    let mailer: InMemoryMailer;

    const expectParticipationNotCreated = () => {
        const storedParticipant = participationRepository.findOneSync(unitUsers.bob.props.id, webinar.props.id);
        expect(storedParticipant).toBeNull();
    }

    const expectParticipationCreated = () => {
        const storedParticipant = participationRepository.findOneSync(unitUsers.bob.props.id, webinar.props.id);
        expect(storedParticipant).not.toBeNull();
    }

    const expectMailsHaveNotBeenSent = () => {
        expect(mailer.sentEmails[0]).toBeUndefined();
        expect(mailer.sentEmails[1]).toBeUndefined();
    }

    const webinar = new Webinar({
        id: 'id-1',
        organizerId: 'Alice',
        title: 'My first webinar',
        seats: 50,
        startDate: new Date('2023-01-01T10:00:00.000Z'),
        endDate: new Date('2023-01-01T11:00:00.000Z')
    });

    const webinarWithFewSeats = new Webinar({
        id: 'id-2',
        organizerId: 'Alice',
        title: 'My first webinar',
        seats: 1,
        startDate: new Date('2023-01-01T10:00:00.000Z'),
        endDate: new Date('2023-01-01T11:00:00.000Z')
    });

    const charlieParticipation = new Participation({
        userId: unitUsers.charlie.props.id,
        webinarId: webinarWithFewSeats.props.id,
    })

    beforeEach(async () => {
        participationRepository = new InMemoryParticipationRepository([charlieParticipation]);
        mailer = new InMemoryMailer();
        webinarRepository = new InMemoryWebinarRepository([webinar, webinarWithFewSeats]);
        userRepository = new InMemoryUserRepository([unitUsers.alice, unitUsers.bob, unitUsers.charlie]);
        useCase = new ReserveSeats(participationRepository, mailer, webinarRepository, userRepository);

    });

    describe('Scenario: Happy path', () => {
        const payload = {
            user: unitUsers.bob,
            webinarId: webinar.props.id,
        }
        it('should reserve seats', async () => {
            await useCase.execute(payload);
            expectParticipationCreated();
        });

        it('should send an email to the organizer', async () => {
            await useCase.execute(payload);

            expect(mailer.sentEmails[0]).toEqual(
                {
                    to: unitUsers.alice.props.emailAddress,
                    subject: 'New participant',
                    body: `${unitUsers.bob.props.id} has reserved a seat for your webinar "My first` +
                        ' webinar"'
                }
            );
        });

        it('should send an email to the user', async () => {
            await useCase.execute(payload);

            expect(mailer.sentEmails[1]).toEqual(
                {
                    to: unitUsers.bob.props.emailAddress,
                    subject: 'You have reserved a seat',
                    body: `You have reserved a seat for the webinar "${webinar.props.title}"`
                }
            );
        });

    });
    describe('Scenario: Webinar doest not exist', () => {
        const payload = {
            user: unitUsers.bob,
            webinarId: 'id-does-not-exist',
        }
        it('should failed', async () => {
            await expect(useCase.execute(payload)).rejects.toThrow('Webinar not found');

            expectParticipationNotCreated();
            expectMailsHaveNotBeenSent();
        });
    });

    describe('Scenario: There is no more seats', () => {
        const payload = {
            user: unitUsers.bob,
            webinarId: webinarWithFewSeats.props.id,
        }
        it('should failed', async () => {
            await expect(useCase.execute(payload)).rejects.toThrow('No more seats available');

            expectParticipationNotCreated();
            expectMailsHaveNotBeenSent();
        });
    });

    describe('Scenario: User already participate to this webinar', () => {
        const payload = {
            user: unitUsers.charlie,
            webinarId: webinarWithFewSeats.props.id,
        }
        it('should failed', async () => {
            await expect(useCase.execute(payload)).rejects.toThrow('You have already reserved a seat');

            expectParticipationNotCreated();
            expectMailsHaveNotBeenSent();
        });
    });
});

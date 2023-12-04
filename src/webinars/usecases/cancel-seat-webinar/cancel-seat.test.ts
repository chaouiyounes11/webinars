import {CancelSeat} from './cancel-seat';
import {
    InMemoryParticipationRepository
} from '../../adapters/in-memory-participation-repository';
import {unitUsers} from '../../../users/tests/user.seeds';
import {Webinar} from '../../entities/webinar.entity';
import {Participation} from '../../entities/participation.entity';
import {
    InMemoryWebinarRepository
} from '../../adapters/in-memory-webinar-repository';
import {
    InMemoryUserRepository
} from '../../../users/adapters/in-memory-user-repository';
import {InMemoryMailer} from '../../../core/adapters/in-memory-mailer';

describe('Feature: Cancel seat webinar', () => {
    let useCase: CancelSeat;
    let userRepository: InMemoryUserRepository;
    let mailer: InMemoryMailer;
    let webinarRepository: InMemoryWebinarRepository;
    let participationRepository: InMemoryParticipationRepository;

    const expectParticipantNotToBeDeleted = () => {
        const storedParticipation = participationRepository.findOneSync(unitUsers.bob.props.id, webinar.props.id);
        expect(storedParticipation).not.toBeNull();
    };

    const expectParticipantToBeDeleted = () => {
        const storedParticipation = participationRepository.findOneSync(unitUsers.bob.props.id, webinar.props.id);
        expect(storedParticipation).toBeNull();
    }

    const webinar = new Webinar({
        id: 'id-1',
        organizerId: 'Alice',
        title: 'My first webinar',
        seats: 50,
        startDate: new Date('2023-01-01T10:00:00.000Z'),
        endDate: new Date('2023-01-01T11:00:00.000Z')
    });

    const bobParticipation = new Participation({
        userId: unitUsers.bob.props.id,
        webinarId: webinar.props.id,
    })

    beforeEach(() => {
        userRepository = new InMemoryUserRepository([unitUsers.alice, unitUsers.bob, unitUsers.charlie]);
        mailer = new InMemoryMailer();
        webinarRepository = new InMemoryWebinarRepository([webinar]);
        participationRepository = new InMemoryParticipationRepository([bobParticipation]);
        useCase = new CancelSeat(participationRepository, userRepository, webinarRepository, mailer);
    });
    describe('Scenario: Happy path', () => {
        const payload = {
            user: unitUsers.bob,
            webinarId: webinar.props.id
        };

        it('should cancel the seat for the webinar', async () => {
            await useCase.execute(payload);

            expectParticipantToBeDeleted();
        });

        it('should send an email to organizer', async () => {
            await useCase.execute(payload);

            expect(mailer.sentEmails[0]).toEqual({
                to: unitUsers.alice.props.emailAddress,
                subject: 'Bob has cancelled his seat to your webinar',
                body: 'Hi Alice, Bob has cancelled his seat to your webinar My first webinar'
            });
        });

        it('should send an email to the participant', async () => {
            await useCase.execute(payload);

            expect(mailer.sentEmails[1]).toEqual({
                to: unitUsers.bob.props.emailAddress,
                subject: 'You have cancelled your seat to the webinar',
                body: 'Hi Bob, You have cancelled your seat to the webinar My first webinar'
            });
        });
    });
    describe('Scenario: should not delete participant', () => {
        const payload = {
            user: unitUsers.bob,
            webinarId: 'random-id'
        };

        it('should failed', async () => {
            await expect(useCase.execute(payload)).rejects.toThrow('Webinar' +
                ' not' +
                ' found');

            expectParticipantNotToBeDeleted();
        });
    });
    describe('Scenario: participant did not reserve a seat', () => {
        const payload = {
            user: unitUsers.charlie,
            webinarId: webinar.props.id
        };

        it('should failed', async () => {
            await expect(useCase.execute(payload)).rejects.toThrow('Participation not found');

            expectParticipantNotToBeDeleted();
        });
    });
});

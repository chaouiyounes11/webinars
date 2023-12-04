import {CancelWebinar} from './cancel-webinar';
import {
    InMemoryWebinarRepository
} from '../../adapters/in-memory-webinar-repository';
import {unitUsers} from '../../../users/tests/user.seeds';
import {Webinar} from '../../entities/webinar.entity';
import {InMemoryMailer} from '../../../core/adapters/in-memory-mailer';
import {
    InMemoryParticipationRepository
} from '../../adapters/in-memory-participation-repository';
import {
    InMemoryUserRepository
} from '../../../users/adapters/in-memory-user-repository';
import {Participation} from '../../entities/participation.entity';

describe('Feature: Cancel webinar', () => {
    const expectWebinarToBeDeleted = () => {
        const deletedWebinar = webinarRepository.findByIdSync(webinar.props.id);
        expect(deletedWebinar).toBeNull();
    }

    const expectWebinarToBeNotDeleted = () => {
        const deletedWebinar = webinarRepository.findByIdSync(webinar.props.id);
        expect(deletedWebinar).not.toBeNull();
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
        webinarId: 'id-1',
    });

    let useCase: CancelWebinar;
    let webinarRepository: InMemoryWebinarRepository;
    let mailer: InMemoryMailer;
    let participationRepository: InMemoryParticipationRepository;
    let userRepository: InMemoryUserRepository;

    beforeEach(() => {
        mailer = new InMemoryMailer();
        webinarRepository = new InMemoryWebinarRepository([webinar]);
        participationRepository = new InMemoryParticipationRepository([bobParticipation]);
        userRepository = new InMemoryUserRepository([unitUsers.alice, unitUsers.bob]);
        useCase = new CancelWebinar(webinarRepository, mailer, participationRepository, userRepository);
    });

    describe('Scenario: Happy path', () => {
        it('should cancel the webinar', async () => {
            await useCase.execute({
                user: unitUsers.alice,
                webinarId: webinar.props.id
            });

            expect(webinarRepository.database.length).toBe(0);
            expectWebinarToBeDeleted();
        });

        it('should send an email to participants', async () => {
            await useCase.execute({
                user: unitUsers.alice,
                webinarId: webinar.props.id
            });

            expect(mailer.sentEmails).toEqual([
                {
                    to: unitUsers.bob.props.emailAddress,
                    subject: `Webinar ${webinar.props.title} has been canceled`,
                    body: 'Webinar has been canceled'
                }
            ])
        });
    });

    describe('Scenario: Webinar does not exists', () => {
        it('should failed', async () => {
            await expect(useCase.execute({
                user: unitUsers.alice,
                webinarId: 'id-2'
            })).rejects.toThrow('Webinar' +
                ' not found');

            expectWebinarToBeNotDeleted();
        });
    });

    describe('Scenario: Deleting webinar not allowed', () => {
        it('should failed', async () => {
            await expect(useCase.execute({
                user: unitUsers.bob,
                webinarId: 'id-1'
            })).rejects.toThrow('You are not allowed to update this webinar');
            expectWebinarToBeNotDeleted();
        });
    });
});

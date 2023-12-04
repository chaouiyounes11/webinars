import {ChangeDates} from './change-dates';
import {
    InMemoryWebinarRepository
} from '../../adapters/in-memory-webinar-repository';
import {unitUsers} from '../../../users/tests/user.seeds';
import {Webinar} from '../../entities/webinar.entity';
import {IDateGenerator} from '../../../core/ports/date-generator.interface';
import {FixedDateGenerator} from '../../../core/adapters/fixed-date-generator';
import {Participation} from '../../entities/participation.entity';
import {
    InMemoryParticipationRepository
} from '../../adapters/in-memory-participation-repository';
import {InMemoryMailer} from '../../../core/adapters/in-memory-mailer';
import {
    InMemoryUserRepository
} from '../../../users/adapters/in-memory-user-repository';

describe('Feature: Change dates', () => {
    const expectToRemainDateUnchanged = () => {
        const updatedWebinar = webinarRepository.findByIdSync('id-1')!;

        expect(updatedWebinar.props.startDate).toEqual(webinar.props.startDate);
        expect(updatedWebinar.props.endDate).toEqual(webinar.props.endDate);
    }

    let useCase: ChangeDates;
    let dateGenerator: IDateGenerator;
    let mailer: InMemoryMailer;
    let userRepository: InMemoryUserRepository;
    let participationRepository: InMemoryParticipationRepository;
    let webinarRepository: InMemoryWebinarRepository;

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

    beforeEach(async () => {
        participationRepository = new InMemoryParticipationRepository([bobParticipation]);
        webinarRepository = new InMemoryWebinarRepository([webinar]);
        dateGenerator = new FixedDateGenerator();
        userRepository = new InMemoryUserRepository([unitUsers.alice, unitUsers.bob]);
        mailer = new InMemoryMailer();
        useCase = new ChangeDates(webinarRepository, dateGenerator, participationRepository, mailer, userRepository);
    })
    describe('Scenario: User changes dates', () => {
        const payload = {
            user: unitUsers.alice,
            webinarId: 'id-1',
            startDate: new Date('2023-01-10T00:00:00.000Z'),
            endDate: new Date('2023-01-12T01:00:00.000Z'),
        }
        it('should change dates', async () => {
            await useCase.execute(payload);//?
            const updatedWebinar = webinarRepository.findByIdSync('id-1')!;
            expect(updatedWebinar.props.startDate).toEqual(payload.startDate);
            expect(updatedWebinar.props.endDate).toEqual(payload.endDate);
        });

        it('should send an email', async () => {
            await useCase.execute(payload);

            expect(mailer.sentEmails).toEqual([
                {
                    to: unitUsers.bob.props.emailAddress,
                    subject: `Webinar ${webinar.props.title} dates changed`,
                    body: 'Webinar dates changed. The new dates are: 10/01/2023' +
                        ' 00:00 - 12/01/2023 01:00'
                }
            ])
        });
    });

    describe('Scenario: Webinar does not exist', () => {
        const payload = {
            user: unitUsers.alice,
            webinarId: 'id-2',
            startDate: new Date('2023-01-10T00:00:00.000Z'),
            endDate: new Date('2023-01-12T01:00:00.000Z'),
        }
        it('should failed', async () => {
            await expect(useCase.execute(payload)).rejects.toThrow('Webinar' +
                ' not found');

            expectToRemainDateUnchanged();
        });

    });

    describe('Scenario: Another user try to change webinar date', () => {
        const payload = {
            user: unitUsers.bob,
            webinarId: 'id-1',
            startDate: new Date('2023-01-10T00:00:00.000Z'),
            endDate: new Date('2023-01-12T01:00:00.000Z'),
        }
        it('should failed', async () => {
            await expect(useCase.execute(payload)).rejects.toThrow('You are not allowed to update this webinar');

            expectToRemainDateUnchanged();
        });

    });

    describe('Scenario: date too close', () => {
        const payload = {
            user: unitUsers.alice,
            webinarId: 'id-1',
            startDate: new Date('2020-01-03T00:00:00.000Z'),
            endDate: new Date('2020-01-03T00:00:00.000ZZ'),
        }

        it('should failed', async () => {
            await expect(useCase.execute(payload)).rejects.toThrow('The webinar must happen in at least 3 days');

            expectToRemainDateUnchanged();
        });

    });

});

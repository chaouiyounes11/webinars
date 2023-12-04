import * as request from 'supertest';
import {TestApp} from './utils/test-app';
import {e2eUsers} from './seeds/user-seeds';
import {
    I_PARTICIPATION_REPOSITORY,
    IParticipationRepository
} from '../webinars/ports/participation-repository.interface';
import {e2eWebinar} from './seeds/webinar-seeds';
import {ParticipationFixture} from './fixtures/participation-fixture';
import {Participation} from '../webinars/entities/participation.entity';

describe('Feature: Reserve seat', () => {
    let app: TestApp;

    beforeEach(async () => {
        app = new TestApp();
        await app.setup();
        await app.loadFixtures([
            e2eUsers.johnDoe,
            e2eUsers.bob,
            e2eWebinar.webinar1,
            new ParticipationFixture(
                new Participation({
                    userId: e2eUsers.bob.entity.props.id,
                    webinarId: e2eWebinar.webinar1.entity.props.id
                })
            )
        ]);
    });

    afterEach(async () => {
        await app.cleanup();
    })
    describe('Scenario: Happy path', () => {
        it('should succeed', async () => {
            const id = e2eWebinar.webinar1.entity.props.id;

            const result = await request(app.getHttpServer())
                .delete(`/webinars/${id}/participations`)
                .set('Authorization', e2eUsers.bob.createAuthorizationToken())

            expect(result.status).toEqual(200);

            const participationRepository = app.get<IParticipationRepository>(I_PARTICIPATION_REPOSITORY);
            const participation = await participationRepository.findOne(e2eUsers.bob.entity.props.id, id);

            expect(participation).toBeNull();
        });
    });

    describe('Scenario: The user is not authenticated', () => {
        it('should reject', async () => {
            const id = e2eWebinar.webinar1.entity.props.id;

            const result = await request(app.getHttpServer())
                .delete(`/webinars/${id}/participations`)

            expect(result.status).toEqual(403);
        });
    });
});

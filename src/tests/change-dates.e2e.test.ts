import * as request from 'supertest';
import {addDays} from 'date-fns';
import {
    I_WEBINAR_REPOSITORY
} from '../webinars/adapters/in-memory-webinar-repository';
import {TestApp} from './utils/test-app';
import {e2eUsers} from './seeds/user-seeds';
import {
    IWebinarRepository
} from '../webinars/ports/webinar-repository.interface';
import {e2eWebinar} from './seeds/webinar-seeds';

describe('Feature: Dates of a Webinar', () => {
    let app: TestApp;

    beforeEach(async () => {
        app = new TestApp();
        await app.setup();
        await app.loadFixtures([
            e2eUsers.johnDoe,
            e2eWebinar.webinar1
        ]);
    });

    afterEach(async () => {
        await app.cleanup();
    })
    describe('Scenario: Happy path', () => {
        it('should succeed', async () => {
            const startDate = addDays(new Date(), 5);
            const endDate = addDays(new Date(), 6);
            const id = e2eWebinar.webinar1.entity.props.id;

            const result = await request(app.getHttpServer())
                .post(`/webinars/${id}/dates`)
                .set('Authorization', e2eUsers.johnDoe.createAuthorizationToken())
                .send({startDate, endDate});

            expect(result.status).toEqual(200);

            const webinarRepository = app.get<IWebinarRepository>(I_WEBINAR_REPOSITORY);
            const webinar = await webinarRepository.findById(id);

            expect(webinar).toBeDefined();
            expect(webinar!.props.startDate).toEqual(startDate);
            expect(webinar!.props.endDate).toEqual(endDate);
        });
    });

    describe('Scenario: The user is not authenticated', () => {
        it('should reject', async () => {
            const startDate = addDays(new Date(), 5);
            const endDate = addDays(new Date(), 6);
            const id = e2eWebinar.webinar1.entity.props.id;

            const result = await request(app.getHttpServer())
                .post(`/webinars/${id}/dates`)
                .send({startDate, endDate});

            expect(result.status).toEqual(403);
        });
    });
});

import * as request from 'supertest';
import {
    I_WEBINAR_REPOSITORY
} from '../webinars/adapters/in-memory-webinar-repository';
import {TestApp} from './utils/test-app';
import {e2eUsers} from './seeds/user-seeds';
import {
    IWebinarRepository
} from '../webinars/ports/webinar-repository.interface';
import {e2eWebinar} from './seeds/webinar-seeds';

describe('Feature: Changing the number of seats', () => {
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
        it('should organize a webinars', async () => {
            const seats = 100;
            const id = e2eWebinar.webinar1.entity.props.id;

            const result = await request(app.getHttpServer())
                .post(`/webinars/${id}/seats`)
                .set('Authorization', e2eUsers.johnDoe.createAuthorizationToken())
                .send({seats});

            expect(result.status).toEqual(200);

            const webinarRepository = app.get<IWebinarRepository>(I_WEBINAR_REPOSITORY);
            const webinar = await webinarRepository.findById(id);

            expect(webinar).toBeDefined();
            expect(webinar!.props.seats).toEqual(seats)
        });
    });

    describe('Scenario: The user is not authenticated', () => {
        it('should reject', async () => {

            const seats = e2eWebinar.webinar1.entity.props.seats
            const id = e2eWebinar.webinar1.entity.props.id;

            const result = await request(app.getHttpServer())
                .post(`/webinars/${id}/seats`)
                .send({seats});

            expect(result.status).toEqual(403);
        });
    });
});

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

describe('Feature: Organize webinars', () => {
    let app: TestApp;

    beforeEach(async () => {
        app = new TestApp();
        await app.setup();
        await app.loadFixtures([e2eUsers.johnDoe]);
    });

    afterEach(async () => {
        await app.cleanup();
    })
    describe('Scenario: Happy path', () => {
        it('should organize a webinars', async () => {

            const startDate = addDays(new Date(), 4);
            const endDate = addDays(new Date(), 5);
            const result = await request(app.getHttpServer())
                .post('/webinars')
                .set('Authorization', e2eUsers.johnDoe.createAuthorizationToken())
                .send({
                    title: 'My first webinars',
                    seats: 100,
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString()
                });

            expect(result.status).toEqual(201);
            expect(result.body).toEqual({id: expect.any(String)});

            const webinarRepository = app.get<IWebinarRepository>(I_WEBINAR_REPOSITORY);
            const webinar = await webinarRepository.findById(result.body.id);

            expect(webinar).toBeDefined();
            expect(webinar!.props).toEqual({
                id: result.body.id,
                organizerId: 'john-doe',
                title: 'My first webinars',
                seats: 100,
                startDate,
                endDate
            })
        });
    });

    describe('Scenario: The user is not authenticated', () => {
        it('should reject', async () => {

            const result = await request(app.getHttpServer())
                .post('/webinars')
                .send({
                    title: 'My first webinars',
                    seats: 100,
                    startDate: addDays(new Date(), 4).toISOString(),
                    endDate: addDays(new Date(), 5).toISOString()
                });

            expect(result.status).toEqual(403);
        });
    });
});

import {IFixture} from '../utils/fixture';
import {TestApp} from '../utils/test-app';
import {Webinar} from '../../webinars/entities/webinar.entity';
import {
    IWebinarRepository
} from '../../webinars/ports/webinar-repository.interface';
import {
    I_WEBINAR_REPOSITORY
} from '../../webinars/adapters/in-memory-webinar-repository';

export class WebinarFixture implements IFixture {
    constructor(public entity: Webinar) {
    }

    async load(app: TestApp): Promise<void> {
        const webinarRepository = app.get<IWebinarRepository>(I_WEBINAR_REPOSITORY);
        await webinarRepository.create(this.entity);
    }
}

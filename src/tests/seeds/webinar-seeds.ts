import {WebinarFixture} from '../fixtures/webinar-fixture';
import {Webinar} from '../../webinars/entities/webinar.entity';
import {e2eUsers} from './user-seeds';
import {addDays} from 'date-fns';

export const e2eWebinar = {
    webinar1: new WebinarFixture(new Webinar({
            id: 'id-1',
            organizerId: e2eUsers.johnDoe.entity.props.id,
            title: 'My first webinar',
            seats: 50,
            startDate: addDays(new Date(), 4),
            endDate: addDays(new Date(), 5)
        }
    )),
}

import {IWebinarRepository} from '../../ports/webinar-repository.interface';
import {Webinar} from '../../entities/webinar.entity';
import {IIDGenerator} from '../../../core/ports/id-generator.interface';
import {IDateGenerator} from '../../../core/ports/date-generator.interface';
import {User} from '../../../users/entities/user.entity';
import {Executable} from '../../../shared/executable';
import {
    WebinarTooEarlyException
} from '../../exceptions/webinar-too-early-exception';
import {
    WebinarTooManySeatsException
} from '../../exceptions/webinar-too-many-seats-exception';
import {
    WebinarNotEnoughSeatsException
} from '../../exceptions/webinar-not-enough-seats-exception';

type Request = {
    user: User;
    title: string;
    startDate: Date;
    endDate: Date;
    seats: number;
}

type Response = { id: string };

export class OrganizeWebinar implements Executable<Request, Response> {
    constructor(
        private readonly webinarRepository: IWebinarRepository,
        private readonly idGenerator: IIDGenerator,
        private readonly dateGenerator: IDateGenerator,
    ) {

    }

    async execute(data: Request): Promise<Response> {
        const id = this.idGenerator.generate();

        const webinar = new Webinar({
            id,
            organizerId: data.user.props.id,
            seats: data.seats,
            title: data.title,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
        });

        if (webinar.isTooClose(this.dateGenerator.now())) {
            throw new WebinarTooEarlyException();
        }

        if (webinar.isOneParticipantAtLeast()) {
            throw new WebinarNotEnoughSeatsException();
        }

        if (webinar.isTooManySeats()) {
            throw new WebinarTooManySeatsException();
        }

        await this.webinarRepository.create(webinar);

        return {id}
    }

}


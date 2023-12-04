import {User} from '../../../users/entities/user.entity';
import {IWebinarRepository} from '../../ports/webinar-repository.interface';
import {Executable} from '../../../shared/executable';
import {
    WebinarNotFoundException
} from '../../exceptions/webinar-not-found-exception';
import {
    WebinarUpdateForbiddenException
} from '../../exceptions/webinar-update-forbidden-exception';
import {DomainException} from '../../../shared/exception';
import {
    WebinarTooManySeatsException
} from '../../exceptions/webinar-too-many-seats-exception';

type Request = {
    user: User;
    webinarId: string;
    seats: number;
};
type Response = void;

export class ChangeSeats implements Executable<Request, Response> {
    constructor(private readonly webinarRepository: IWebinarRepository) {
    }

    async execute(request: Request): Promise<Response> {
        const webinar = await this.webinarRepository.findById(request.webinarId);
        if (!webinar) {
            throw new WebinarNotFoundException();
        }

        if (!webinar.isOrganizer(request.user)) {
            throw new WebinarUpdateForbiddenException();
        }

        if (request.seats < webinar.props.seats) {
            throw new DomainException('Seats cannot be decreased');
        }

        webinar.update({seats: request.seats});

        if (webinar.isTooManySeats()) {
            throw new WebinarTooManySeatsException();
        }

        await this.webinarRepository.update(webinar);
    }
}

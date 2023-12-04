import {User} from '../../../users/entities/user.entity';
import {IWebinarRepository} from '../../ports/webinar-repository.interface';
import {Executable} from '../../../shared/executable';
import {
    WebinarNotFoundException
} from '../../exceptions/webinar-not-found-exception';
import {
    WebinarUpdateForbiddenException
} from '../../exceptions/webinar-update-forbidden-exception';

type Request = {
    user: User;
    webinarId: string;
    title: string;
};
type Response = void;

export class ChangeTitle implements Executable<Request, Response> {
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

        webinar.update({title: request.title});

        await this.webinarRepository.update(webinar);
    }
}

import {Executable} from '../../../shared/executable';
import {
    WebinarNotFoundException
} from '../../exceptions/webinar-not-found-exception';
import {
    WebinarUpdateForbiddenException
} from '../../exceptions/webinar-update-forbidden-exception';
import {IWebinarRepository} from '../../ports/webinar-repository.interface';
import {User} from '../../../users/entities/user.entity';
import {IMailer} from '../../../core/ports/mailer.interface';
import {Webinar} from '../../entities/webinar.entity';
import {
    IParticipationRepository
} from '../../ports/participation-repository.interface';
import {IUserRepository} from '../../../users/ports/user-repository.interface';

type Request = {
    webinarId: string;
    user: User;
}

type Response = void;

export class CancelWebinar implements Executable<Request, Response> {
    constructor(
        private readonly webinarRepository: IWebinarRepository,
        private readonly mailer: IMailer,
        private readonly participationRepository: IParticipationRepository,
        private readonly userRepository: IUserRepository
    ) {
    }

    async execute(request: Request): Promise<Response> {
        const webinar = await this.webinarRepository.findById(request.webinarId);

        if (webinar === null) {
            throw new WebinarNotFoundException();
        }

        if (!webinar.isOrganizer(request.user)) {
            throw new WebinarUpdateForbiddenException();
        }

        await this.webinarRepository.delete(webinar);
        await this.sendEmailToParticipants(webinar);
    }

    private async sendEmailToParticipants(webinar: Webinar) {
        const participation = await this.participationRepository.findByWebinarId(webinar.props.id);
        const users = await Promise.all(
            participation
                .map((p) => this.userRepository.findById(p.props.userId))
                .filter((u) => u !== null)
        ) as User[];

        await Promise.all(users.map((user) =>
            this.mailer.send({
                to: user.props.emailAddress,
                subject: `Webinar ${webinar.props.title} has been canceled`,
                body: 'Webinar has been canceled'
            })
        ));
    }

}

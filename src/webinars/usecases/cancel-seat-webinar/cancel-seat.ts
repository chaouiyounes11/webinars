import {Executable} from '../../../shared/executable';
import {
    IParticipationRepository
} from '../../ports/participation-repository.interface';
import {User} from '../../../users/entities/user.entity';
import {IUserRepository} from '../../../users/ports/user-repository.interface';
import {IWebinarRepository} from '../../ports/webinar-repository.interface';
import {IMailer} from '../../../core/ports/mailer.interface';
import {
    WebinarNotFoundException
} from '../../exceptions/webinar-not-found-exception';
import {Webinar} from '../../entities/webinar.entity';
import {DomainException} from '../../../shared/exception';
import {
    ParticipationNotFoundException
} from '../../exceptions/participation-not-found-exception';

type Request = {
    webinarId: string,
    user: User;
}

type Response = void;

export class CancelSeat implements Executable<Request, Response> {

    constructor(
        private readonly participationRepository: IParticipationRepository,
        private readonly userRepository: IUserRepository,
        private readonly webinarRepository: IWebinarRepository,
        private readonly mailer: IMailer
    ) {
    }

    async execute(request: Request): Promise<Response> {

        const webinar = await this.webinarRepository.findById(request.webinarId);

        if (!webinar) {
            throw new WebinarNotFoundException();
        }

        const participation = await this.participationRepository.findOne(request.user.props.id, request.webinarId);

        if (!participation) {
            throw new ParticipationNotFoundException();
        }
        await this.participationRepository.delete(participation);
        await this.sendEmailToOrganizer(request.webinarId, request.user);
        await this.sendEmailToParticipant(webinar, request.user);
    }

    private async sendEmailToOrganizer(webinarId: string, user: User) {
        const webinar = await this.webinarRepository.findById(webinarId);
        if (!webinar) {
            throw new DomainException('Webinar not found');
        }
        const organizer = await this.userRepository.findById(webinar.props.organizerId);
        if (!organizer) {
            throw new DomainException('Organizer not found');
        }
        await this.mailer.send({
            to: organizer.props.emailAddress,
            subject: `${user.props.id} has cancelled his seat to your webinar`,
            body: `Hi ${organizer.props.id}, Bob has cancelled his seat to your webinar My first webinar`
        })
    };

    private async sendEmailToParticipant(webinar: Webinar, user: User) {
        await this.mailer.send({
            to: user.props.emailAddress,
            subject: `You have cancelled your seat to the webinar`,
            body: `Hi ${user.props.id}, You have cancelled your seat to the webinar ${webinar!.props.title}`
        })
    }
}

import {User} from '../../../users/entities/user.entity';
import {Executable} from '../../../shared/executable';
import {
    IParticipationRepository
} from '../../ports/participation-repository.interface';
import {Participation} from '../../entities/participation.entity';
import {IMailer} from '../../../core/ports/mailer.interface';
import {IWebinarRepository} from '../../ports/webinar-repository.interface';
import {IUserRepository} from '../../../users/ports/user-repository.interface';
import {unitUsers} from '../../../users/tests/user.seeds';
import {
    WebinarNotFoundException
} from '../../exceptions/webinar-not-found-exception';
import {Webinar} from '../../entities/webinar.entity';
import {
    NoMoreSeatAvailableException
} from '../../exceptions/no-more-seat-available-exception';
import {
    AlreadyReservedSeatException
} from '../../exceptions/already-reserved-seat-exception';

type Request = {
    user: User;
    webinarId: string;
}

type Response = void;

export class ReserveSeats implements Executable<Request, Response> {

    constructor(
        private readonly participationRepository: IParticipationRepository,
        private readonly mailer: IMailer,
        private readonly webinarRepository: IWebinarRepository,
        private readonly userRepository: IUserRepository,
    ) {
    }

    async execute(data: { user: User, webinarId: string }) {

        const webinar = await this.webinarRepository.findById(data.webinarId);

        if (!webinar) {
            throw new WebinarNotFoundException()
        }

        await this.assertUserIsNotAlreadyRegistered(data.user, data.webinarId);
        await this.assertHasEnoughSeats(webinar);

        const participation = new Participation({
            userId: data.user.props.id,
            webinarId: data.webinarId,
        });

        await this.participationRepository.create(participation);

        await this.sendEmailToOrganizer(webinar);
        await this.sendEmailToParticipant(webinar, data.user);

    }

    private async assertHasEnoughSeats(webinar: Webinar) {
        const participantsCount = await this.participationRepository.findParticipationCount(webinar.props.id);

        if (participantsCount >= webinar.props.seats) {
            throw new NoMoreSeatAvailableException();
        }
    }

    private async assertUserIsNotAlreadyRegistered(user: User, webinarId: string) {
        const existingParticipation = await this.participationRepository.findOne(user.props.id, webinarId);

        if (existingParticipation) {
            throw new AlreadyReservedSeatException();
        }
    }

    private async sendEmailToOrganizer(webinar: Webinar) {
        const organizer: User | null = await this.userRepository.findById(webinar!.props.organizerId);

        await this.mailer.send({
            to: organizer!.props.emailAddress,
            subject: 'New participant',
            body: `${unitUsers.bob.props.id} has reserved a seat for your webinar "${webinar.props.title}"`,
        });
    }

    private async sendEmailToParticipant(webinar: Webinar, user: User) {
        await this.mailer.send({
            to: user.props.emailAddress,
            subject: 'You have reserved a seat',
            body: `You have reserved a seat for the webinar "${webinar?.props.title}"`,
        });

    }
}

import {Executable} from '../../../shared/executable';
import {User} from '../../../users/entities/user.entity';
import {IWebinarRepository} from '../../ports/webinar-repository.interface';
import {IDateGenerator} from '../../../core/ports/date-generator.interface';
import {
    IParticipationRepository
} from '../../ports/participation-repository.interface';
import {IMailer} from '../../../core/ports/mailer.interface';
import {IUserRepository} from '../../../users/ports/user-repository.interface';
import {Webinar} from '../../entities/webinar.entity';
import {
    WebinarNotFoundException
} from '../../exceptions/webinar-not-found-exception';
import {
    WebinarUpdateForbiddenException
} from '../../exceptions/webinar-update-forbidden-exception';
import {
    WebinarTooEarlyException
} from '../../exceptions/webinar-too-early-exception';

type Request = {
    user: User;
    webinarId: string;
    startDate: Date;
    endDate: Date;
}

type Response = void;

export class ChangeDates implements Executable<Request, Response> {
    constructor(
        private readonly webinarRepository: IWebinarRepository,
        private readonly dateGenerator: IDateGenerator,
        private readonly participationRepository: IParticipationRepository,
        private readonly mailer: IMailer,
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

        webinar.update({
            startDate: request.startDate,
            endDate: request.endDate
        });

        if (webinar.isTooClose(this.dateGenerator.now())) {
            throw new WebinarTooEarlyException();
        }

        await this.webinarRepository.update(webinar);
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
                subject: `Webinar ${webinar.props.title} dates changed`,
                body: 'Webinar dates changed. The new dates are: 10/01/2023' +
                    ' 00:00 - 12/01/2023 01:00'
            })
        ));
    }

}

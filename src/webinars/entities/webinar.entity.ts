import {differenceInDays} from 'date-fns';
import {Entity} from '../../shared/entity';
import {User} from '../../users/entities/user.entity';

export type WebinarProps = {
    id: string,
    organizerId: string,
    title: string,
    startDate: Date,
    endDate: Date,
    seats: number
}

export class Webinar extends Entity<WebinarProps> {

    isTooClose(now: Date): boolean {
        return differenceInDays(this.props.startDate, now) < 3;
    }

    isTooManySeats(): boolean {
        return this.props.seats > 1000;
    }

    isOneParticipantAtLeast(): boolean {
        return this.props.seats < 1;
    }

    isOrganizer(user: User): boolean {
        return this.props.organizerId === user.props.id;
    }

}

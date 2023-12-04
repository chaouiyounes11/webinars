import {Controller, Delete, Param, Post, Request} from '@nestjs/common';
import {WebinarAPI} from '../contract';
import {User} from '../../users/entities/user.entity';
import {ReserveSeats} from '../usecases/reserve-seats-webinar/reserve-seats';
import {CancelSeat} from '../usecases/cancel-seat-webinar/cancel-seat';

@Controller()
export class ParticipationsController {
    constructor(
        private readonly reserveSeats: ReserveSeats,
        private readonly cancelSeats: CancelSeat,
    ) {
    }

    @Post('/webinars/:id/participations')
    async handleReserveSeats(
        @Param('id') id: string,
        @Request() request: { user: User }
    ):
        Promise<WebinarAPI.ReserveSeats.Response> {
        return this.reserveSeats.execute({
            user: request.user,
            webinarId: id,
        })
    }

    @Delete('/webinars/:id/participations')
    async handleCancelSeats(
        @Param('id') id: string,
        @Request() request: { user: User }
    ):
        Promise<WebinarAPI.CancelWebinar.Response> {
        return this.cancelSeats.execute({
            user: request.user,
            webinarId: id,
        })
    }
}

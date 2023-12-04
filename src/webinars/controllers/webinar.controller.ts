import {
    Body,
    Controller,
    Delete,
    HttpCode,
    Param,
    Post,
    Request
} from '@nestjs/common';
import {WebinarAPI} from '../contract';
import {ZodValidationPipe} from '../../core/pipes/zod-validation.pipe';
import {User} from '../../users/entities/user.entity';
import {OrganizeWebinar} from '../usecases/organize-webinar/organize-webinar';
import {ChangeSeats} from '../usecases/change-seats-webinar/change-seats';
import {ChangeDates} from '../usecases/change-date-webinar/change-dates';
import {CancelWebinar} from '../usecases/cancel-webinar/cancel-webinar';
import {ChangeTitle} from '../usecases/change-title-webinar/change-title';

@Controller()
export class WebinarController {
    constructor(
        private readonly organizeWebinar: OrganizeWebinar,
        private readonly changeSeats: ChangeSeats,
        private readonly changeDates: ChangeDates,
        private readonly changeTitle: ChangeTitle,
        private readonly cancelWebinar: CancelWebinar
    ) {
    }

    @Post('/webinars')
    async handleOrganizeWebinar(
        @Body(new ZodValidationPipe(WebinarAPI.OrganizeWebinar.schema))
            body: WebinarAPI.OrganizeWebinar.Request,
        @Request() request: {
            user: User
        }
    ):
        Promise<WebinarAPI.OrganizeWebinar.Response> {
        return this.organizeWebinar.execute({
            user: request.user,
            title: body.title,
            seats: body.seats,
            startDate: body.startDate,
            endDate: body.endDate
        })
    }

    @HttpCode(200)
    @Post('/webinars/:id/seats')
    async handleChangeSeats(
        @Param('id') id: string,
        @Body(new ZodValidationPipe(WebinarAPI.ChangeSeats.schema))
            body: WebinarAPI.ChangeSeats.Request,
        @Request() request: {
            user: User
        }
    ):
        Promise<WebinarAPI.ChangeSeats.Response> {
        return this.changeSeats.execute({
            user: request.user,
            webinarId: id,
            seats: body.seats,
        })
    }

    @HttpCode(200)
    @Post('/webinars/:id/title')
    async handleChangeTitle(
        @Param('id') id: string,
        @Body(new ZodValidationPipe(WebinarAPI.ChangeTitle.schema))
            body: WebinarAPI.ChangeTitle.Request,
        @Request() request: {
            user: User
        }
    ):
        Promise<WebinarAPI.ChangeSeats.Response> {
        return this.changeTitle.execute({
            user: request.user,
            webinarId: id,
            title: body.title,
        })
    }

    @HttpCode(200)
    @Post('/webinars/:id/dates')
    async handleChangeDates(
        @Param('id') id: string,
        @Body(new ZodValidationPipe(WebinarAPI.ChangeDates.schema))
            body: WebinarAPI.ChangeDates.Request,
        @Request() request: {
            user: User
        }
    ):
        Promise<WebinarAPI.ChangeDates.Response> {
        return this.changeDates.execute({
            user: request.user,
            webinarId: id,
            startDate: body.startDate,
            endDate: body.endDate,
        })
    }

    @Delete('/webinars/:id')
    async handleDeleteWebinar(
        @Param('id') id: string,
        @Request() request: {
            user: User
        }
    ):
        Promise<WebinarAPI.CancelWebinar.Response> {
        return this.cancelWebinar.execute({
            user: request.user,
            webinarId: id,
        })
    }
}

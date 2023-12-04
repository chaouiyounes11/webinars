import {z} from 'zod';

export namespace WebinarAPI {
    export namespace OrganizeWebinar {
        export const schema = z.object({
            title: z.string(),
            seats: z.number(),
            startDate: z.coerce.date(),
            endDate: z.coerce.date()
        });

        export type Request = z.infer<typeof schema>;
        export type Response = {
            id: string
        };
    }

    export namespace ChangeSeats {
        export const schema = z.object({
            seats: z.number(),
        });

        export type Request = z.infer<typeof schema>;
        export type Response = void;
    }

    export namespace ChangeDates {
        export const schema = z.object({
            startDate: z.coerce.date(),
            endDate: z.coerce.date()
        });

        export type Request = z.infer<typeof schema>;
        export type Response = void;
    }

    export namespace ChangeTitle {
        export const schema = z.object({
            title: z.string(),
        });

        export type Request = z.infer<typeof schema>;
        export type Response = void;
    }

    export namespace CancelWebinar {
        export type Response = void;
    }
    export namespace CancelSeat {
        export type Response = void;
    }

    export namespace ReserveSeats {
        export const schema = z.object({
            seats: z.number(),
        });

        export type Request = z.infer<typeof schema>;
        export type Response = void;
    }
}

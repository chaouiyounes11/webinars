import {Prop, Schema as MongooseSchema, SchemaFactory} from '@nestjs/mongoose';
import {HydratedDocument} from 'mongoose';

export namespace MongoWebinar {
    export const collectionName = 'webinars';

    @MongooseSchema({collection: collectionName})
    export class SchemaClass {
        @Prop({type: String, required: true})
        _id: string;
        @Prop()
        title: string;
        @Prop()
        organizerId: string;
        @Prop()
        seats: number;
        @Prop()
        startDate: Date;
        @Prop()
        endDate: Date;

    }

    export const Schema = SchemaFactory.createForClass(SchemaClass);
    export type Document = HydratedDocument<SchemaClass>
}

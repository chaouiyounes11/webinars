import {Prop, Schema as MongooseSchema, SchemaFactory} from '@nestjs/mongoose';
import {HydratedDocument} from 'mongoose';
import {Participation} from '../../entities/participation.entity';

export namespace MongoParticipation {
    export const collectionName = 'participations';

    @MongooseSchema({collection: collectionName})
    export class SchemaClass {
        @Prop({type: String, required: true})
        _id: string;
        @Prop()
        webinarId: string;
        @Prop()
        userId: string;

        static makeId(participation: Participation) {
            return `${participation.props.webinarId}:${participation.props.userId}`;
        }
    }

    export const Schema = SchemaFactory.createForClass(SchemaClass);
    export type Document = HydratedDocument<SchemaClass>
}

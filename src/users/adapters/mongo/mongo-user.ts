import {Prop, Schema as MongooseSchema, SchemaFactory} from '@nestjs/mongoose';
import {HydratedDocument} from 'mongoose';

export namespace MongoUser {
    export const collectionName = 'users';

    @MongooseSchema({collection: collectionName})
    export class SchemaClass {
        @Prop({type: String, required: true})
        _id: string;
        @Prop()
        emailAddress: string;
        @Prop()
        password: string;
    }

    export const Schema = SchemaFactory.createForClass(SchemaClass);
    export type Document = HydratedDocument<SchemaClass>
}

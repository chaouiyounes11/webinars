import {IWebinarRepository} from '../../ports/webinar-repository.interface';
import {Webinar} from '../../entities/webinar.entity';
import {Model} from 'mongoose';
import {MongoWebinar} from './mongo-webinar';
import * as deepObjectDiff from 'deep-object-diff';

export class MongoWebinarRepository implements IWebinarRepository {
    constructor(private readonly model: Model<MongoWebinar.SchemaClass>) {
    }

    async create(webinar: Webinar): Promise<void> {
        const record = new this.model({
            _id: webinar.props.id,
            title: webinar.props.title,
            organizerId: webinar.props.organizerId,
            seats: webinar.props.seats,
            startDate: webinar.props.startDate,
            endDate: webinar.props.endDate,
        })
        await record.save();
    }

    async delete(webinar: Webinar): Promise<void> {
        await this.model.findByIdAndDelete(webinar.props.id);
    }

    async findById(id: string): Promise<Webinar | null> {
        const webinar = await this.model.findOne({_id: id});

        if (!webinar) {
            return null;
        }

        return new Webinar({
            id: webinar._id,
            title: webinar.title,
            organizerId: webinar.organizerId,
            seats: webinar.seats,
            startDate: webinar.startDate,
            endDate: webinar.endDate,
        });
    }

    async update(webinar: Webinar): Promise<void> {
        const record = await this.model.findOne({_id: webinar.props.id});
        if (!record) {
            return;
        }
        const diff = deepObjectDiff.diff(webinar.initialState, webinar.props);

        await record.updateOne(diff);
        webinar.commit();
    }
}

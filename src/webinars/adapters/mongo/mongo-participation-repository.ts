import {
    IParticipationRepository
} from '../../ports/participation-repository.interface';
import {Participation} from '../../entities/participation.entity';
import {Model} from 'mongoose';
import {MongoParticipation} from './mongo-participation';

export class MongoParticipationRepository implements IParticipationRepository {
    constructor(private readonly model: Model<MongoParticipation.SchemaClass>) {
    }

    async create(participation: Participation): Promise<void> {
        await this.model.create({
            _id: MongoParticipation.SchemaClass.makeId(participation),
            webinarId: participation.props.webinarId,
            userId: participation.props.userId,
        });
    }

    async delete(participation: Participation): Promise<void> {
        await this.model.findOneAndDelete({
            _id:
                MongoParticipation.SchemaClass.makeId(participation)
        });
    }

    async findByWebinarId(webinarId: string): Promise<Participation[]> {
        const participations = await this.model.find({webinarId});

        return participations.map(participation => new Participation({
            webinarId: participation.webinarId,
            userId: participation.userId,
        }));
    }

    async findOne(userId: string, webinarId: string): Promise<Participation | null> {
        const participation = await this.model.findOne({userId, webinarId});
        if (!participation) {
            return null;
        }
        return new Participation({
            webinarId: participation.webinarId,
            userId: participation.userId,
        });
    }

    async findParticipationCount(webinarId: string): Promise<number> {
        return this.model.countDocuments({webinarId});
    }
}

import {Participation} from '../entities/participation.entity';
import {
    IParticipationRepository
} from '../ports/participation-repository.interface';

export class InMemoryParticipationRepository implements IParticipationRepository {

    constructor(
        public readonly database: Participation[] = [],
    ) {
    }

    async findByWebinarId(webinarId: string): Promise<Participation[]> {
        return this.database.filter((p) => p.props.webinarId === webinarId);
    }

    async findOne(id: string, webinarId: string): Promise<Participation | null> {
        return this.findOneSync(id, webinarId);
    }

    async create(participation: Participation): Promise<void> {
        this.database.push(participation);
    }

    findOneSync(id: string, webinarId: string): Participation | null {
        return this.database.find((p) => p.props.userId === id && p.props.webinarId === webinarId) ?? null;
    }

    async findParticipationCount(webinarId: string): Promise<number> {
        return this.database.reduce((acc, p) => {
            if (p.props.webinarId === webinarId) {
                return acc + 1;
            } else {
                return acc;
            }
        }, 0);
    }

    async delete(participation: Participation): Promise<void> {
        this.database.splice(this.database.indexOf(participation), 1);
    }
}

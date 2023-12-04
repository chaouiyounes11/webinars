import {Participation} from '../entities/participation.entity';

export const I_PARTICIPATION_REPOSITORY = 'I_PARTICIPATION_REPOSITORY';

export interface IParticipationRepository {
    findOne(id: string, webinarId: string): Promise<Participation | null>;

    findParticipationCount(webinarId: string): Promise<number>;

    findByWebinarId(webinarId: string): Promise<Participation[]>;

    create(participation: Participation): Promise<void>;

    delete(participation: Participation): Promise<void>;
}

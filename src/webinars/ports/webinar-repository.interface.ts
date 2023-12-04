import {Webinar} from '../entities/webinar.entity';

export interface IWebinarRepository {
    findById(id: string): Promise<Webinar | null>;

    create(webinar: Webinar): Promise<void>;

    update(webinar: Webinar): Promise<void>;

    delete(webinar: Webinar): Promise<void>;

}

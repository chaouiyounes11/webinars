import {IWebinarRepository} from '../ports/webinar-repository.interface';
import {Webinar} from '../entities/webinar.entity';

export const I_WEBINAR_REPOSITORY = 'I_WEBINAR_REPOSITORY';

export class InMemoryWebinarRepository implements IWebinarRepository {
    constructor(public database: Webinar[] = []) {
    }

    findByIdSync(id: string): Webinar | null {
        const webinar = this.database.find((webinar) => webinar.props.id === id);
        return webinar ? new Webinar({...webinar.initialState}) : null;
    }

    async findById(id: string): Promise<Webinar | null> {
        return this.findByIdSync(id);
    }

    async create(webinar: Webinar): Promise<void> {
        this.database.push(webinar);
    }

    async update(webinar: Webinar): Promise<void> {
        const index = this.database.findIndex((webinar) => webinar.props.id === webinar.props.id);
        this.database[index] = webinar;
        webinar.commit();
    }

    async delete(webinar: Webinar): Promise<void> {
        const index = this.database.findIndex((webinar) => webinar.props.id === webinar.props.id);
        this.database.splice(index, 1);
    }
}

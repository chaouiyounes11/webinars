import {IUserRepository} from '../ports/user-repository.interface';
import {User} from '../entities/user.entity';

export const I_USER_REPOSITORY = 'I_USER_REPOSITORY';

export class InMemoryUserRepository implements IUserRepository {
    constructor(public readonly database: User[] = []) {
    }

    async findByEmailAddress(emailAddress: string): Promise<User | null> {
        const user = this.database.find(user => user.props.emailAddress === emailAddress);
        return user ?? null;
    }

    async create(user: User): Promise<void> {
        this.database.push(user);
    }

    async findById(id: string): Promise<User | null> {
        const user = this.database.find(user => user.props.id === id);
        return user ?? null;
    }
}

import {User} from '../../users/entities/user.entity';
import {IFixture} from '../utils/fixture';
import {TestApp} from '../utils/test-app';
import {
    I_USER_REPOSITORY
} from '../../users/adapters/in-memory-user-repository';
import {IUserRepository} from '../../users/ports/user-repository.interface';

export class UserFixture implements IFixture {
    constructor(public entity: User) {
    }

    async load(app: TestApp): Promise<void> {
        const userRepository = app.get<IUserRepository>(I_USER_REPOSITORY);
        await userRepository.create(this.entity);
    }

    createAuthorizationToken(): string {
        return 'Basic ' + Buffer.from(`${this.entity.props.emailAddress}:${this.entity.props.password}`).toString('base64');
    }
}

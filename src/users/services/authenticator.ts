import {User} from '../entities/user.entity';
import {IUserRepository} from '../ports/user-repository.interface';

export interface IAuthenticator {
    authenticate(token: string): Promise<User>;
}

export class Authenticator implements IAuthenticator {
    constructor(private readonly userRepository: IUserRepository) {
    }

    async authenticate(token: string): Promise<User> {
        const decoded = Buffer.from(token, 'base64').toString('utf8');
        const [emailAddress, password] = decoded.split(':');

        const user = await this.userRepository.findByEmailAddress(emailAddress);

        if (!user) {
            throw new Error('User not found');
        }

        if (password !== user?.props.password) {
            throw new Error('Password incorrect');
        }

        return user;
    }
}

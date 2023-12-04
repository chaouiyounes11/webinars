import {Authenticator} from './authenticator';
import {InMemoryUserRepository} from '../adapters/in-memory-user-repository';
import {User} from '../entities/user.entity';

describe('Authenticator', () => {
    let repository: InMemoryUserRepository;
    let authenticator: Authenticator;

    beforeEach(async () => {
        repository = new InMemoryUserRepository();
        await repository.create(new User({
            id: 'id-1',
            emailAddress: 'johndoe@gmail.com',
            password: 'azerty',
        }));

        authenticator = new Authenticator(repository);
    })

    describe('Case: the token is valid', () => {
        it('should authenticate a user', async () => {
            const payload = Buffer.from('johndoe@gmail.com:azerty').toString('base64');

            const user = await authenticator.authenticate(payload);

            expect(user.props).toEqual({
                id: 'id-1',
                emailAddress: 'johndoe@gmail.com',
                password: 'azerty',
            })
        });
    });

    describe('Case: the user does not exists', () => {
        it('should failed if user does not exists', async () => {

            const payload = Buffer.from('unknowUser@gmail.com:azerty').toString('base64');

            await expect(authenticator.authenticate(payload)).rejects.toThrow('User not found');

        });
    });

    describe('Case: the password is incorrect', () => {
        it('should failed if user does not exists', async () => {

            const payload = Buffer.from('johndoe@gmail.com:notValidPassword').toString('base64');

            await expect(authenticator.authenticate(payload)).rejects.toThrow('Password incorrect');

        });
    });
})

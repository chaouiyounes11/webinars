import {User} from '../entities/user.entity';

export const unitUsers = {
    alice: new User({
        id: 'Alice',
        emailAddress: 'alice@gmail.com',
        password: 'azerty'
    }),

    bob: new User({
        id: 'Bob',
        emailAddress: 'bob@gmail.com',
        password: 'azerty'
    }),
    charlie: new User({
        id: 'Charlie',
        emailAddress: 'charlie@gmail.com',
        password: 'azerty'
    }),
}

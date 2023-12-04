import {Entity} from '../../shared/entity';

export type UserProps = {
    id: string,
    emailAddress: string,
    password: string,
}

export class User extends Entity<UserProps> {
}

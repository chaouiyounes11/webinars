import {IUserRepository} from '../../ports/user-repository.interface';
import {User} from '../../entities/user.entity';
import {Model} from 'mongoose';
import {MongoUser} from './mongo-user';

export class MongoUserRepository implements IUserRepository {
    private userMapper = new UserMapper();

    constructor(private readonly model: Model<MongoUser.SchemaClass>) {
    }

    async create(user: User): Promise<void> {
        const record = new this.model(UserMapper.toPersistence(user));
        await record.save();
    }

    async findByEmailAddress(emailAddress: string): Promise<User | null> {
        const user = await this.model.findOne({emailAddress});

        if (!user) {
            return null;
        }
        return UserMapper.toDomain(user);
    }

    async findById(id: string): Promise<User | null> {
        const user = await this.model.findOne({_id: id});

        if (!user) {
            return null;
        }

        return UserMapper.toDomain(user);

    }

}

class UserMapper {
    static toDomain(user: MongoUser.SchemaClass): User {
        return new User({
            id: user._id,
            emailAddress: user.emailAddress,
            password: user.password,
        });
    }

    static toPersistence(user: User): MongoUser.SchemaClass {
        return {
            _id: user.props.id,
            emailAddress: user.props.emailAddress,
            password: user.props.password,
        };
    }
}

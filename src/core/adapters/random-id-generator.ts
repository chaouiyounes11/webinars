import {IIDGenerator} from '../ports/id-generator.interface';
import {v4} from 'uuid';

export const I_ID_GENERATOR = 'I_ID_GENERATOR';

export class RandomIdGenerator implements IIDGenerator {
    public generate(): string {
        return v4();
    }
}

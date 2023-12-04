import {IDateGenerator} from '../ports/date-generator.interface';

export const I_DATE_GENERATOR = 'I_DATE_GENERATOR';

export class CurrentDateGenerator implements IDateGenerator {
    public now(): Date {
        return new Date();
    }
}

import {DomainException} from '../../shared/exception';

export class NoMoreSeatAvailableException extends DomainException {
    constructor() {
        super('No more seats available');
    }
}

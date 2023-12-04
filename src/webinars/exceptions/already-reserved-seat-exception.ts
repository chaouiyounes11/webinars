import {DomainException} from '../../shared/exception';

export class AlreadyReservedSeatException extends DomainException {
    constructor() {
        super('You have already reserved a seat');
    }
}

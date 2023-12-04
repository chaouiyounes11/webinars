import {DomainException} from '../../shared/exception';

export class WebinarTooManySeatsException extends DomainException {
    constructor() {
        super(`The webinar cannot have more than 1000 seats`);
    }
}

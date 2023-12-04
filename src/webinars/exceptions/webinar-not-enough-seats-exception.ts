import {DomainException} from '../../shared/exception';

export class WebinarNotEnoughSeatsException extends DomainException {
    constructor() {
        super(`Webinar must have at least one participant`);
    }
}

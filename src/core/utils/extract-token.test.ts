import {extractToken} from './extract-token';

describe('Extract token', () => {
    it('should extract the token', () => {
        expect(extractToken('Basic 123')).toEqual('123');
        expect(extractToken('Test 123')).toEqual(null);
        expect(extractToken('fakeToken')).toEqual(null);
        expect(extractToken('')).toEqual(null);
    });
})

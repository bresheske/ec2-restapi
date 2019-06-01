import * as tokenService from "../../src/auth/token";

describe(`token`, () => {
    it(`should create basic token`, () => {
        const token = tokenService.createJwt(`brandon`, { displayName: `Brandon R` });
        expect(token).not.toBeNull();
        expect(token.length).toBeGreaterThan(0);
    });

    it(`should verify basic token`, () => {
        const token = tokenService.createJwt(`brandon`, { displayName: `Brandon R` });
        const isValid = tokenService.verifyJwt(`brandon`, token);
        expect(isValid).toBeTruthy();
    });

    it(`should contain user's subject in claims`, () => {
        const subject = `brandon`;
        const displayName = `Brandon R`;
        const token = tokenService.createJwt(subject, { displayName });
        const jsonToken = tokenService.decodeToken(token);
        expect(jsonToken.payload.sub).toEqual(subject);
        expect(jsonToken.payload.displayName).toEqual(displayName);
    });

    it(`should verify re-encoded token`, () => {
        const token = tokenService.createJwt(`brandon`, { displayName: `Brandon R` });
        const isValid = tokenService.verifyJwt(`brandon`, token);
        expect(isValid).toBeTruthy();

        // basically copy the token over and expect it to verify correctly.
        const newToken = tokenService.encodeToken(tokenService.decodeToken(token));
        const newIsValid = tokenService.verifyJwt(`brandon`, newToken);
        expect(newIsValid).toBeTruthy();
    });

    it(`should not verify compromised token`, () => {
        // create our token
        const subject = `brandon`;
        const displayName = `Brandon`;
        const token = tokenService.createJwt(subject, { displayName });
        const jsonToken = tokenService.decodeToken(token);

        // edit it, like some hacker might try
        jsonToken.payload.isAdmin = true;
        const newToken = tokenService.encodeToken(jsonToken);

        // expect the verifyer to catch the edit
        const isValid = tokenService.verifyJwt(`brandon`, newToken);
        expect(isValid).toBeFalsy();
    });
});
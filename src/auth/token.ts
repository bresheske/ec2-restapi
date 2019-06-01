const config = require('../../environments/config.json');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const base64url = require('base64url');

export function createJwt(user: string, extraData:any): string {
    const privateKeyFile = `./signingkeys/${config.auth.privateSigningKey}`;
    const privateKey  = fs.readFileSync(privateKeyFile, 'utf8');
    const signOptions = {
        issuer:  config.auth.issuerName,
        subject:  user,
        audience:  config.auth.audienceName,
        expiresIn:  config.auth.expiresIn,
        algorithm:  config.auth.algorithm
    };

    const token = jwt.sign(extraData, privateKey, signOptions);
    return token;
}

/**
 * verifies a user's jwt
 * @param user the user we're verifying
 * @param clientAudience the server resources (or application) the user is attempting to access
 * @param token the user's token
 */
export function verifyJwt(user: string, token: string): boolean {
    const publicKeyFile = `./signingkeys/${config.auth.publicVerifyingKey}`;
    const publicKey  = fs.readFileSync(publicKeyFile, 'utf8');
    const signOptions = {
        issuer:  config.auth.issuerName,
        subject:  user,
        audience:  config.auth.audienceName,
        expiresIn:  config.auth.expiresIn,
        algorithm:  config.auth.algorithm
    };
    try {
        return jwt.verify(token, publicKey, signOptions);
    }
    catch (err) {
        return false;
    }
}

/**
 * just decodes the token into json
 * @param token the user's token
 */
export function decodeToken(token: string): any {
    return jwt.decode(token, { complete: true });
}

/**
 * just encodes json into a token
 * @param token the user's token
 */
export function encodeToken(tokenJson: any): string {
    return [
        base64url(JSON.stringify(tokenJson.header)),
        base64url(JSON.stringify(tokenJson.payload)),
        tokenJson.signature
    ].join('.');
}
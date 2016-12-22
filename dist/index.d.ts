/// <reference path="../typings/index.d.ts" />
/**
 * @typedef {object} KeyPair
 * @param {Buffer} publicKey
 * @param {Buffer} privateKey
 */
export interface KeyPair {
    publicKey: Buffer;
    privateKey: Buffer;
}
/**
 * @class GmaCrypto
 */
export declare class GmaCrypto {
    baseUrl: string;
    prime: Buffer;
    constructor(baseUrl: string);
    /**
     * Generates a key pair, the private key being the concatenation of the username
     * and password. The public key can then be sent to the POST /users method in the server.
     *
     * @param {string} username
     * @param {string} password
     * @returns {Promise<KeyPair>}
     */
    generateKeyPair(username: string, password: string): Promise<KeyPair>;
    /**
     * Computes the shared secret between the local user and another user, using this user's
     * local key and the other user's public key, which is requested from the server.
     *
     * @param {Buffer} privateKey This user's private key, as returned from generateKeyPair()
     * @param {number} userId The external user's ID, which will be used to request their public
     * key.
     * @returns {Promise<Buffer>}
     */
    computeSharedSecret(privateKey: Buffer, userId: number): Promise<Buffer>;
    /**
     * Encrypts a message with the shared secret.
     *
     * @param {string} message The message to encrypt, in utf-8 encoding.
     * @param {Buffer} secret The shared secret, as returned from computeSharedSecret()
     * @returns {string} A base64 string containing the encrypted message.
     */
    static encrypt(message: string, secret: Buffer): string;
    /**
     * Decrypts a message with the shared secret.
     *
     * @param {string} message The message to decrypt, in utf-8 encoding.
     * @param {Buffer} secret The shared secret, as returned from computeSharedSecret()
     * @returns {string|null} A base64 string containing the encrypted message, or null if the
     * decrypt was unsuccessful (i.e: on wrong password).
     */
    static decrypt(message: string, secret: Buffer): string | null;
    private _getPrime();
    private _getPublicKey(userId);
}

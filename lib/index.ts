/**
 * @module gma-client-crypto
 */
/// <reference path="../typings/index.d.ts" />
import * as request from "request-promise";
import { createDiffieHellman, createCipher, createDecipher } from "crypto";

const GMA_ENCODING = "base64";
const GMA_ENCRYPTION_ALGO = "aes256";

/**
 * @typedef {object} KeyPair
 * @param {Buffer} publicKey
 * @param {Buffer} privateKey
 */
export interface KeyPair {
	publicKey: Buffer
	privateKey: Buffer
}

/**
 * @class GmaCrypto
 */
export class GmaCrypto {

	baseUrl: string;
	prime: Buffer;

	constructor(baseUrl: string) {
		if (!baseUrl) {
			throw new Error("You need to pass the URL to the GmaCrypto constructor.");
		}
		this.baseUrl = baseUrl;
		this.prime = null;
	}

	/**
	 * Generates a key pair, the private key being the concatenation of the username
	 * and password. The public key can then be sent to the POST /users method in the server.
	 *
	 * @param {string} username
	 * @param {string} password
	 * @returns {Promise<KeyPair>}
	 */
	generateKeyPair(username: string, password: string): Promise<KeyPair> {
		let genKeyPair = function(prime: Buffer): KeyPair {
			const dh = createDiffieHellman(prime);
			dh.setPrivateKey(new Buffer(username + password));
			dh.generateKeys();

			return {
				publicKey: dh.getPublicKey(),
				privateKey: dh.getPrivateKey()
			};
		};

		return new Promise((fulfill, reject) => {
			if (this.prime) {
				fulfill(genKeyPair(this.prime));
			} else {
				this._getPrime().then(prime => {
					this.prime = prime;
					fulfill(genKeyPair(this.prime));
				}).catch(reject);
			}
		});
	}

	/**
	 * Computes the shared secret between the local user and another user, using this user's
	 * local key and the other user's public key, which is requested from the server.
	 *
	 * @param {Buffer} privateKey This user's private key, as returned from generateKeyPair()
	 * @param {number} userId The external user's ID, which will be used to request their public
	 * key.
	 * @returns {Promise<Buffer>}
	 */
	computeSharedSecret(privateKey: Buffer, userId: number): Promise<Buffer> {
		return new Promise((fulfill, reject) => {
			let getPrimePromise: Promise<Buffer> = this.prime ? new Promise((fulfill, reject) => {
					fulfill(this.prime);
				}) : this._getPrime();
			let getPublicKeyPromise = this._getPublicKey(userId);

			Promise.all([getPrimePromise, getPublicKeyPromise]).then(values => {
				let prime = values[0];
				let publicKey = values[1];

				const dh = createDiffieHellman(prime);
				dh.setPrivateKey(privateKey);

				fulfill(dh.computeSecret(publicKey));
			}).catch(reject);
		});
	}

	/**
	 * Encrypts a message with the shared secret.
	 *
	 * @param {string} message The message to encrypt, in utf-8 encoding.
	 * @param {Buffer} secret The shared secret, as returned from computeSharedSecret()
	 * @returns {string} A base64 string containing the encrypted message.
	 */
	static encrypt(message: string, secret: Buffer): string {
		const cipher = createCipher(GMA_ENCRYPTION_ALGO, secret);

		let encrypted = cipher.update(message, "utf-8", GMA_ENCODING);
		encrypted += cipher.final(GMA_ENCODING);

		return encrypted;
	}

	/**
	 * Decrypts a message with the shared secret.
	 *
	 * @param {string} message The message to decrypt, in utf-8 encoding.
	 * @param {Buffer} secret The shared secret, as returned from computeSharedSecret()
	 * @returns {string|null} A base64 string containing the encrypted message, or null if the
	 * decrypt was unsuccessful (i.e: on wrong password).
	 */
	static decrypt(message: string, secret: Buffer): string|null {
		const decipher = createDecipher("aes256", secret);

		let decrypted = decipher.update(message, GMA_ENCODING, "utf-8");

		try {
			decrypted += decipher.final("utf-8");
		} catch (e) {
			return null; // Incorrect password
		}

		return decrypted;
	}

	private _getPrime(): Promise<Buffer> {
		return new Promise((fulfill, reject) => {
			request(this.baseUrl + "/auth/prime")
				.then(r => JSON.parse(r).prime)
				.then(p => new Buffer(p, GMA_ENCODING))
				.then(fulfill).catch(reject);
		});
	}

	private _getPublicKey(userId: number): Promise<Buffer> {
		return new Promise((fulfill, reject) => {
			request(this.baseUrl + `/users/${userId}/publicKey`)
				.then(r => JSON.parse(r).publicKey)
				.then(k => new Buffer(k, GMA_ENCODING))
				.then(fulfill).catch(reject);
		});
	}
}
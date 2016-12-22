"use strict";
/**
 * @module gma-client-crypto
 */
/// <reference path="../typings/index.d.ts" />
var request = require("request-promise");
var crypto_1 = require("crypto");
var GMA_ENCODING = "base64";
var GMA_ENCRYPTION_ALGO = "aes256";
/**
 * @class GmaCrypto
 */
var GmaCrypto = (function () {
    function GmaCrypto(baseUrl) {
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
    GmaCrypto.prototype.generateKeyPair = function (username, password) {
        var _this = this;
        var genKeyPair = function (prime) {
            var dh = crypto_1.createDiffieHellman(prime);
            dh.setPrivateKey(new Buffer(username + password));
            dh.generateKeys();
            return {
                publicKey: dh.getPublicKey(),
                privateKey: dh.getPrivateKey()
            };
        };
        return new Promise(function (fulfill, reject) {
            if (_this.prime) {
                fulfill(genKeyPair(_this.prime));
            }
            else {
                _this._getPrime().then(function (prime) {
                    _this.prime = prime;
                    fulfill(genKeyPair(_this.prime));
                })["catch"](reject);
            }
        });
    };
    /**
     * Computes the shared secret between the local user and another user, using this user's
     * local key and the other user's public key, which is requested from the server.
     *
     * @param {Buffer} privateKey This user's private key, as returned from generateKeyPair()
     * @param {number} userId The external user's ID, which will be used to request their public
     * key.
     * @returns {Promise<Buffer>}
     */
    GmaCrypto.prototype.computeSharedSecret = function (privateKey, userId) {
        var _this = this;
        return new Promise(function (fulfill, reject) {
            var getPrimePromise = _this.prime ? new Promise(function (fulfill, reject) {
                fulfill(_this.prime);
            }) : _this._getPrime();
            var getPublicKeyPromise = _this._getPublicKey(userId);
            Promise.all([getPrimePromise, getPublicKeyPromise]).then(function (values) {
                var prime = values[0];
                var publicKey = values[1];
                var dh = crypto_1.createDiffieHellman(prime);
                dh.setPrivateKey(privateKey);
                fulfill(dh.computeSecret(publicKey));
            })["catch"](reject);
        });
    };
    /**
     * Encrypts a message with the shared secret.
     *
     * @param {string} message The message to encrypt, in utf-8 encoding.
     * @param {Buffer} secret The shared secret, as returned from computeSharedSecret()
     * @returns {string} A base64 string containing the encrypted message.
     */
    GmaCrypto.encrypt = function (message, secret) {
        var cipher = crypto_1.createCipher(GMA_ENCRYPTION_ALGO, secret);
        var encrypted = cipher.update(message, "utf-8", GMA_ENCODING);
        encrypted += cipher.final(GMA_ENCODING);
        return encrypted;
    };
    /**
     * Decrypts a message with the shared secret.
     *
     * @param {string} message The message to decrypt, in utf-8 encoding.
     * @param {Buffer} secret The shared secret, as returned from computeSharedSecret()
     * @returns {string|null} A base64 string containing the encrypted message, or null if the
     * decrypt was unsuccessful (i.e: on wrong password).
     */
    GmaCrypto.decrypt = function (message, secret) {
        var decipher = crypto_1.createDecipher("aes256", secret);
        var decrypted = decipher.update(message, GMA_ENCODING, "utf-8");
        try {
            decrypted += decipher.final("utf-8");
        }
        catch (e) {
            return null; // Incorrect password
        }
        return decrypted;
    };
    GmaCrypto.prototype._getPrime = function () {
        var _this = this;
        return new Promise(function (fulfill, reject) {
            request(_this.baseUrl + "/auth/prime")
                .then(function (r) { return JSON.parse(r).prime; })
                .then(function (p) { return new Buffer(p, GMA_ENCODING); })
                .then(fulfill)["catch"](reject);
        });
    };
    GmaCrypto.prototype._getPublicKey = function (userId) {
        var _this = this;
        return new Promise(function (fulfill, reject) {
            request(_this.baseUrl + ("/users/" + userId + "/publicKey"))
                .then(function (r) { return JSON.parse(r).publicKey; })
                .then(function (k) { return new Buffer(k, GMA_ENCODING); })
                .then(fulfill)["catch"](reject);
        });
    };
    return GmaCrypto;
}());
exports.GmaCrypto = GmaCrypto;

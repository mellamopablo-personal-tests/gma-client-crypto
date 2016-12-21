<a name="module_GmaCrypto"></a>

# gma-client-crypto

A client side cryptography module for
[gma-server](https://github.com/mellamopablo-personal-tests/gma-server).

## Usage

```js
const GmaCrypto = require("gma-client-crypto").GmaCrypto;

let crypto = new GmaCrypto("http://myserver.com/api/v1");

// Generate a key pair
crypto.generateKeyPair("alice", "superpassword").then(pair => {
    // Do something
}).catch(console.error);

// Compute a shared secret with bob (user ID 2)
crypto.computeSharedSecret(pair.privateKey, 2).then(secret => {
    // Do something
}).catch(console.error);

// Encrypt a message for Bob
let encrypted = GmaCrypto.encrypt("I love you, Bob!", secret);
```

## Summary

* [GmaCrypto](#module_GmaCrypto)
    * [~generateKeyPair(username, password)](#module_GmaCrypto..generateKeyPair) ⇒ <code>Promise.&lt;KeyPair&gt;</code>
    * [~computeSharedSecret(privateKey, userId)](#module_GmaCrypto..computeSharedSecret) ⇒ <code>Promise.&lt;Buffer&gt;</code>
    * [~encrypt(message, secret)](#module_GmaCrypto..encrypt) ⇒ <code>string</code>
    * [~decrypt(message, secret)](#module_GmaCrypto..decrypt) ⇒ <code>string</code> &#124; <code>null</code>
    * [~KeyPair](#module_GmaCrypto..KeyPair) : <code>object</code>

<a name="module_GmaCrypto..generateKeyPair"></a>

### GmaCrypto~generateKeyPair(username, password) ⇒ <code>Promise.&lt;KeyPair&gt;</code>
Generates a key pair, the private key being the concatenation of the username
and password. The public key can then be sent to the POST /users method in the server.

**Kind**: inner method of <code>[GmaCrypto](#module_GmaCrypto)</code>  

| Param | Type |
| --- | --- |
| username | <code>string</code> | 
| password | <code>string</code> | 

<a name="module_GmaCrypto..computeSharedSecret"></a>

### GmaCrypto~computeSharedSecret(privateKey, userId) ⇒ <code>Promise.&lt;Buffer&gt;</code>
Computes the shared secret between the local user and another user, using this user's
local key and the other user's public key, which is requested from the server.

**Kind**: inner method of <code>[GmaCrypto](#module_GmaCrypto)</code>  

| Param | Type | Description |
| --- | --- | --- |
| privateKey | <code>Buffer</code> | This user's private key, as returned from generateKeyPair() |
| userId | <code>number</code> | The external user's ID, which will be used to request their public key. |

<a name="module_GmaCrypto..encrypt"></a>

### GmaCrypto~encrypt(message, secret) ⇒ <code>string</code>
Encrypts a message with the shared secret.

**Kind**: inner method of <code>[GmaCrypto](#module_GmaCrypto)</code>  
**Returns**: <code>string</code> - A base64 string containing the encrypted message.  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | The message to encrypt, in utf-8 encoding. |
| secret | <code>Buffer</code> | The shared secret, as returned from computeSharedSecret() |

<a name="module_GmaCrypto..decrypt"></a>

### GmaCrypto~decrypt(message, secret) ⇒ <code>string</code> &#124; <code>null</code>
Decrypts a message with the shared secret.

**Kind**: inner method of <code>[GmaCrypto](#module_GmaCrypto)</code>  
**Returns**: <code>string</code> &#124; <code>null</code> - A base64 string containing the encrypted message, or null if the
decrypt was unsuccessful (i.e: on wrong password).  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | The message to decrypt, in utf-8 encoding. |
| secret | <code>Buffer</code> | The shared secret, as returned from computeSharedSecret() |

<a name="module_GmaCrypto..KeyPair"></a>

### GmaCrypto~KeyPair : <code>object</code>
**Kind**: inner typedef of <code>[GmaCrypto](#module_GmaCrypto)</code>  

| Param | Type |
| --- | --- |
| publicKey | <code>Buffer</code> | 
| privateKey | <code>Buffer</code> | 


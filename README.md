# bch-nostr

This is an node.js npm library for interactions between BCH and Nostr. Here are some of the things this library allows you to do:

- Generate a Nostr `npub` address with a BCH private key.
- Send E2EE messages to a BCH address. Store the encrypted message on Nostr.
- Check a BCH address to see it is has received E2EE messages.
- Download and decrypt messages stored on Nostr.

## Installation

- `npm install --save bch-nostr`

Include the library in your JavaScript app:

```javascript
import BchNostr from 'bch-nostr'
const bchNostr = new BchNostr()
```

## Examples

Below are examples of how this library can be consumed.

### Generate Nostr pubkey from WIF private key

The WIF format is the standard format for private keys in BTC and BCH. You can use the private key of your cryptocurrency wallet to generate a Nostr pubkey for creating a user and posting messages.

```javascript
const wif = 'L2HJYqrXgsVghD5fXQZY2X4upFuvvnmF9o3cF3s3AuDix3FzbcB1'
const {privKeyBuf, nostrPubKey} = bchNostr.keys.createNostrPubKeyFromWif({wif})

// privKeyBuf is the raw private key as a 32-byte Uint8Array
console.log(nostrPubKey)
// '8f97b3b776631f7504c000cff2740e3ba08f928522d45c57ce95d6a3bcbeec6e'
```

### Post a message to a Nostr Relay

```javascript
// Generate a key pair
const wif = 'L2HJYqrXgsVghD5fXQZY2X4upFuvvnmF9o3cF3s3AuDix3FzbcB1'
const {privKeyBuf, nostrPubKey} = bchNostr.keys.createNostrPubKeyFromWif({wif})

const relayWs = 'wss://nostr-relay.psfoundation.info'

const msg = "test message"

const inObj = {privKeyBuf, nostrPubKey, relayWs, msg}
const eventId = await bchNostr.post.uploadToNostr(inObj)

// eventId: '770efaf6c8d0b239a7f3a49e74e55f7fa40d7b9d6ec7760db52f3ade3f3d72b9'
```

## Dev Environment

Follow these instruction to setup a dev environment. Ensure node.js v20+ is installed.

- `git clone https://github.com/Permissionless-Software-Foundation/bch-nostr`
- `cd bch-nostr`
- `npm install`
- `npm test`

## Resources

To see more JS examples of how to interact with a Nostr relay, check out the [nostr-sandbox](https://github.com/christroutner/nostr-sandbox).

To meet other JS devs who are interested in the intersection of cryptocurrency and Nostr, visit [this Telegram channel](https://t.me/bch_js_toolkit).

This library is consumed by:
- [psf-msg-wallet](https://github.com/Permissionless-Software-Foundation/psf-msg-wallet) - command-line interface (CLI) for sending encrypted messages to BCH addresses.

## Pedigree
This repository was originally forked from the [npm-lib-boilerplate-esm](https://github.com/christroutner/npm-lib-boilerplate-esm) boilerplate.

## Licence
[MIT](LICENSE.md)

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

### Post a Message to a Nostr Relay

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

### Publish a Message Signal to the BCH Blockchain

Publish a [PS001 message signal](https://github.com/Permissionless-Software-Foundation/specifications/blob/master/ps001-media-sharing.md) to a BCH address to let it know that an E2EE message has been sent.

```javascript

const eventId = '770efaf6c8d0b239a7f3a49e74e55f7fa40d7b9d6ec7760db52f3ade3f3d72b9'
const receiver = 'bitcoincash:qzwu79a6dp88sxwq8wy80ak694v9gqshaun2xrj5ut'

// Generate a wallet
const wif = 'L2HJYqrXgsVghD5fXQZY2X4upFuvvnmF9o3cF3s3AuDix3FzbcB1'
const wallet = new BchWallet(wif, {
  interface: 'consumer-api',
  restURL: 'https://free-bch.fullstack.cash'
})
await wallet.initialize()

const inObj = {
  wallet,
  addr: receiver,
  subject: 'test',
  eventId
}

const result = await bchNostr.signal.sendMsgSignal(inObj)

```

### Check the BCH Blockchain for Message Signals Sent to an Address

Check if your address has received messages. The `limit` property can be used
to limit the number of results. By default, it is set to 10. Setting it to 0
will return all messages found.

```javascript

// Generate a wallet
const wif = 'L2HJYqrXgsVghD5fXQZY2X4upFuvvnmF9o3cF3s3AuDix3FzbcB1'
const wallet = new BchWallet(wif, {
  interface: 'consumer-api',
  restURL: 'https://free-bch.fullstack.cash'
})
await wallet.initialize()

const addr = wallet.walletInfo.address

const inObj = {
  wallet,
  addr,
  limit: 3
}

const result = await bchNostr.signal.checkMsgs(inObj)
console.log(result)

// result:
// [
//   {
//     hash: '2f4c17fd14c27314923f282abe280ad2938448150ff9b13c044ae95045a9716c',
//     subject: '111824a',
//     sender: 'bitcoincash:qr2zqrnqdulfmeqs2qe9c5p605lrwe90v5v735s2jl',
//     txid: '026d13c9b1920b72ea239a489408bf81ed7ceff47fb4ec3c383d56ab07bfefb7',
//     time: 1731967518
//   },
//   {
//     hash: '53531b0424b64c7844de2aef2cf8ffebee9802086f968d44ddf07adac08ad73b',
//     subject: 'test 10/30/24;7:21PM',
//     sender: 'bitcoincash:qr2zqrnqdulfmeqs2qe9c5p605lrwe90v5v735s2jl',
//     txid: 'e7537fbeebb367e09793286f636ec6a4a0b04ba556ec90691b5e0107d18cc5cb',
//     time: 1730344313
//   },
//   {
//     hash: 'f59991db8d4086a6d7a6d08ddacbdde9c0b136ce4de4e0debb7942d148f7efc5',
//     subject: 'subject 432',
//     sender: 'bitcoincash:qr2zqrnqdulfmeqs2qe9c5p605lrwe90v5v735s2jl',
//     txid: '84fb0b2c739abc06657e7b7790d88f713420c97c8e3f8a3c374521242b2d070b',
//     time: 1729656368
//   }
// ]

```

### Retrieve a Message from a Nostr Relay

```javascript

const wallet = new BchWallet(undefined, {
  interface: 'consumer-api',
  restURL: 'https://free-bch.fullstack.cash'
})
await wallet.walletInfoPromise

const txid = '026d13c9b1920b72ea239a489408bf81ed7ceff47fb4ec3c383d56ab07bfefb7'

const inObj = {
  txid,
  wallet
}

const { message } = await bchNostr.read.getNostrMsgFromTxid(inObj)
console.log('message: ', message)

// message: 'This is clear text, but it could be an encrypted message.'
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

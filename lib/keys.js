/*
  This library contains utility functions for working with private and public
  keys, for both BCH and Nostr.
*/

// Global npm libraries
import { base58_to_binary as base58ToBinary } from 'base58-js'
import { getPublicKey } from 'nostr-tools/pure'

class Keys {
  constructor () {
    // Bind 'this' object to all subfunctions
    this.createNostrPubKeyFromWif = this.createNostrPubKeyFromWif.bind(this)
  }

  // Generate a Nostr pubkey from a WIF-format private key.
  // WIF is the standardized format for private keys for both BTC and BCH.
  createNostrPubKeyFromWif (inObj = {}) {
    try {
      const { wif } = inObj

      // Input validation
      if (!wif) throw new Error('createNostrPubKeyFromWif() requires an input object with the property \'wif\' containing a string of a WIF private key.')

      // Extract the privaty key from the WIF, using this guide:
      // https://learnmeabitcoin.com/technical/keys/private-key/wif/
      const wifBuf = base58ToBinary(wif)
      const privKeyBuf = wifBuf.slice(1, 33)

      // const privKeyHex = bytesToHex(privKeyBuf)

      const nostrPubKey = getPublicKey(privKeyBuf)

      return { privKeyBuf, nostrPubKey }
    } catch (err) {
      console.error('Error in bch-nostr/lib/keys.js createNostrPubKeyFromWif()')
      throw err
    }
  }
}

export default Keys

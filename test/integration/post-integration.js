/*
  Integration tests for the post.js library.
*/

// Global npm libraries
import { assert } from 'chai'

// Unit under test
import BchNostr from '../../index.js'
const bchNostr = new BchNostr()

describe('#post.js', () => {
  describe('#uploadToNostr', () => {
    it('should post a message to a Nostr relay with minimum inputs', async () => {
      try {
        const relayWs = 'wss://nostr-relay.psfoundation.info'

        const wif = 'L2HJYqrXgsVghD5fXQZY2X4upFuvvnmF9o3cF3s3AuDix3FzbcB1'
        const { privKeyBuf, nostrPubKey } = bchNostr.keys.createNostrPubKeyFromWif({ wif })

        const inObj = {
          privKeyBuf,
          nostrPubKey,
          relayWs,
          msg: 'This is a test message'
        }
        const result = await bchNostr.post.uploadToNostr(inObj)
        console.log('Event ID: ', result)

        assert.isString(result)
      } catch (err) {
        console.error('Error: ', err)
      }
    })
  })
})

/*
  Unit tests for the keys.js library
*/

// npm libraries
import { assert } from 'chai'
import sinon from 'sinon'

// Unit under test
import Keys from '../../lib/keys.js'
const uut = new Keys()

describe('#keys.js', () => {
  let sandbox

  beforeEach(() => {
    // Restore the sandbox before each test.
    sandbox = sinon.createSandbox()
  })

  afterEach(() => sandbox.restore())

  describe('#getBchData', () => {
    it('should throw error if WIF is not provided', async () => {
      try {
        await uut.createNostrPubKeyFromWif()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'createNostrPubKeyFromWif() requires an input object with the property')
      }
    })

    it('should generate a Nostr pubkey from a WIF private key', () => {
      const wif = 'L2HJYqrXgsVghD5fXQZY2X4upFuvvnmF9o3cF3s3AuDix3FzbcB1'

      const result = uut.createNostrPubKeyFromWif({ wif })
      // console.log('result: ', result)

      assert.equal(result.nostrPubKey, '8f97b3b776631f7504c000cff2740e3ba08f928522d45c57ce95d6a3bcbeec6e')
    })
  })
})

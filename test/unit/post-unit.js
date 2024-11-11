/*
  Unit tests for the post.js library.
*/

// npm libraries
import { assert } from 'chai'
import sinon from 'sinon'

// Local libraries
import Keys from '../../lib/keys.js'

// Unit under test
import Post from '../../lib/post.js'

describe('#post.js', () => {
  let sandbox
  let uut
  const keys = new Keys()

  beforeEach(() => {
    // Restore the sandbox before each test.
    sandbox = sinon.createSandbox()

    uut = new Post()
  })

  afterEach(() => sandbox.restore())

  describe('#uploadToNostr', () => {
    it('should throw error if privKeyBuf is not provided', async () => {
      try {
        await uut.uploadToNostr()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'A private key in UInt8Array format')
      }
    })

    it('should throw error if nostrPubKey is not provided', async () => {
      try {
        const wif = 'L2HJYqrXgsVghD5fXQZY2X4upFuvvnmF9o3cF3s3AuDix3FzbcB1'
        const { privKeyBuf } = keys.createNostrPubKeyFromWif({ wif })

        await uut.uploadToNostr({ privKeyBuf })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'A Nostr pubkey string is required')
      }
    })

    it('should throw error if relayWs is not provided', async () => {
      try {
        const wif = 'L2HJYqrXgsVghD5fXQZY2X4upFuvvnmF9o3cF3s3AuDix3FzbcB1'
        const { privKeyBuf, nostrPubKey } = keys.createNostrPubKeyFromWif({ wif })

        await uut.uploadToNostr({ privKeyBuf, nostrPubKey })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'A websocket address is required')
      }
    })

    it('should throw error if msg is not provided', async () => {
      try {
        const wif = 'L2HJYqrXgsVghD5fXQZY2X4upFuvvnmF9o3cF3s3AuDix3FzbcB1'
        const { privKeyBuf, nostrPubKey } = keys.createNostrPubKeyFromWif({ wif })

        const relayWs = 'wss://nostr-relay.psfoundation.info'

        await uut.uploadToNostr({ privKeyBuf, nostrPubKey, relayWs })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'A message string is required')
      }
    })

    it('should post a message to a Nostr relay', async () => {
      const wif = 'L2HJYqrXgsVghD5fXQZY2X4upFuvvnmF9o3cF3s3AuDix3FzbcB1'
      const { privKeyBuf, nostrPubKey } = keys.createNostrPubKeyFromWif({ wif })

      const relayWs = 'wss://nostr-relay.psfoundation.info'

      const inObj = {
        privKeyBuf,
        nostrPubKey,
        relayWs,
        msg: 'Test message'
      }

      // Mock dependencies and force desired code path
      sandbox.stub(uut, 'finalizeEvent').returns({ id: 'fake-id' })
      sandbox.stub(uut.Relay, 'connect').resolves({
        publish: async () => {},
        close: () => {}
      })

      const result = await uut.uploadToNostr(inObj)

      assert.equal(result, 'fake-id')
    })
  })
})

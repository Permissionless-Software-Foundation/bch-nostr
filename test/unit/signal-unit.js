/*
  Unit tests for signal.js library.
*/

// npm libraries
import { assert } from 'chai'
import sinon from 'sinon'
import BchWallet from 'minimal-slp-wallet'

// Unit under test
import Signal from '../../lib/signal.js'

describe('#post.js', () => {
  let sandbox
  let uut

  beforeEach(() => {
    // Restore the sandbox before each test.
    sandbox = sinon.createSandbox()

    uut = new Signal()
  })

  afterEach(() => sandbox.restore())

  describe('#sendMsgSignal', () => {
    it('should throw error if wallet is not provided', async () => {
      try {
        await uut.sendMsgSignal()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Instance of minimal-slp-wallet required as wallet input property.')
      }
    })

    it('should throw error if addr is not provided', async () => {
      try {
        await uut.sendMsgSignal({ wallet: {} })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Receiver address required as addr input property.')
      }
    })

    it('should throw error if wallet is not provided', async () => {
      try {
        await uut.sendMsgSignal({
          wallet: {},
          addr: 'fake-addr'
        })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Nostr Event ID required as eventId property.')
      }
    })

    it('should send a message signal', async () => {
      // Instantiate wallet library.
      const wallet = new BchWallet(undefined, {
        interface: 'consumer-api',
        restURL: 'https://free-bch.fullstack.cash/'
      })
      await wallet.walletInfoPromise

      // Mock dependencies
      sandbox.stub(wallet, 'getUtxos').resolves()
      sandbox.stub(uut, 'instanceMsgLib').returns()
      uut.msgLib = {
        memo: {
          writeMsgSignalNostr: async () => 'fake-hex'
        }
      }
      sandbox.stub(wallet.ar, 'sendTx').resolves('fake-txid')

      // Input object
      const inObj = {
        wallet,
        addr: 'fake-addr',
        subject: 'fake-subject',
        eventId: 'fake-id'
      }

      const result = await uut.sendMsgSignal(inObj)

      assert.equal(result.txid, 'fake-txid')
    })

    it('should throw error if message TX hex can not be created', async () => {
      try {
        // Instantiate wallet library.
        const wallet = new BchWallet(undefined, {
          interface: 'consumer-api',
          restURL: 'https://free-bch.fullstack.cash/'
        })
        await wallet.walletInfoPromise

        // Mock dependencies
        sandbox.stub(wallet, 'getUtxos').resolves()
        sandbox.stub(uut, 'instanceMsgLib').returns()
        uut.msgLib = {
          memo: {
            writeMsgSignalNostr: async () => undefined
          }
        }
        sandbox.stub(wallet.ar, 'sendTx').resolves('fake-txid')

        // Input object
        const inObj = {
          wallet,
          addr: 'fake-addr',
          subject: 'fake-subject',
          eventId: 'fake-id'
        }

        await uut.sendMsgSignal(inObj)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Could not build a hex transaction')
      }
    })
  })

  describe('#instanceMsgLib', () => {
    it('should instantiate the message library', async () => {
      // Instantiate wallet library.
      const wallet = new BchWallet(undefined, {
        interface: 'consumer-api',
        restURL: 'https://free-bch.fullstack.cash/'
      })
      await wallet.walletInfoPromise

      const msgLib = uut.instanceMsgLib({ wallet })

      assert.property(msgLib, 'memo')
    })
  })
})

/*
  Unit tests for signal.js library.
*/

// npm libraries
import { assert } from 'chai'
import sinon from 'sinon'
import BchWallet from 'minimal-slp-wallet'

// Unit under test
import Signal from '../../lib/signal.js'

describe('#signal.js', () => {
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

  describe('#checkMsgs', () => {
    it('should throw error if wallet is not provided', async () => {
      try {
        await uut.checkMsgs()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Instance of minimal-slp-wallet required as wallet input property.')
      }
    })

    it('should throw error if addr is not provided', async () => {
      try {
        await uut.checkMsgs({ wallet: {} })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Address to check for messages required as addr input property.')
      }
    })

    it('should check for message signals', async () => {
      // Instantiate wallet library.
      const wallet = new BchWallet(undefined, {
        interface: 'consumer-api',
        restURL: 'https://free-bch.fullstack.cash/'
      })
      await wallet.walletInfoPromise

      const mockData = [
        {
          hash: '2f4c17fd14c27314923f282abe280ad2938448150ff9b13c044ae95045a9716c',
          subject: '111824a',
          sender: 'bitcoincash:qr2zqrnqdulfmeqs2qe9c5p605lrwe90v5v735s2jl',
          txid: '026d13c9b1920b72ea239a489408bf81ed7ceff47fb4ec3c383d56ab07bfefb7',
          time: 1731967518
        },
        {
          hash: '53531b0424b64c7844de2aef2cf8ffebee9802086f968d44ddf07adac08ad73b',
          subject: 'test 10/30/24;7:21PM',
          sender: 'bitcoincash:qr2zqrnqdulfmeqs2qe9c5p605lrwe90v5v735s2jl',
          txid: 'e7537fbeebb367e09793286f636ec6a4a0b04ba556ec90691b5e0107d18cc5cb',
          time: 1730344313
        },
        {
          hash: 'f59991db8d4086a6d7a6d08ddacbdde9c0b136ce4de4e0debb7942d148f7efc5',
          subject: 'subject 432',
          sender: 'bitcoincash:qr2zqrnqdulfmeqs2qe9c5p605lrwe90v5v735s2jl',
          txid: '84fb0b2c739abc06657e7b7790d88f713420c97c8e3f8a3c374521242b2d070b',
          time: 1729656368
        }
      ]

      // Mock dependencies
      sandbox.stub(uut, 'instanceMsgLib').returns()
      uut.msgLib = {
        memo: {
          readMsgSignal: async () => mockData
        }
      }

      const addr = 'bitcoincash:qqfrps47nxdvak55h3x97dqmglcaczegusma02uhqt'

      // Input object
      const inObj = {
        wallet,
        addr
      }

      const result = await uut.checkMsgs(inObj)

      assert.isArray(result)
      assert.equal(result.length, 3)
    })

    it('should return all entries if limit is set to 0', async () => {
      // Instantiate wallet library.
      const wallet = new BchWallet(undefined, {
        interface: 'consumer-api',
        restURL: 'https://free-bch.fullstack.cash/'
      })
      await wallet.walletInfoPromise

      const mockData = [
        {
          hash: '2f4c17fd14c27314923f282abe280ad2938448150ff9b13c044ae95045a9716c',
          subject: '111824a',
          sender: 'bitcoincash:qr2zqrnqdulfmeqs2qe9c5p605lrwe90v5v735s2jl',
          txid: '026d13c9b1920b72ea239a489408bf81ed7ceff47fb4ec3c383d56ab07bfefb7',
          time: 1731967518
        },
        {
          hash: '53531b0424b64c7844de2aef2cf8ffebee9802086f968d44ddf07adac08ad73b',
          subject: 'test 10/30/24;7:21PM',
          sender: 'bitcoincash:qr2zqrnqdulfmeqs2qe9c5p605lrwe90v5v735s2jl',
          txid: 'e7537fbeebb367e09793286f636ec6a4a0b04ba556ec90691b5e0107d18cc5cb',
          time: 1730344313
        },
        {
          hash: 'f59991db8d4086a6d7a6d08ddacbdde9c0b136ce4de4e0debb7942d148f7efc5',
          subject: 'subject 432',
          sender: 'bitcoincash:qr2zqrnqdulfmeqs2qe9c5p605lrwe90v5v735s2jl',
          txid: '84fb0b2c739abc06657e7b7790d88f713420c97c8e3f8a3c374521242b2d070b',
          time: 1729656368
        }
      ]

      // Mock dependencies
      sandbox.stub(uut, 'instanceMsgLib').returns()
      uut.msgLib = {
        memo: {
          readMsgSignal: async () => mockData
        }
      }

      const addr = 'bitcoincash:qqfrps47nxdvak55h3x97dqmglcaczegusma02uhqt'

      // Input object
      const inObj = {
        wallet,
        addr,
        limit: 3
      }

      const result = await uut.checkMsgs(inObj)

      assert.isArray(result)
      assert.equal(result.length, 3)
    })

    it('should return number of results defined by limit', async () => {
      // Instantiate wallet library.
      const wallet = new BchWallet(undefined, {
        interface: 'consumer-api',
        restURL: 'https://free-bch.fullstack.cash/'
      })
      await wallet.walletInfoPromise

      const mockData = [
        {
          hash: '2f4c17fd14c27314923f282abe280ad2938448150ff9b13c044ae95045a9716c',
          subject: '111824a',
          sender: 'bitcoincash:qr2zqrnqdulfmeqs2qe9c5p605lrwe90v5v735s2jl',
          txid: '026d13c9b1920b72ea239a489408bf81ed7ceff47fb4ec3c383d56ab07bfefb7',
          time: 1731967518
        },
        {
          hash: '53531b0424b64c7844de2aef2cf8ffebee9802086f968d44ddf07adac08ad73b',
          subject: 'test 10/30/24;7:21PM',
          sender: 'bitcoincash:qr2zqrnqdulfmeqs2qe9c5p605lrwe90v5v735s2jl',
          txid: 'e7537fbeebb367e09793286f636ec6a4a0b04ba556ec90691b5e0107d18cc5cb',
          time: 1730344313
        },
        {
          hash: 'f59991db8d4086a6d7a6d08ddacbdde9c0b136ce4de4e0debb7942d148f7efc5',
          subject: 'subject 432',
          sender: 'bitcoincash:qr2zqrnqdulfmeqs2qe9c5p605lrwe90v5v735s2jl',
          txid: '84fb0b2c739abc06657e7b7790d88f713420c97c8e3f8a3c374521242b2d070b',
          time: 1729656368
        }
      ]

      // Mock dependencies
      sandbox.stub(uut, 'instanceMsgLib').returns()
      uut.msgLib = {
        memo: {
          readMsgSignal: async () => mockData
        }
      }

      const addr = 'bitcoincash:qqfrps47nxdvak55h3x97dqmglcaczegusma02uhqt'

      // Input object
      const inObj = {
        wallet,
        addr,
        limit: 1
      }

      const result = await uut.checkMsgs(inObj)

      assert.isArray(result)
      assert.equal(result.length, 1)
    })
  })
})

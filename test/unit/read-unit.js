/*
  Unit tests for the read.js library.
*/

// npm libraries
import { assert } from 'chai'
import sinon from 'sinon'
import BchWallet from 'minimal-slp-wallet'

// Unit under test
import Read from '../../lib/read.js'

describe('#signal.js', () => {
  let sandbox
  let uut

  beforeEach(() => {
    // Restore the sandbox before each test.
    sandbox = sinon.createSandbox()

    uut = new Read()
  })

  afterEach(() => sandbox.restore())

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

  describe('#getNostrMsg', () => {
    it('should throw an error if event ID is not provided', async () => {
      try {
        await uut.getNostrMsg()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'eventId required for input object to getNostrMsg()')
      }
    })

    it('should throw an error if relayWs is not provided', async () => {
      try {
        await uut.getNostrMsg({ eventId: 'fake-eventId' })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'relayWs required for input object to getNostrMsg()')
      }
    })

    it('should retrieve a message from a Nostr relay', async () => {
      // Mock dependencies
      uut.RelayPool = () => {
        return {
          on: (a, b) => {
            // console.log('on() called with a: ', a)
            // console.log('on() called with b: ', b)
            if (a.toString().includes('event')) {
              b(undefined, undefined, {
                id: '2f4c17fd14c27314923f282abe280ad2938448150ff9b13c044ae95045a9716c',
                kind: 1,
                pubkey: '9214123c2f952efc319de2a3b324d0dd7e6d61b9c7f6c625fe8388356297b971',
                created_at: 1731967284,
                content: '04495ecd73f95d0ffec17cbb797e7411d46a51e69b5396bec12d5441dca8a9648a1ae95cf35019ca50cc2b3d15efd64cc455754bbe03980bb9ec45bc8d55558fe0ad6c09c9e5fbca75741f850a5d3922b1c6b8978d67aea9516193b22877c00074cfd0b40820bb29513092c429da3d859c5e5828eae900ce9bd0de25bde0e19d1d',
                tags: [],
                sig: '80b8b72982870e3179c4a2de9a29c2b22e3185a7401b1abf8af6d5f96a45431885e297871e5d6b86280fbac37d41fdd7ba12d40e7d706cf598779e234d248f63'
              })
            }
          }
        }
      }

      const inObj = {
        eventId: 'fake-eventId',
        relayWs: 'http://fake.url'
      }

      const result = await uut.getNostrMsg(inObj)
      // console.log('result: ', result)

      assert.isString(result.message)
      assert.equal(result.message.includes('04495ecd73f95d0ffec1'), true)
    })

    it('should open and close connections to the relay', async () => {
      // Mock dependencies
      sandbox.stub(uut, 'createSub').returns()
      sandbox.stub(uut, 'closeConnection').returns()
      uut.RelayPool = () => {
        return {
          on: (a, b) => {
            // console.log('on() called with a: ', a)
            // console.log('on() called with b: ', b)
            if (a.toString().includes('event')) {
              b(undefined, undefined, {
                id: '2f4c17fd14c27314923f282abe280ad2938448150ff9b13c044ae95045a9716c',
                kind: 1,
                pubkey: '9214123c2f952efc319de2a3b324d0dd7e6d61b9c7f6c625fe8388356297b971',
                created_at: 1731967284,
                content: '04495ecd73f95d0ffec17cbb797e7411d46a51e69b5396bec12d5441dca8a9648a1ae95cf35019ca50cc2b3d15efd64cc455754bbe03980bb9ec45bc8d55558fe0ad6c09c9e5fbca75741f850a5d3922b1c6b8978d67aea9516193b22877c00074cfd0b40820bb29513092c429da3d859c5e5828eae900ce9bd0de25bde0e19d1d',
                tags: [],
                sig: '80b8b72982870e3179c4a2de9a29c2b22e3185a7401b1abf8af6d5f96a45431885e297871e5d6b86280fbac37d41fdd7ba12d40e7d706cf598779e234d248f63'
              })
            } else {
              b(undefined)
            }
          }
        }
      }

      const inObj = {
        eventId: 'fake-eventId',
        relayWs: 'http://fake.url'
      }

      const result = await uut.getNostrMsg(inObj)
      // console.log('result: ', result)

      assert.isString(result.message)
      assert.equal(result.message.includes('04495ecd73f95d0ffec1'), true)
    })
  })

  describe('#getEventIdFromTx', () => {
    it('should throw error if tx data is not provided', async () => {
      try {
        await uut.getEventIdFromTx()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'tx data object required')
      }
    })

    it('should get an Event ID from a BCH TX', async () => {
      // Instantiate wallet library.
      const wallet = new BchWallet(undefined, {
        interface: 'consumer-api',
        restURL: 'https://free-bch.fullstack.cash/'
      })
      await wallet.walletInfoPromise

      uut.instanceMsgLib({ wallet })

      const inObj = {
        tx: {
          vout: [
            {
              value: 0,
              n: 0,
              scriptPubKey: {
                asm: 'OP_RETURN -21101 4d5347204e4f53545220326634633137666431346332373331343932336632383261626532383061643239333834343831353066663962313363303434616539353034356139373136632031313138323461',
                hex: '6a026dd24c524d5347204e4f53545220326634633137666431346332373331343932336632383261626532383061643239333834343831353066663962313363303434616539353034356139373136632031313138323461',
                type: 'nulldata'
              }
            }
          ]
        }
      }

      const result = await uut.getEventIdFromTx(inObj)
      // console.log('result: ', result)

      assert.property(result, 'eventId')
      assert.equal(result.eventId, '2f4c17fd14c27314923f282abe280ad2938448150ff9b13c044ae95045a9716c')
    })

    it('should throw an error if event ID can not be found in the TX', async () => {
      // Instantiate wallet library.
      const wallet = new BchWallet(undefined, {
        interface: 'consumer-api',
        restURL: 'https://free-bch.fullstack.cash/'
      })
      await wallet.walletInfoPromise

      uut.instanceMsgLib({ wallet })

      const inObj = {
        tx: {
          vout: [
            {
              value: 0,
              n: 0,
              scriptPubKey: {
                asm: 'OP_DUP OP_HASH160 a0f2535fb89a0be4bde43bb4fd5842a0d2e42200 OP_EQUALVERIFY OP_CHECKSIG',
                hex: '76a914a0f2535fb89a0be4bde43bb4fd5842a0d2e4220088ac',
                reqSigs: 1,
                type: 'pubkeyhash',
                addresses: [
                  'bitcoincash:qzs0y56lhzdqhe9ausamfl2cg2sd9epzqqrj7n7sr2'
                ]
              }
            }
          ]
        }
      }

      try {
        await uut.getEventIdFromTx(inObj)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Message not found!')
      }
    })
  })

  describe('#getNostrMsgFromTxid', () => {
    it('should throw error if txid is not included', async () => {
      try {
        await uut.getNostrMsgFromTxid()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'txid property in input object required when calling getNostrMsgFromTxid()')
      }
    })

    it('should throw error if wallet is not included', async () => {
      try {
        await uut.getNostrMsgFromTxid({ txid: 'fake-txid' })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Instance of minimal-slp-wallet required as wallet property of input object when calling getNostrMsgFromTxid()')
      }
    })

    it('should get a Nostr message Event ID from a TXID', async () => {
      // Instantiate wallet library.
      const wallet = new BchWallet(undefined, {
        interface: 'consumer-api',
        restURL: 'https://free-bch.fullstack.cash/'
      })
      await wallet.walletInfoPromise

      // Mock Dependencies
      sandbox.stub(wallet, 'getTxData').resolves([{
        vout: [{
          value: 0,
          n: 0,
          scriptPubKey: {
            asm: 'OP_RETURN -21101 4d5347204e4f53545220326634633137666431346332373331343932336632383261626532383061643239333834343831353066663962313363303434616539353034356139373136632031313138323461',
            hex: '6a026dd24c524d5347204e4f53545220326634633137666431346332373331343932336632383261626532383061643239333834343831353066663962313363303434616539353034356139373136632031313138323461',
            type: 'nulldata'
          }
        }],
        vin: [{
          address: 'bitcoincash:qr2zqrnqdulfmeqs2qe9c5p605lrwe90v5v735s2jl'
        }]
      }])
      sandbox.stub(uut, 'getNostrMsg').resolves({ message: 'fake-message' })

      const inObj = {
        txid: '026d13c9b1920b72ea239a489408bf81ed7ceff47fb4ec3c383d56ab07bfefb7',
        wallet
      }

      const result = await uut.getNostrMsgFromTxid(inObj)
      // console.log('result: ', result)

      assert.property(result, 'message')
      assert.property(result, 'sender')

      assert.equal(result.message.includes('fake-message'), true)
      assert.equal(result.sender, 'bitcoincash:qr2zqrnqdulfmeqs2qe9c5p605lrwe90v5v735s2jl')
    })
  })

  describe('#createSub', () => {
    it('should create a subscription', () => {
      // Mock Dependencies
      const relay = {
        subscribe: () => {}
      }
      const eventId = '12345'

      uut.createSub({ relay, eventId })

      // Not throw
      assert.isOk(1)
    })
  })

  describe('#createSub', () => {
    it('should create a subscription', () => {
      // Mock Dependencies
      const relay = {
        subscribe: () => {}
      }
      const eventId = '12345'

      const result = uut.createSub({ relay, eventId })

      assert.equal(result, true)
    })
  })

  describe('#closeConnection', () => {
    it('should close a connection to a relay', () => {
      // Mock Dependencies
      const relay = {
        close: () => {}
      }

      const result = uut.closeConnection({ relay })

      assert.equal(result, true)
    })
  })
})

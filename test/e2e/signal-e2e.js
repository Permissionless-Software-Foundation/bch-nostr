/*
  end-to-end tests for the signal.js library.
*/

// Global npm libraries
import BchWallet from 'minimal-slp-wallet'
import { assert } from 'chai'

// Unit under test
import BchNostr from '../../index.js'
const bchNostr = new BchNostr()

// Customize this WIF private key for your own test. Ensure it has a few thousand
// sats of BCH.
const WIF = 'KwTZ3nCkprAVfhv9ixsFJw3sExcWdjKFuUaFdJsfUFbeGsZdBGnP'
// bitcoincash:qzs0y56lhzdqhe9ausamfl2cg2sd9epzqqrj7n7sr2

const receiver = 'bitcoincash:qzwu79a6dp88sxwq8wy80ak694v9gqshaun2xrj5ut'
// L1GwFZCu3bzanyX7iGvq43TvCt3y5KMQ9wyeJ3sjKnBpKNzJnivu

describe('#signal.js', () => {
  describe('#sendMsgSignal', () => {
    it('should send a message signal to a BCH address.', async () => {
      try {
        const wallet = new BchWallet(WIF, {
          interface: 'consumer-api',
          restURL: 'https://free-bch.fullstack.cash'
        })
        await wallet.initialize()

        // Check the balance before running test.
        const balance = await wallet.getBalance()
        if (balance < 2000) throw new Error('Not enough BCH in wallet to conduct test')

        const inObj = {
          wallet,
          addr: receiver,
          subject: 'test',
          eventId: '12345'
        }

        const result = await bchNostr.signal.sendMsgSignal(inObj)

        // console.log('txid: ', txid)
        assert.property(result, 'txid')
        assert.isString(result.txid)
      } catch (err) {
        console.error('Error: ', err)
      }
    })
  })
})

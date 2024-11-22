/*
  Integration tests for the read.js library.
*/

// Global npm libraries
import { assert } from 'chai'
import BchWallet from 'minimal-slp-wallet'

// Unit under test
import BchNostr from '../../index.js'
const bchNostr = new BchNostr()

describe('#read.js', () => {
  describe('#getNostrMsgFromTxid', () => {
    it('should return messages for an address', async () => {
      const wallet = new BchWallet(undefined, {
        interface: 'consumer-api',
        restURL: 'https://free-bch.fullstack.cash'
      })
      await wallet.walletInfoPromise

      const txid = '026d13c9b1920b72ea239a489408bf81ed7ceff47fb4ec3c383d56ab07bfefb7'
      // const txid='691c8a6873c42204aa85cb263b8c811963020b6a45bb128f856ed71fe1be6bb2'

      const inObj = {
        txid,
        wallet
      }

      const { message } = await bchNostr.read.getNostrMsgFromTxid(inObj)
      console.log('message: ', message)

      assert.isString(message)
    })
  })
})

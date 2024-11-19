/*
  Integration tests for the signal.js library.
*/

// Global npm libraries
import { assert } from 'chai'
import BchWallet from 'minimal-slp-wallet'

// Unit under test
import BchNostr from '../../index.js'
const bchNostr = new BchNostr()

describe('#signal.js', () => {
  describe('#checkMsgs', () => {
    it('should return messages for an address', async () => {
      const wallet = new BchWallet(undefined, {
        interface: 'consumer-api',
        restURL: 'https://free-bch.fullstack.cash'
      })
      await wallet.walletInfoPromise

      const addr = 'bitcoincash:qqfrps47nxdvak55h3x97dqmglcaczegusma02uhqt'

      const inObj = {
        wallet,
        addr,
        limit: 3
      }

      const result = await bchNostr.signal.checkMsgs(inObj)
      console.log('result: ', result)

      assert.equal(result.length, 3)
    })
  })
})

/*
  This library is concerned with posting message to a Nostr relay.
*/

// Global npm libraries
import { finalizeEvent } from '@chris.troutner/nostr-tools/pure'
import { Relay, useWebSocketImplementation } from '@chris.troutner/nostr-tools/relay'
import WebSocket from 'ws'

// Configure node.js websocket implemention for nostr-tools.
useWebSocketImplementation(WebSocket)

class Post {
  constructor () {
    // Encapsulate dependencies
    this.finalizeEvent = finalizeEvent
    this.Relay = Relay

    // Bind 'this' object to all subfunctions
    this.uploadToNostr = this.uploadToNostr.bind(this)
  }

  // Upload a message to a Nostr relay. Returnes the unique event ID of the
  // published message.
  // If not specified, the kind is set to 1 and the tags array is empty.
  async uploadToNostr (inObj = {}) {
    try {
      const { privKeyBuf, nostrPubKey, relayWs, msg, kind = 1, tags = [] } = inObj

      // Input validation
      if (!privKeyBuf) throw new Error('A private key in UInt8Array format is required as the privKeyBuf property of the input object to uploadToNostr()')
      if (!nostrPubKey) throw new Error('A Nostr pubkey string is required as the nostrPubKey property of the input object to uploadToNostr()')
      if (!relayWs) throw new Error('A websocket address is required as the relayWs property of the input object to uploadToNostr()')
      if (!msg) throw new Error('A message string is required as the msg property of the input object to uploadToNostr()')

      // Generate a Nostr post.
      const eventTemplate = {
        kind,
        created_at: Math.floor(Date.now() / 1000),
        tags,
        content: msg
      }

      // Sign the post
      const signedEvent = this.finalizeEvent(eventTemplate, privKeyBuf)
      // console.log('signedEvent: ', signedEvent)
      const eventId = signedEvent.id

      // Connect to a relay.
      const relay = await this.Relay.connect(relayWs)
      // console.log(`connected to ${relay.url}`)

      // Publish the message to the relay.
      await relay.publish(signedEvent)

      // Close the connection to the relay.
      relay.close()

      return eventId
    } catch (err) {
      if (typeof err === 'string') {
        throw new Error(err)
      }

      console.error('Error in bch-nostr/lib/post.js/uploadToNostr(): ', err)
      throw err
    }
  }
}

export default Post

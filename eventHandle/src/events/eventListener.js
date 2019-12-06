const { Stream } = require('sawtooth-sdk/messaging/stream');

const VALIDATOR_URL = "tcp://validator:4004";
// const VALIDATOR_URL = "tcp://localhost:4004";
const stream = new Stream(VALIDATOR_URL);
const {eventHandler, setSocket} = require('./eventHandler');
const {subscriptionHandler} = require('../subscription/subscriptionHandler');

const startEventListener = (socketConnection) => {
    console.log();
    console.log("   [x] Starting event listener...");
    console.log();
    setSocket(socketConnection);
    stream.connect(() => {
      console.log();
      console.log("   [x]connected to validator...");
      console.log();
      stream.onReceive(eventHandler);
      subscriptionHandler(stream);
    })
}

module.exports = startEventListener
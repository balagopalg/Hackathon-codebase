const _ = require('lodash');
const { getSub } = require('./subscriptions');
const {
  Message,
  ClientEventsSubscribeRequest,
  ClientEventsSubscribeResponse
} = require('sawtooth-sdk/protobuf');

const subscriptionHandler = (stream) => {
  const clientSubscriptionRequest = ClientEventsSubscribeRequest.encode({
    subscriptions: getSub()
  }).finish();

  stream.send(
    Message.MessageType.CLIENT_EVENTS_SUBSCRIBE_REQUEST,
    clientSubscriptionRequest
  )
    .then((response) => {
      return ClientEventsSubscribeResponse.decode(response);
    })
    .then(decodedMessage => {
      const status = getSubscriptionStatus(decodedMessage);
      if (status !== 'OK') {
        throw new Error(`Validator responded with status "${status}"`)
      }
    })
}

const getSubscriptionStatus = (decodedResponse) => {
  
  const status = _.findKey(ClientEventsSubscribeResponse.Status,
    val => val === decodedResponse.status);

  console.log("Subscription status is : ", status);
  return status;
}

module.exports = {
  subscriptionHandler
};
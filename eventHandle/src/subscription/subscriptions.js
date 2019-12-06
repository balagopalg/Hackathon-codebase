const {EventSubscription} = require('sawtooth-sdk/protobuf');

const subsriptions = [
    EventSubscription.create({
        eventType: 'sawtooth/block-commit'
      }),
    EventSubscription.create({
      eventType: 'sawtooth/state-delta'
    }),
    EventSubscription.create({
      eventType: 'ehrecords/stored-data'
    })
];

getSub = () => {
    return subsriptions;
}

module.exports = {
  getSub
};
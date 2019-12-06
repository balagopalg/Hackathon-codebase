'use strict'

const _ = require('lodash');
const {
  isEventMessage,
  isBlockCommitEvent,
  isStoreDataEvent
} = require('./eventsCheck');
const {
    Message,
    EventList,
    StateChangeList
  } = require('sawtooth-sdk/protobuf')
let socket;

const setSocket = (currentSocket) => {
  socket = currentSocket;
}

// Handle event message received by stream
const eventHandler = (msg) => {
  console.log();
  console.log("     [x] Stream message...", msg);
  console.log();
    // Check if the message is an event message
    if (isEventMessage(msg)) {
      console.log();
      console.log("Event message received \n", msg);
      console.log();
      // Get the list of events
      const events = getEventsFromMessage(msg);
      console.log();
      console.log("Events we got from the message \n", events)
      console.log();
      // Iterate over each event and process
      let blockNum = 0;
      events.forEach(event => {
        if (isBlockCommitEvent(event)) {
          console.log(" [*]  block-commit happened");
          blockNum++;
          sendBlockUpdate(event);
        }
        if(isStoreDataEvent(event)){
          console.log();
          console.log(' [*]  Data Stored');
          console.log();
          storeDataCallback(event);
        }
      });    
    } 
    else {
      console.warn('Received message of unknown type:', msg.messageType)
    }
  }
  
  const getEventsFromMessage = (msg) => {
    return EventList.decode(msg.content).events;
  }

/*----------------------------------------------------*/


const sendBlockUpdate = (event) => {
    const blockData = getBlock(event);
    console.log("Block commit readable data", blockData);
    socket.emit('blockCommit', blockData);
}

   // Parse Block Commit Event
const getBlock = (events) => {
    const block = _.chain(events)
        //.find(e => e.eventType === 'sawtooth/block-commit')
        .get('attributes')
        .map(a => [a.key, a.value])
        .fromPairs()
        .value()
    return {
        blockNum: parseInt(block.block_num),
        blockId: block.block_id,
        stateRootHash: block.state_root_hash
    }
}

const storeDataCallback = (event) => {
  const address = _.chain(event)
                   .get('attributes')
                   .map(atr => {
                     return [atr.key, atr.value]
                   })
                   .fromPairs()
                   .value();

  console.log();
  console.log(' [*] address --> ', address);
  console.log();

  socket.emit('dataStored', address);

}


  
module.exports = { eventHandler, setSocket };
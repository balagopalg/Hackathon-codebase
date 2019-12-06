const io = require('socket.io-client');

const socket = io('http://sawtooth-eventhandle:9000');

// socket.on('connect', () =>{
//     console.log();
//     console.log("connectect id => ", socket.id);
//     console.log();
// });

// socket.on('disconnect',() => {
//     console.log("disconnect");
// });

// socket.on('blockCommit',(message) => {
//     console.log(message);
// });

async function transactionsCompleat (addr, prommis) {
    // return new Promise((resolve, reject) => {});

    const prom = prommis || new Promise(async (resolve, reject) => {
        console.log("await@!!!");

        socket.on('connect', () =>{
            console.log();
            console.log("connectect id => ", socket.id);
            console.log();
        });
        
        socket.on(`dataStored@${addr}`,async (message) => {
            console.log("event triggered!!!")
            console.log(message.address);
            if(message.address == addr){
                console.log(`${message.address} = ${addr}`);
                resolve(message);
                socket.disconnect();
            }
            else{
                console.log("error?")
            }
                        
        });
        
    });
    
    return prom;
}

module.exports = { transactionsCompleat }

const socket = require('socket.io');

const eI = require('./events/eventListener.js');

const io = socket();

io.on('connection', client => {
    console.log();
    console.log('[x] Incoming conection...');
    console.log();
    eI(client);
});


io.listen(9000);
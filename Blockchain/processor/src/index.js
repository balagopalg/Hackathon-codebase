const {TransactionProcessor} = require('sawtooth-sdk/processor');

const EhrRecodsHandler = require('./TP');

const URL = 'tcp://validator:4004'

const tp = new TransactionProcessor(URL);

tp.addHandler(new EhrRecodsHandler ());

tp.start();
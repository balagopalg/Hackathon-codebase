const protobuf = require('sawtooth-sdk/protobuf');
const { Secp256k1PrivateKey } = require('sawtooth-sdk/signing/secp256k1');
const { createHash } = require('crypto');
const { CryptoFactory, createContext } = require('sawtooth-sdk/signing');
const fetch = require('node-fetch');

const { logger } = require('./log');


const hexKey = createHash('sha512').update('ehr').digest('hex').substr(64);
const key = Secp256k1PrivateKey.fromHex(hexKey);
const context = createContext('secp256k1');
const signer = new CryptoFactory(context).newSigner(key);
let transactions = [];

addTransaction = ({transaction, address}) => {
  if (transactions.length > 0) {
    transactions = [transaction]
  }
  else {
    transactions.push(transaction);
  }

  logger.info(`Added transaction for ${address}`)
}

makeBatchList = () => {
  const batchHeaderBytes = protobuf.BatchHeader.encode({
    signerPublicKey: signer.getPublicKey().asHex(),
    transactionIds: transactions.map((txn) => txn.headerSignature),
  }).finish();

  const batchSignature = signer.sign(batchHeaderBytes);
  const batch = protobuf.Batch.create({
    header: batchHeaderBytes,
    headerSignature: batchSignature,
    transactions: transactions,
  });


  const batchListBytes = protobuf.BatchList.encode({
    batches: [batch]
  }).finish();

  logger.info("Batch list created");

  return batchListBytes;
}

sendToValidator = async () => {
  const batchListBytes = makeBatchList();
  try {
    const resp = await fetch('http://rest-api:8008/batches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream'
      },
      body: batchListBytes
    });
    const json = await resp.json();
    if(!resp.ok){
      throw json;
    }
    logger.info("Successfully send the batchlist to validator")
    logger.info(JSON.stringify(json));
    return true;
  }
  catch (error) {
    logger.error(`Error in sending the batchlist!!`);
    logger.error(JSON.stringify(error));
    throw false;

  }
}

module.exports = { addTransaction, sendToValidator };

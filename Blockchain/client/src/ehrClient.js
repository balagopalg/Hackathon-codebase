const { createHash } = require('crypto');
const { CryptoFactory, createContext } = require('sawtooth-sdk/signing');
const protobuf = require('sawtooth-sdk/protobuf');
const fetch = require('node-fetch');
const { Secp256k1PrivateKey } = require('sawtooth-sdk/signing/secp256k1');
const { TextEncoder, TextDecoder } = require('text-encoding/lib/encoding');
const amqp = require('amqplib/callback_api');

FAMILY_NAME = 'ehrecords'
const hexKey = createHash('sha512').update('ehr').digest('hex').substr(64);
const bkey = Secp256k1PrivateKey.fromHex(hexKey);
const bcontext = createContext('secp256k1');
const bsigner = new CryptoFactory(bcontext).newSigner(bkey);


function hash(v) {
  return createHash('sha512').update(v).digest('hex');
}

class EhrClient {
  constructor(key) {
    console.log("length", key.length)
    const context = createContext('secp256k1');
    const secp256k1pk = Secp256k1PrivateKey.fromHex(key);

    this.signer = new CryptoFactory(context).newSigner(secp256k1pk);
    console.log("what ever this is **********", this.signer);
    this.publicKey = this.signer.getPublicKey().asHex();
    this.address = this.get_address(this.publicKey);
    console.log("Storing at: " + this.address);
  }

  get_address(publicKey) {
    var Address = hash("ehrecords").substr(0, 6) + hash(publicKey).substr(0, 64);
    return Address
  }

  async send_data(values) {
    var payload = ''
    var address = this.address;
    console.log("output " + address)
    var inputAddressList = [address];
    var outputAddressList = [address];
    payload = JSON.stringify(values);
    console.log("senddata ---->  ", payload)
    var encode = new TextEncoder('utf8');
    const payloadBytes = encode.encode(payload)
    const transactionHeaderBytes = protobuf.TransactionHeader.encode({
      familyName: 'ehrecords',
      familyVersion: '1.0',
      inputs: inputAddressList,
      outputs: outputAddressList,
      signerPublicKey: this.signer.getPublicKey().asHex(),
      nonce: "" + Math.random(),
      batcherPublicKey: bsigner.getPublicKey().asHex(),
      dependencies: [],
      payloadSha512: hash(payloadBytes),

    }).finish();

    const transaction = protobuf.Transaction.create({
      header: transactionHeaderBytes,
      headerSignature: this.signer.sign(transactionHeaderBytes),
      payload: payloadBytes
    });

    const qMsg = {
      address: this.address,
      transaction: transaction
    }
    
    try {
      await sendToQ(qMsg);
      return true;

    }
    catch(err){
      throw false;
    }
    
  }

  async _send_to_rest_api(batchListBytes) {

    if (batchListBytes == null) {
      try {
        var geturl = 'http://rest-api:8008/state/' + this.address
        console.log("Getting from: " + geturl);
        let response = await fetch(geturl, {
          method: 'GET',
        })
        let responseJson = await response.json();
        var data = responseJson.data;
        var datas = new Buffer(data, 'base64').toString();
        return datas;
      }
      catch (error) {
        console.error(error);
      }
    }
    else {
      console.log("new code");
      try {
        resp = await fetch('http://rest-api:8008/batches', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream'
          },
          body: batchListBytes
        })
        console.log("response", resp);
      }
      catch (error) {
        console.log("error in fetch", error);

      }
    }

  }
};

sendToQ = async (msg) => {
  const q = "ehrQ";
  await amqp.connect('amqp://ehr-queue',(e, c) => {
    if(e){
      throw e;
    }
    c.createConfirmChannel((e, c) => {
      if(e){
        throw e;
      }

      c.assertQueue(q, {
        durable: true
      });
      
      console.log();
      console.log(` [x] Sending message =>  ${JSON.stringify(msg)} to queue!`);
      console.log();

      c.sendToQueue(q, Buffer.from(JSON.stringify(msg)), {
        persistent: true
      }, (e, o) => {
        if(e){
          console.log();
          console.log(' [*]  Error sending message to queue');
          console.log();
          c.close();
          throw e;
        }
        else{
          console.log();
          console.log(' [*]  Send message successfully!!');
          console.log();
          c.close();
          return true;
        }
      });

    });
  });
}


module.exports = EhrClient;

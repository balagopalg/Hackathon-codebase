const {TextEncoder, TextDecoder} = require('text-encoding/lib/encoding');
const { TransactionHandler } = require('sawtooth-sdk/processor/handler');
const { InvalidTransaction } = require('sawtooth-sdk/processor/exceptions');
const crypto = require('crypto');

var enc = new TextEncoder('utf8')
var dec = new TextDecoder('utf8')

FAMILY_NAME='ehrecords';
const NAMESPACE = hash(FAMILY_NAME).substring(0, 6);

function hash(pk) {
    return crypto.createHash('sha512').update(pk).digest('hex');
}

function writeToStore(context, address, msg){
    let msgBytes = enc.encode(msg);
    let entries = {
        [address]: msgBytes 
      }
    return context.setState(entries);
}

class EhrRecorsHandler extends TransactionHandler{
    constructor(){
        super(FAMILY_NAME, ['1.0'], [NAMESPACE]);
    }

    async apply(transactionProcessRequest, context){
        var msg = dec.decode(transactionProcessRequest.payload);
        let header = transactionProcessRequest.header;
        this.publicKey = header.signerPublicKey
        this.address = hash(FAMILY_NAME).substr(0, 6) + hash(this.publicKey).substr(0, 64);
        console.log();
        msg = JSON.parse(msg);
        console.log("msg ---> ",`{ msg:${msg.action}, payload:${msg.payload} }`);
        console.log();
        if( msg.action === "data-store"){
            try{
                const trList = await writeToStore(context, this.address, msg.payload);
                context.addEvent(`${FAMILY_NAME}/stored-data`, [['address', this.address]],"" );
                return trList;
            }
            catch(err){
                return err;
            }            
            
        }
        throw new InvalidTransaction("Unknown action!!!");
        ;
    }
}
module.exports = EhrRecorsHandler;
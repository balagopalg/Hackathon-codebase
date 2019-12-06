const Enc_Dec = require('../utils/encrypt');

const fetch = require('node-fetch');
const { createContext, CryptoFactory } = require('sawtooth-sdk/signing')
const Decryps = require('../models/keyessentials')
const { logger } = require('../log/log');




exports.Postdata = async (req, res, next) => {
    let hnID = req.body.hnID;
    let data = req.body.data;
    let enc = new Enc_Dec();

    logger.info(`req.body ${JSON.stringify(req.body)}`)



    const context = createContext('secp256k1')
    let privateKey = context.newRandomPrivateKey().asHex();
    // console.log("type of private key", typeof (signer));

    let cipherData = enc.encrypt(data);
    let ciphers = cipherData.split(":");
    const decryps = new Decryps({
        _id: hnID,
        IV: ciphers[1],
        Key: ciphers[2],
        tag: ciphers[3],
        privk: privateKey
    });
    decryps
        .save()
        .then(data => {
            logger.info("data added");
        })
        .catch(err => {
            logger.error(err.message);
        })


    let encryp = ciphers[0]

    try {
        const payload = {
            action: "data-store",
            payload: encryp
        }
        const resp = await fetch('http://sawtooth-client:3000/datain', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                key: privateKey,
                payload: payload
            })
        });
        const data = await resp.json();
        logger.info(data);    
        if(resp.ok){
            logger.info(data);
            return res.status(202).json({ message: "data recieved", data: encryp, privatekey: privateKey });
        }
        else{
            throw res.status(500).json(data);
        }
    }
    catch (error) {
        logger.error("error in fetch", error);
        return res.status(500).json({ message: "Internal server error", id: "ehrEr001"});
    }

    
}


exports.getDataById = async (req, res, next) => {
    let hnID = req.params.hnId;
    console.log("id is : " + hnID)

    try {
        let doc = await Decryps.findById({ _id: hnID });
        ;
        var geturl = 'http://sawtooth-client:3000/dataout/' + doc.privk
        let response = await fetch(geturl, {
            method: 'GET',
        })
        let responseJson = await response.json();
        logger.info(`response -> ${responseJson}`);

        let dec = new Enc_Dec();
        let data = dec.decrypt(responseJson.data, doc.IV, doc.Key, doc.tag)
        res.status(200).json({ data: data, message: "worked" });
    }
    catch (err) {
        logger.error(err);
    }
}
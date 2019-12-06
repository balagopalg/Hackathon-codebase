const crypto = require('crypto');


let ALGORITHM = 'AES-128-CBC'; 
let HMAC_ALGORITHM = 'SHA256';
let HMAC_KEY = "8y/B?E(H+MbQeThVmYq3t6w9z$C&F)J@"; 



class Encrypt {

 encrypt(text) {
    const key = Buffer.from(crypto.randomBytes(16));
    const IV = Buffer.from(crypto.randomBytes(16)); 
    let hmac;

    let cipher = crypto.createCipheriv(ALGORITHM, key, IV);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    hmac = crypto.createHmac(HMAC_ALGORITHM, HMAC_KEY);
    hmac.update(encrypted);
    hmac.update(IV.toString('hex'));

    return encrypted.toString('hex')+":"+ IV.toString('hex')+":"+key.toString('hex')+":"+ hmac.digest('hex') ;
   }
   
 decrypt(text,iv,Key,hmac,) {
    let encryptedText = Buffer.from(text, 'hex');
    let IV = Buffer.from(iv,'hex');
    let key = Buffer.from(Key,'hex');


    let chmac = crypto.createHmac(HMAC_ALGORITHM, HMAC_KEY);
        chmac.update(encryptedText);
        chmac.update(IV.toString('hex'));
        let chmacd = chmac.digest('hex');

    if (!this.constant_time_compare(chmacd,hmac)){
        console.log("Encrypted Blob has been tampered with...");
        return null;
       
    }  
        console.log("passed constant time");


    let decipher = crypto.createDecipheriv(ALGORITHM,key, IV);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
   }



 constant_time_compare  (val1, val2) {
    var sentinel;

    if (val1.length !== val2.length) {
        return false;
    }


    for (var i = 0; i <= (val1.length - 1); i++) {
        sentinel |= val1.charCodeAt(i) ^ val2.charCodeAt(i);
    }

    return sentinel === 0
};





}




module.exports = Encrypt;
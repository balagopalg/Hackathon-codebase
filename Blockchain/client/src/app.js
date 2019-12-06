const express = require('express');
const cors = require('cors');
const bodyparser = require('body-parser');

const client = require('./ehrClient');

const app = express();

app.use(cors());

app.use(bodyparser.json());



const posting = async (req, res, next) => {
    // console.log("sawclient post enter", req.body);
    let key = req.body.key;
    let payload = req.body.payload;
    try {
        let ehr = new client(key);
        let response = await ehr.send_data(payload);
        res.status(202).json({ message: "data succesfully send to Blockchain" });
    }
    catch (e) {
        res.status(500).json({ message: "Internal server error", id: "ehrEr002"});
        // console.log(e.message);
        // console.log("the problem is --->", e);
    }

}

const getting = async (req, res, next) => {
    let key = req.params.key;
    // console.log("key ->", key, typeof (key));
    let ehr = new client(key);
    let data = await ehr._send_to_rest_api(null);
    res.status(200).json({ message: "encrypted text is received", data: data });
}


app.post('/datain', posting);

app.get('/dataout/:key', getting);

app.listen(3000, () => {
    // console.log("listening in sawclient api 3000");
});

const mongo = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017?retryWrites=true&writeConcern=majority";
const express = require("express");
const cors = require('cors');
const { ObjectId } = require('mongodb');
var app = express();

app.use(cors({
    origin: '*'
}),
express.json());

let db, temperature;

mongo.connect(url, function (err, client) {
    if (err || !client) {
        console.log(err);
        return;
    }
    db = client.db("tempdb");
    temperature = db.collection("temperature");
    
});

app.get("/getTemp", async function (req, res) {
    await temperature.find({}).sort({the_date:-1})
        .toArray(function (err, result) {
            if (err) {
                res.result(400).send("Error getting temperature");
            } else {
                res.json(result);
            }
        });
});

app.post("/addTemp", function (req, res) {
    temperature.insertOne({
        the_temp: req.body.temp,
        the_date: new Date()
    }, function (err, result) {
        if (err) {
            res.status(400).send("Error adding temp");
        } else {
            res.status(204).send();
        }
    });
});

app.post("/updateTemp", function (req, res) {
    temperature.updateOne({ _id: ObjectId(req.body.id) },
        {$set:{
            the_temp: req.body.the_temp
        }}, {upsert:true}, function (err, result) {
            if (err) {
                res.status(400).send(`Error updating temp`);
            } else {
                res.status(204).send();
            }
        })
});

app.delete("/deleteTemp", (req, res) => {
    temperature.deleteOne({ _id: ObjectId(req.body.id) }, function (err, result) {
        if (err) {
            res.status(400).send(`Error deleting temp`);
        } else {
            res.status(204).send();
        }
    });
});

var server = app.listen(4999, '192.168.50.10', function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("listening at http://%s:%s", host, port);
});


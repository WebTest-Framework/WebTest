import express from 'express';
var app = express();
import bodyParser from 'body-parser';
import * as apilib from './apilib';

var urlencodedParser = bodyParser.urlencoded({ extended: true });

app.listen(16720, () => {
    console.log("Server running on port 16720");
});

app.get("/api/testdata/gettestdata", (req: any, res: express.Response<any, any>) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    res.send(apilib.getTestData());
});
app.get("/api/testdata/searchtestdata", (req: any, res: express.Response<any, any>) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    var searchResults = apilib.searchTestData(req.query.searchEntity);
    res.json(searchResults || {});
});
app.get("/api/testdata/getTestDataFiles", (req: any, res: express.Response<any, any>) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    var isSubTypePresent = apilib.getTestDataFiles(req.query.testSubPath);
    var resp = { "subs": isSubTypePresent};
    res.json(resp || {});
});
app.get("/api/testdata/getSubTypes", (req: any, res: express.Response<any, any>) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    var isSubTypePresent = apilib.getSubTypes();
    var resp = { "subs": isSubTypePresent};
    res.json(resp || {});
});
app.post('/process_post', urlencodedParser, (req, res) => {
    var requestBody = {
        subDataType: req.body.subDataType,
        testDataFileName: req.body.testDataFileName,
        dataJson: req.body.dataJson
    };
    res.setHeader('Access-Control-Allow-Origin','*');
    var response = apilib.saveTestData(requestBody);
    res.statusCode = response.code;
    res.json(response || {});
});
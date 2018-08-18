const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const responseHandler = require('./response-handler');
const validateSlackRequest = require('validate-slack-request');

const {SIGNING_SECRET, PORT} = process.env;
const port = PORT || 80;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.post(['/', '/answer'], (req, res) => {
  res.status(200).end();
  if (validateSlackRequest(SIGNING_SECRET, req)) {
    responseHandler(req.body);
  }
});

app.listen(port, () => {
  console.log(`Server started on localhost:${PORT}!`);
});

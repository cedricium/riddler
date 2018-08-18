const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const responseHandler = require('./response-handler');

const {SLACK_TOKEN: slackToken, PORT} = process.env;

// if (!slackToken || !apiKey) {
//   console.error('missing environment variables SLACK_TOKEN and/or REBRANDLY_APIKEY');
//   process.exit(1);
// }

const port = PORT || 80;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.post(['/', '/answer'], (req, res) => {
  res.status(200).end();
  responseHandler(req.body);
});

app.listen(port, () => {
  console.log(`Server started on localhost:${PORT}!`);
});

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const responseHandler = require('./response-handler');
const validateSlackRequest = require('validate-slack-request');

const {CLIENT_ID, CLIENT_SECRET, REDIRECT_URL,
  SIGNING_SECRET, PORT} = process.env;
const port = PORT || 80;

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.post(['/', '/answer'], (req, res) => {
  res.status(200).end();
  if (validateSlackRequest(SIGNING_SECRET, req)) {
    responseHandler(req.body);
  }
});

/**
 * If someone tries to go to weird Heroku root url, just redirect
 * them to the GitHub Pages hosted site.
 */
app.get('/', (req, res) => {
  res.redirect('https://cedric.tech/riddler');
});

/**
 * Resouces:
 *  + https://api.slack.com/tutorials/app-creation-and-oauth
 *  + https://tutorials.botsfloor.com/creating-a-slack-command-bot-from-scratch-with-node-js-distribute-it-25cf81f51040
 *  + https://github.com/girliemac/slack-httpstatuscats
 */
app.get('/auth', (req, res) => {
  let getOptions = {
    uri: 'https://slack.com/api/oauth.access?code='
        + req.query.code +
        `&client_id=${CLIENT_ID}` +
        `&client_secret=${CLIENT_SECRET}` +
        `&redirect_uri=${REDIRECT_URL}`,
    method: 'GET'
  };

  request(getOptions, (error, response, body) => {
    const r = JSON.parse(body);
    if (!error && r.ok) {
      res.redirect('https://slack.com/app_redirect?channel=general');
    } else {
      /**
       * For Development (uses the local `docs` directory for the site):
       * res.sendFile(path.join(__dirname, '../docs', 'index.html'));
       *
       * For Production (uses the GitHub Pages-hosted site):
       * res.redirect('https://cedric.tech/riddler');
       */
      res.redirect('https://cedric.tech/riddler');
    }
  });
});

app.listen(port, () => {
  console.log(`Server started on localhost:${PORT}!`);
});

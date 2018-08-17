const express = require('express');
const app = express();
const request = require('request');
const bodyParser = require('body-parser');
const sample = require('lodash.sample');

const RIDDLES = require('./res/riddles.json');

const {SLACK_TOKEN: slackToken, PORT} = process.env;

// if (!slackToken || !apiKey) {
//   console.error('missing environment variables SLACK_TOKEN and/or REBRANDLY_APIKEY');
//   process.exit(1);
// }

const port = PORT || 80;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

let currentRequest = {};

function createRiddleResponse(riddle) {
  return {
    "attachments": [
      {
        "text": riddle,
        "color": "#045DE9"
      },
      {
        "fallback": "Would you recommend it to customers?",
        "callback_id": "comic_1234_xyz",
        "color": "#045DE9",
        "attachment_type": "default",
        "actions": [
          {
            "name": "reveal_answer",
            "text": "Reveal Answer",
            "type": "button",
            "value": "reveal_answer"
          }
        ]
      }
    ]
  };
}

function replyToSlashCommand(responseURL, message) {
  const postOptions = {
    uri: responseURL,
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    json: message
  };

  request(postOptions, (error, response, body) => {
    if (error) {
      // handle errors as you see fit
    }
  });
}


app.post('/', (req, res) => {
  res.status(200).end();
  switch (req.body.text) {
    case 'help':
      replyToSlashCommand(req.body.response_url, {text: `I don't know how to help you...`});
      break;
    default:
      const {riddle, answer} = sample(RIDDLES);
      const riddleResponse = createRiddleResponse(riddle);
      currentRequest['riddle'] = riddle;
      currentRequest['answer'] = answer;
      replyToSlashCommand(req.body.response_url, riddleResponse);
      break;
  }
});

app.post('/answer', (req, res) => {
  res.json({
    "replace_original": true,
    "attachments": [
      {
        "text": `${currentRequest.riddle}`,
        "color": "#045DE9"
      },
      {
        "text": `*Answer:* _${currentRequest.answer}_`,
        "color": "#045DE9"
      }
    ]
  });
});

app.listen(port, () => {
  console.log(`Server started on localhost:${PORT}!`);
});

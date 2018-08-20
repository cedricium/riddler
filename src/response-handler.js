const request = require('request');
const RIDDLES = require('./res/riddles.json');
const pkg = require('../package.json');

const ATTACHMENT_COLOR = '#045DE9';
const FEEDBACK_URL = 'https://goo.gl/forms/t3qBVP5ngxt6O4GK2';

const createFeedbackResponse = () => {
  let feedbackMessage = `Visit this link to give your feedback: ${FEEDBACK_URL}\n`
  feedbackMessage += `Be honest, I won't bite :wink:`;
  return {
    "attachments": [{
      "text": feedbackMessage,
      "color": ATTACHMENT_COLOR
    }]
  };
}

const createHelpResponse = () => {
  let helpMessage = '*riddler:* _I am a bot of few words, but many riddles._\n\n';
  helpMessage += '*Usage:* `/riddler [<command>]`\n*Commands:*\n'
  helpMessage += '    help              displays this help message\n';
  helpMessage += '    version         displays the latest version of riddler\n';
  helpMessage += '    feedback      displays a link to the feedback form\n';
  return {
    "attachments": [{
      "text": helpMessage,
      "color": ATTACHMENT_COLOR
    }]
  };
}

const createVersionResponse = () => {
  const versionMessage = `*${pkg.name}*@v${pkg.version}`;
  return {
    "attachments": [{
      "text": versionMessage,
      "color": ATTACHMENT_COLOR
    }]
  }
};

const createActionResponse = (payload) => {
  const {riddle, answer} = RIDDLES[payload.callback_id];
  return {
    "replace_original": true,
    "attachments": [{
      "text": `${riddle}\n*Answer:* _${answer}_`,
      "color": ATTACHMENT_COLOR
    }]
  };
};

const createInitialResponse = () => {
  const index = Math.floor(Math.random() * RIDDLES.length);
  const {riddle} = RIDDLES[index];
  return {
    "attachments": [{
      "text": riddle,
      "color": ATTACHMENT_COLOR,
      "callback_id": index,
      "attachment_type": 'default',
      "actions": [
        {
          "name": 'reveal_answer',
          "text": 'Reveal Answer',
          "type": 'button',
          "value": 'reveal_answer'
        }
      ]
    }]
  };
};

const replyToRequest = (url, message) => {
  const postOptions = {
    uri: url,
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    json: message
  };

  request(postOptions, (error, response, body) => {
    if (error) {
      console.error(error);
    }
  });
};

const requestHandler = (body) => {
  let response = {};
  let responseUrl = body.response_url;

  if (Object.keys(body).indexOf('text') !== -1 && body.text !== '') {
    switch (body.text) {
      case 'feedback':
        response = createFeedbackResponse();
        break;
      case 'help':
        response = createHelpResponse();
        break;
      case 'version':
        response = createVersionResponse();
        break;
      default:
        // value of text is not recognized; just send a riddle
        response = createInitialResponse();
        break;
    }
  } else {
    if (body.payload) {
      const actionPayload = JSON.parse(body.payload);
      responseUrl = actionPayload.response_url;
      response = createActionResponse(actionPayload);
    } else {
      response = createInitialResponse();
    }
  }

  replyToRequest(responseUrl, response);
};

module.exports = requestHandler;

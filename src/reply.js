const isArray = require("lodash/isArray");
const random = require("lodash/random");

exports.interpretRequest = (message, listOfMatches) => {
  let matched = false;
  for (let i = 0; i < listOfMatches.length; i++) {
    const pattern = new RegExp(listOfMatches[i]);
    const matches = message.content.match(pattern);
    if (isArray(matches) && matches.length > 0) {
      matched = true;
      break;
    }
  }
  return matched;
};

// Don't mention the user
exports.respond = (message, listOfResponses) => {
  const i = random(0, listOfResponses.length - 1);
  const responseChoice = listOfResponses[i];
  return message.channel.send(responseChoice(message.author.username));
};

exports.reply = (message, reply) => {
  return message.reply(reply);
};

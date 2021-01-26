const { Client } = require("discord.js");

const { initialiseDatabase } = require("./db");
const { execute, skip, stop } = require("./music");
const {
  defaultResponses,
  howsItGoingRequests,
  hailRequests,
  howsItGoingResponses,
  gratitudeRequests,
  gratitudeResponses,
} = require("./constants");
const { respond, interpretRequest } = require("./reply");

const djBotus = new Client();

djBotus.on("ready", () => {
  console.log(`Alright pal, I'm up. My handle is ${djBotus.user.tag}.`);
  initialiseDatabase((message) => {
    console.log(message);
    console.log(`Alright, I'm all set up for my database.`);
  });
});

djBotus.once("reconnecting", () => {
  console.log("Hold on, I'm reconnecting.");
});

djBotus.once("disconnect", () => {
  console.log("See ya, I'm outta here.");
});

djBotus.on("message", async (message) => {
  if (message.author.bot) {
    // Don't talk to itself or other bots
    return false;
  }
  const isHailed = (() => {
    if (message.mentions.has(djBotus.user.id)) {
      // Respond to mentions of it
      return true;
    }

    return interpretRequest(message, hailRequests);
  })();

  const howsItGoingAsked = interpretRequest(message, howsItGoingRequests);

  if (isHailed) {
    if (message.content.match(/play /gi)) {
      execute(message);
      return;
    }
    if (message.content.match(/skip /gi)) {
      skip(message);
      return;
    }
    if (message.content.match(/stop /gi)) {
      stop(message);
      return;
    }
  }

  if (howsItGoingAsked) {
    respond(message, howsItGoingResponses);
    return;
  }

  let isBeingThanked = false;
  for (let i = 0; i < gratitudeRequests.length; i++) {
    if (
      message.content.toLowerCase().match(gratitudeRequests[i]) &&
      message.content.toLowerCase().match("botus")
    ) {
      isBeingThanked = true;
      break;
    }
  }

  if (isBeingThanked) {
    respond(message, gratitudeResponses);
    return;
  }

  if (isHailed) {
    respond(message, defaultResponses);
    return;
  }
});

djBotus.login(process.env.APP_BOT_TOKEN);

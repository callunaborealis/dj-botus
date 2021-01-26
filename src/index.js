const { Client } = require("discord.js");

const { initialiseDatabase } = require("./db");
const {
  playYoutubeURLRequests,
  execute,
  skip,
  stop,
  list,
} = require("./music");
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

  // play youtube links
  if (interpretRequest(message, playYoutubeURLRequests)) {
    return execute(message);
  }

  if (isHailed) {
    if (message.content.match(/list /gi)) {
      return list(message);
    }
    if (message.content.match(/skip /gi)) {
      return skip(message);
    }
    if (message.content.match(/stop /gi)) {
      return stop(message);
    }
  }

  if (howsItGoingAsked) {
    return respond(message, howsItGoingResponses);
  }

  if (interpretRequest(message, gratitudeRequests)) {
    return respond(message, gratitudeResponses);
  }

  if (isHailed) {
    return respond(message, defaultResponses);
  }
});

djBotus.login(process.env.APP_BOT_TOKEN);

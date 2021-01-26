const { Client } = require("discord.js");

const { initialiseDatabase } = require("./db");
const {
  playYoutubeURLRequests,
  execute,
  skip,
  stop,
  list,
  listRequests,
  skipRequests,
  stopRequests,
} = require("./music");
const {
  defaultResponses,
  gratitudeRequests,
  gratitudeResponses,
  greetingRequests,
  greetingResponses,
  howsItGoingRequests,
  hailRequests,
  hailResponses,
  howsItGoingResponses,
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

  // Music
  if (interpretRequest(message, playYoutubeURLRequests)) {
    return execute(message);
  }
  if (interpretRequest(message, listRequests)) {
    return list(message);
  }
  if (interpretRequest(message, skipRequests)) {
    return skip(message);
  }
  if (interpretRequest(message, stopRequests)) {
    return stop(message);
  }

  // Social
  const howsItGoingAsked = interpretRequest(message, howsItGoingRequests);
  if (howsItGoingAsked) {
    return respond(message, howsItGoingResponses);
  }

  if (interpretRequest(message, greetingRequests)) {
    return respond(message, greetingResponses);
  }

  if (interpretRequest(message, gratitudeRequests)) {
    return respond(message, gratitudeResponses);
  }

  const isHailed = (() => {
    if (message.mentions.has(djBotus.user.id)) {
      // Respond to mentions of it
      return true;
    }

    return interpretRequest(message, hailRequests);
  })();
  if (isHailed) {
    return respond(message, hailResponses);
  }

  if (message.content.startsWith("botus")) {
    return respond(message, defaultResponses);
  }
});

djBotus.login(process.env.APP_BOT_TOKEN);

exports.hailRequests = [
  // greeting + name
  /(hey|hi|hello) botus/gim,
  // name + greeting
  /^botus (hey|hi|hello)/gim,
  // name first
  /^botus[ ]?[,?!(...)]/gim,
];
exports.hailResponses = [];

exports.greetingRequests = [
  // basic
  "hey",
  "hello",
  "hi",
  // time of day
  "good morning",
  "good day",
  "good afternoon",
  "good evening",
  "morning",
  "afternoon",
  "evening",
  // whats up
  "whatsup",
  "what's up",
  "whats up",
];
exports.greetingResponses = [
  () => "_barely nods._",
  () => "Mm-hm.",
  (username) => `All in a day's work, ${username}.`,
  () => "_gives a small bow._",
  () => "_gives a thumb's up._",
  (username) => `_nods_ Nice to see you too, ${username}`,
  (username) => `Hello to you too, ${username}`,
];

exports.howsItGoingRequests = [
  /**
   * botus how are ya
   * botus! how are ya
   * botus? how are ya
   * botus, how are ya
   * botus how are you
   */
  /^botus[,.!?]? how are (ya|you)/gim,
  /how are (ya|you)[,?!]? botus[!?]?$/gim,
  /^botus[,.!?]? how[']?s it goin[g]?/gim,
  /^botus[,.!?]? how is it goin[g]?/gim,
  /^botus[,.!?]? wassup/gim,
  /^[was]?sup botus/gim,
];

exports.howsItGoingResponses = [
  () => "_shrugs._ It's alright, I guess.",
  (username) => `I'm good, ${username}.`,
  () => "Could be better I suppose. But alright.",
  () => "_gives a thumb's up._",
];

exports.gratitudeRequests = [
  "thanks",
  "thank you",
  "gracias",
  "merci",
  "appreciate it",
  "very nice",
];
exports.gratitudeResponses = [
  (username) =>
    `_looks at ${username} and gives a low-effort two-finger wave._`,
  () => "My pleasure.",
  () => "Mm-hm.",
  (username) => `No problem, ${username}.`,
  () => "_gives a small bow._",
  () => "_gives a thumbs up._",
  () => `_gives a brief wink and turns away._`,
];

// Bot is mentioned but doesn't know how to respond. Botus will behave like this is awkwardly.
exports.defaultResponses = [
  () => "_shrugs._",
  () => "_flips his hair and looks away, unconcerned._",
  (username) => `_stares at ${username} blankly._`,
  (username) => `_gives a half-hearted wave to ${username}._`,
  (username) => `_turns to look at ${username} and then goes back to sleep._`,
  (username) => `_looks at ${username} and raises an eyebrow._`,
  () => "Uhhh... no idea what ya want there.",
];

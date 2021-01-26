exports.hailRequests = [
  // greeting + name
  /^([h]?ello|[h]?ey|hi|ay|(was)?sup|yo|o[iy]) botus/gim,
  // name + greeting
  /^botus ([h]?ello|[h]?ey|hi|ay|(was)?sup|yo|o[iy])/gim,
  // name first
  /^botus[ ]?[,?!(...)]/gim,
];
exports.hailResponses = [
  () => "Hey.",
  (username) => `gives a reluctant wave to ${username}.`,
  (username) => `Hi, ${username}.`,
];

exports.greetingRequests = [
  // greeting + name
  /^([h]?ello|[h]?ey|hi|ay|(was)?sup|yo|o[iy]) botus$/gim,
  // name + greeting
  /^botus ([h]?ello|[h]?ey|hi|ay|(was)?sup|yo|o[iy])$/gim,
  // time of day
  /^botus (good )?(mornin[g]?|day|afternoon|evenin[g]?|night|nite)[,.!]?/gim,
  /^(good )?(mornin[g]?|day|afternoon|evenin[g]?|night|nite)[,.!]? botus/gim,
  // whats up
  /^botus what[']?s[ ]?up/gim,
  /^what[']?s[ ]?up botus/gim,
  /^botus wa[s]{1,100}up/gim,
  /^wa[s]{1,100}up botus/gim,
  /^botus wh[au]t[ ]?up/gim,
  /^wh[au]t[ ]?up botus/gim,
];
exports.greetingResponses = [
  () => "_barely nods._",
  () => "Mm-hm.",
  (username) => `Yep, hello to you too, ${username}.`,
  () => "_gives a lazy salute._",
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
  () => "_gives a thumbs up._",
];

exports.gratitudeRequests = [
  /^botus[,.!]? thank you/gim,
  /^botus[,.!]? thanks/gim,
  /^thank you[,.!]? botus/gim,
  /^thanks[,.!]? botus/gim,
  /^thanks for [^.,!?-]+,? botus/i,
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

// Bot is mentioned but doesn't know how to respond. Botus will behave awkwardly.
exports.defaultResponses = [
  () => "_shrugs._",
  () => "_flips his hair and looks away, unconcerned._",
  (username) => `_stares at ${username} blankly._`,
  (username) => `_gives a half-hearted wave to ${username}._`,
  (username) => `_turns to look at ${username} and then goes back to sleep._`,
  (username) => `_looks at ${username} and raises an eyebrow._`,
  () => `_looks behind him and raises his hands in exasperation._`,
  () => "Uhhh... no idea what ya want there.",
  (username) => `_lights a cigarette, ignoring what ${username} have said._`,
  (username) =>
    `gives a polite laugh then immediately walks away, completely forgetting what ${username} has said.`,
];

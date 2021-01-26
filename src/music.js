const isArray = require("lodash/isArray");
const isFinite = require("lodash/isFinite");
const isString = require("lodash/isString");
const { v4: uuidv4 } = require("uuid");
const ytdl = require("ytdl-core");

const interserverQueue = new Map();

exports.play = (guild, song) => {
  const serverQueue = interserverQueue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    interserverQueue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
      serverQueue.songs.shift();
      exports.play(guild, serverQueue.songs[0]);
    })
    .on("error", (error) => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.songs[0].volume / 5);
  serverQueue.textChannel.send(
    `_loads the next record labelled_ **${song.title}** and turns the volume.`
  );
};

/**
 * Ultimate YouTube link detector. See <https://regexr.com/3akf5>
 */
const youtubeLinkPattern = new RegExp(
  /(?:https?:\/\/)?(?:(?:(?:www\.?)?youtube\.com(?:\/(?:(?:watch\?\S*?(v=[^&\s]+)\S*)|(?:v(\/\S*))|(channel\/\S+)|(?:user\/(\S+))|(?:results\?(search_query=\S+))))?)|(?:youtu\.be(\/\S*)?))/gim
);

const volumeBeingSetPattern = new RegExp(/vol(ume|\.)?( as|at|to)? (\d)+/i);

exports.playYoutubeURLRequests = [
  // hey / hi / sup / hello / yo / oi / oy (optional) botus play [youtube link] (natural language processing)
  /^([h]?ello |[h]?ey |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] )?botus[,?!]? play (?:https?:\/\/)?(?:(?:(?:www\.?)?youtube\.com(?:\/(?:(?:watch\?\S*?(v=[^&\s]+)\S*)|(?:v(\/\S*))|(channel\/\S+)|(?:user\/(\S+))|(?:results\?(search_query=\S+))))?)|(?:youtu\.be(\/\S*)?))/gim,
  // --p [youtube link] (shortcut)
  /^--p (?:https?:\/\/)?(?:(?:(?:www\.?)?youtube\.com(?:\/(?:(?:watch\?\S*?(v=[^&\s]+)\S*)|(?:v(\/\S*))|(channel\/\S+)|(?:user\/(\S+))|(?:results\?(search_query=\S+))))?)|(?:youtu\.be(\/\S*)?))/gim,
];

exports.execute = async (message) => {
  const serverQueue = interserverQueue.get(message.guild.id);

  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) {
    return message.channel.send(
      "I'm not gonna play for no one. Someone get into a voice channel first."
    );
  }
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return message.channel.send(
      "Give me permissions for connecting and speaking in the voice channel, then we can party."
    );
  }

  const youtubeLinks = message.content.match(youtubeLinkPattern);
  if (!isArray(youtubeLinks)) {
    return message.channel.send("...I can't play _that_.");
  }

  const songInfo = await ytdl.getInfo(youtubeLinks[0]);

  const volume = (() => {
    const defaultVolume = 5;
    const volumeMatches = message.content.match(volumeBeingSetPattern);
    if (isArray(volumeMatches)) {
      const volumeOrder = volumeMatches[0];
      if (isString(volumeOrder)) {
        return volumeOrder.split(" ").reduce((prevOrDefault, v) => {
          const candidate = parseInt(v, 10);
          if (isFinite(candidate)) {
            return candidate;
          }
          return prevOrDefault;
        }, defaultVolume);
      }
    }
    return defaultVolume;
  })();

  const song = {
    id: uuidv4(),
    title: songInfo.videoDetails.title,
    url: songInfo.videoDetails.video_url,
    volume,
  };

  if (!serverQueue) {
    const queueShape = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume,
      playing: song.id,
    };

    interserverQueue.set(message.guild.id, queueShape);

    queueShape.songs.push(song);

    try {
      const connection = await voiceChannel.join();
      queueShape.connection = connection;
      exports.play(message.guild, queueShape.songs[0]);
    } catch (err) {
      console.log(err);
      interserverQueue.delete(message.guild.id);
      return message.channel.send(err);
    }
  } else {
    serverQueue.songs.push(song);
    return message.channel.send(
      `_nods and adds_ **${song.title}** _to the list._`
    );
  }
};

/**
 * Shows the playlist
 */
exports.list = (message) => {
  const serverQueue = interserverQueue.get(message.guild.id);
  if (!serverQueue) {
    return message.channels.send("Nothing's playing at the moment");
  }
};

exports.skip = (message) => {
  const serverQueue = interserverQueue.get(message.guild.id);
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
  if (!serverQueue) {
    return message.channel.send("There is no song that I could skip!");
  }
  serverQueue.connection.dispatcher.end();
};

exports.stop = (message) => {
  const serverQueue = interserverQueue.get(message.guild.id);
  if (!message.member.voice.channel) {
    return message.channel.send(
      "I can't stop the music if there isn't a voice channel."
    );
  }
  if (!serverQueue) {
    return message.channel.send("_looks at the empty playlist queue blankly._");
  }

  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
};

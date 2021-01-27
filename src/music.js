const isArray = require("lodash/isArray");
const isFinite = require("lodash/isFinite");
const isString = require("lodash/isString");
const { v4: uuidv4 } = require("uuid");
const ytdl = require("ytdl-core");

const interserverQueue = new Map();

const maxAllowableVolume = 10; // Any more and we might all be deaf

exports.play = (guild, song) => {
  const serverQueue = interserverQueue.get(guild.id);
  serverQueue.currentSong = serverQueue.songs[0];
  if (!song) {
    serverQueue.textChannel.send(
      "_packs up the DJ kit and lights a cigarette_ Alright, I gonna take five."
    );
    serverQueue.voiceChannel.leave();
    interserverQueue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
      const prevSong = serverQueue.songs.shift();
      serverQueue.previousSong = prevSong;
      exports.play(guild, serverQueue.songs[0]);
    })
    .on("error", (error) => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.songs[0].volume / 5);
  serverQueue.textChannel.send(
    `_loads the next record labelled_ **${song.title}** _and turns the volume to_ **${serverQueue.songs[0].volume}**.`
  );
};

/**
 * Ultimate YouTube link detector. See <https://regexr.com/3akf5>
 */
const youtubeLinkPattern = new RegExp(
  /(?:https?:\/\/)?(?:(?:(?:www\.?)?youtube\.com(?:\/(?:(?:watch\?\S*?(v=[^&\s]+)\S*)|(?:v(\/\S*))|(channel\/\S+)|(?:user\/(\S+))|(?:results\?(search_query=\S+))))?)|(?:youtu\.be(\/\S*)?))/gim
);

const volumeBeingSetPattern = new RegExp(/vol(ume)?( as| at| to)? (\d)+/i);

exports.playYoutubeURLRequests = [
  // hey / hi / sup / hello / yo / oi / oy (optional) botus play [youtube link] (natural language processing)
  /^([h]?ello |[h]?ey |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] )?botus[,?!]? play (?:https?:\/\/)?(?:(?:(?:www\.?)?youtube\.com(?:\/(?:(?:watch\?\S*?(v=[^&\s]+)\S*)|(?:v(\/\S*))|(channel\/\S+)|(?:user\/(\S+))|(?:results\?(search_query=\S+))))?)|(?:youtu\.be(\/\S*)?))/gim,
  // --p [youtube link] (shortcut)
  /^--(p|play) (?:https?:\/\/)?(?:(?:(?:www\.?)?youtube\.com(?:\/(?:(?:watch\?\S*?(v=[^&\s]+)\S*)|(?:v(\/\S*))|(channel\/\S+)|(?:user\/(\S+))|(?:results\?(search_query=\S+))))?)|(?:youtu\.be(\/\S*)?))/gim,
];

exports.listRequests = [
  /^([h]?ello |[h]?ey |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] )?botus[,?!]? list/gim,
  // Shortcut
  /^--(q|queue|playlist|list|ls)/gim,
];

exports.skipRequests = [
  /^([h]?ello |[h]?ey |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] )?botus[,?!]? skip/gim,
  // Shortcut
  /^--(next|skip)/gim,
];

exports.stopRequests = [
  /^([h]?ello |[h]?ey |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] )?botus[,?!]? (stop|go away|no more music|halt|enough music|you can go|that'?s enough)/gim,
  // Shortcut
  /^--stop/gim,
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

  let maxAllowableReached = false;
  const volume = (() => {
    const defaultVolume = 5;
    const volumeMatches = message.content.match(volumeBeingSetPattern);
    if (isArray(volumeMatches)) {
      const volumeOrder = volumeMatches[0];
      if (isString(volumeOrder)) {
        return volumeOrder.split(" ").reduce((prevOrDefault, v) => {
          const candidate = parseInt(v, 10);
          if (isFinite(candidate) && candidate <= maxAllowableVolume) {
            return candidate;
          }
          if (isFinite(candidate) && candidate > maxAllowableVolume) {
            maxAllowableReached = true;
            return maxAllowableVolume;
          }
          return prevOrDefault;
        }, defaultVolume);
      }
    }
    return defaultVolume;
  })();

  if (maxAllowableReached) {
    message.channel.send(
      `._shakes his head_ I won't play songs louder than a level of **${maxAllowableReached}**.`
    );
  }

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
      currentSong: song,
      previousSong: null,
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
      `_nods and adds_ **${song.title}** with volume at ${song.volume}_to the list._`
    );
  }
};

/**
 * Shows the playlist
 */
exports.list = (message) => {
  const serverQueue = interserverQueue.get(message.guild.id);
  if (!serverQueue || !serverQueue.currentSong) {
    return message.channel.send("Nothing's playing at the moment");
  }
  const currentSongId = serverQueue.currentSong.id;
  const listOfSongsInAMessage = serverQueue.songs.reduce(
    (eventualSongList, currentSongDetails, index) => {
      const nowPlayingSuffix = (() => {
        if (currentSongDetails.id === currentSongId) {
          return " -- **Now Playing**";
        }
        return "";
      })();
      return `${eventualSongList}\n${index + 1}: ${
        currentSongDetails.title
      }${nowPlayingSuffix}\n<${currentSongDetails.url}>\nVolume: ${
        currentSongDetails.volume
      }\n`;
    },
    "Current playlist (default):\n"
  );
  return message.channel.send(listOfSongsInAMessage);
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

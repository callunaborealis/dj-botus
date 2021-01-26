const ytdl = require("ytdl-core");

const queue = new Map();

exports.execute = async (message) => {
  const serverQueue = queue.get(message.guild.id);
  

  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) {
    return message.channel.send(
      "I can't play any music if there isn't a voice channel."
    );
  }
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return message.channel.send(
      "Give me permissions for connecting and speaking in the voice channel, then we can have a party."
    );
  }

  const args = message.content.split(" play ");
  const songInfo = await ytdl.getInfo(args[1]);
  const song = {
    title: songInfo.videoDetails.title,
    url: songInfo.videoDetails.video_url,
  };

  if (!serverQueue) {
    const queueShape = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true,
    };

    queue.set(message.guild.id, queueShape);

    queueShape.songs.push(song);

    try {
      const connection = await voiceChannel.join();
      queueShape.connection = connection;
      exports.play(message.guild, queueShape.songs[0]);
    } catch (err) {
      console.log(err);
      queue.delete(message.guild.id);
      return message.channel.send(err);
    }
  } else {
    serverQueue.songs.push(song);
    return message.channel.send(`_nods and adds_ **${song.title}** _to the list._`);
  }
};

exports.skip = (message) => {
  const serverQueue = queue.get(message.guild.id);
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
  if (!serverQueue)
    return message.channel.send("There is no song that I could skip!");
  serverQueue.connection.dispatcher.end();
};

exports.stop = (message) => {
  const serverQueue = queue.get(message.guild.id);
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

exports.play = (guild, song) => {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
      serverQueue.songs.shift();
      exports.play(guild, serverQueue.songs[0]);
    })
    .on("error", (error) => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(
    `_gives a thumbs up, puts on his sunglasses and loads the next record labelled_ **${song.title}**.`
  );
};

const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('@distube/ytdl-core');
const ytpl = require('ytpl');
const fs = require('fs');
const path = require('path');

// Define the maximum number of retries for streaming
const MAX_RETRIES = 3;
const QUEUE_FILE_PATH = path.join(__dirname, 'queueData.json'); // Path to save the queue data

// Create an audio player for music playback
const serverData = new Map();

// Load the queue data from the saved file
function loadQueueData() {
    try {
        if (fs.existsSync(QUEUE_FILE_PATH)) {
            const rawData = fs.readFileSync(QUEUE_FILE_PATH, 'utf8');
            const queueData = JSON.parse(rawData);

            queueData.forEach((guildData) => {
                const serverQueue = {
                    queue: guildData.queue || [],
                    history: guildData.history || [],
                    isPlaying: false,
                    connection: null,
                    audioPlayer: createAudioPlayer(),
                    lastSong: guildData.lastSong || null
                };

                serverData.set(guildData.guildId, serverQueue);

                // Recreate the audio player events after loading the queue
                serverQueue.audioPlayer.on(AudioPlayerStatus.Idle, () => {
                    if (serverQueue.queue.length > 0) {
                        playNextSong(guildData.guildId, null, null);
                    } else {
                        serverQueue.isPlaying = false;
                    }
                });

                serverQueue.audioPlayer.on('error', (error) => {
                    console.error('Audio Player Error:', error);
                });
            });

            console.log('Queue data loaded successfully');
        }
    } catch (error) {
        console.error('Error loading queue data:', error);
    }
}

// Call loadQueueData when the bot starts or restarts
loadQueueData();

module.exports = async (message) => {
    if (message.author.bot || !message.guild) return;

    let serverQueue = serverData.get(message.guild.id);
    const voiceChannel = message.member.voice.channel;

    try {
        if (message.content.startsWith('!play')) {
            await handlePlayCommand(message, serverQueue, voiceChannel);
        } else if (message.content.startsWith('!replaylastsong')) {
            handlePlayLastSongCommand(message, serverQueue);
        } else if (message.content.startsWith('!back')) {
            if (serverQueue && serverQueue.history.length > 0) {
                handleBackCommand(message, serverQueue);
            } else {
                message.channel.send('There is no music currently playing in this server.');
            }
        } else if (message.content.startsWith('!pause')) {
            if (serverQueue) {
                handlePauseCommand(message, serverQueue);
            } else {
                message.channel.send('There is no music currently playing in this server.');
            }
        } else if (message.content.startsWith('!resume')) {
            if (serverQueue) {
                handleResumeCommand(message, serverQueue);
            } else {
                message.channel.send('There is no music currently paused in this server.');
            }
        } else if (message.content.startsWith('!stop')) {
            if (serverQueue) {
                handleStopCommand(message, serverQueue);
            } else {
                message.channel.send('There is no music currently playing in this server.');
            }
        } else if (message.content.startsWith('!skip')) {
            if (serverQueue) {
                handleSkipCommand(message, serverQueue);
            } else {
                message.channel.send('There are no songs in the queue to skip!');
            }
        }
    } catch (error) {
        console.error('Error handling message:', error);
        message.channel.send('An error occurred while processing your request.');
    }
};

// Function to replay the last song
function handlePlayLastSongCommand(message, serverQueue) {
    if (!serverQueue || !serverQueue.lastSong) {
        message.channel.send('There is no previously played song to play.');
        return;
    }

    const lastSong = serverQueue.lastSong;
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel) {
        return message.channel.send('You need to be in a voice channel to play music!');
    }

    try {
        const stream = ytdl(lastSong.url, { filter: 'audioonly', begin: `${lastSong.seekTime}s` });
        const resource = createAudioResource(stream, { inlineVolume: true });

        if (!serverQueue.connection) {
            serverQueue.connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: message.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });
            serverQueue.connection.subscribe(serverQueue.audioPlayer);
        }

        serverQueue.audioPlayer.play(resource);
        serverQueue.isPlaying = true;
        message.channel.send(`Replaying the last song: ${lastSong.url}`);
    } catch (error) {
        console.error('Error in handlePlayLastSongCommand:', error);
        message.channel.send('An error occurred while trying to play the last song.');
    }
}

async function handlePlayCommand(message, serverQueue, voiceChannel) {
    const args = message.content.split(' ');
    const url = args[1];
    const seekTime = args[2] ? parseTime(args[2]) : 0;

    if (!url || (!ytdl.validateURL(url) && !ytpl.validateID(url))) {
        return message.channel.send('Please provide a valid YouTube URL or playlist.');
    }

    if (!voiceChannel) {
        return message.channel.send('You need to be in a voice channel to play music!');
    }

    try {
        // Create a new queue if it doesn't exist
        if (!serverQueue) {
            serverQueue = {
                queue: [],
                history: [],
                isPlaying: false,
                connection: null,
                audioPlayer: createAudioPlayer()
            };
            serverData.set(message.guild.id, serverQueue);

            serverQueue.audioPlayer.on(AudioPlayerStatus.Idle, () => {
                if (serverQueue.queue.length > 0) {
                    playNextSong(message.guild.id, voiceChannel, message);
                } else {
                    serverQueue.isPlaying = false;
                    message.channel.send('There are no more songs playing. You can add more songs using the `!play` command.');
                }
            });

            serverQueue.audioPlayer.on('error', (error) => {
                console.error('Audio Player Error:', error);
                message.channel.send('An error occurred while trying to play the audio.');
            });
        }

        // Add song to queue
        serverQueue.queue.push({ url, seekTime });

        // Handle playlist or single URL
        if (ytpl.validateID(url)) {
            const playlistVideos = await fetchPlaylistVideos(url);
            serverQueue.queue.push(...playlistVideos.map(video => ({ url: video, seekTime })));
            message.channel.send(`Added ${playlistVideos.length} songs from the playlist to the queue.`);
        } else {
            serverQueue.queue.push({ url, seekTime });
            message.channel.send(`Added to queue: ${url}`);
        }

        // Save the queue data after adding a song
        saveQueueData();

        // If no song is playing, start playing
        if (!serverQueue.isPlaying) {
            playNextSong(message.guild.id, voiceChannel, message);
        }
    } catch (error) {
        console.error('Error in handlePlayCommand:', error);
        message.channel.send('An unexpected error occurred while trying to play the music.');
    }
}

function handleBackCommand(message, serverQueue) {
    if (!serverQueue) {
        return message.channel.send('There is no music currently playing in this server.');
    }

    // Ensure there are at least two songs in history to go back
    if (serverQueue.history.length > 1) {
        const currentSong = serverQueue.history.pop(); // Remove the current song from history
        const previousSong = serverQueue.history.pop(); // Get the previous song

        // Re-add the current song back to the queue to allow going forward again
        serverQueue.queue.unshift(currentSong);

        // Add the previous song back to the front of the queue and play it
        serverQueue.queue.unshift(previousSong);

        // Stop the current song, triggering the playback of the previous one
        serverQueue.audioPlayer.stop();

        message.channel.send(`Going back to the previous song: ${previousSong.title}`);

        // Start playing the previous song
        playNextSong(message.guild.id, message.member.voice.channel, message);

        // Save the queue after the change
        saveQueueData();
    } else {
        message.channel.send('No previous song to go back to.');
    }
}

function handlePauseCommand(message, serverQueue) {
    if (serverQueue && serverQueue.audioPlayer.state.status === 'playing') {
        serverQueue.audioPlayer.pause();
        message.channel.send('Paused the music!');
    } else {
        message.channel.send('No music is currently playing.');
    }
}

function handleResumeCommand(message, serverQueue) {
    if (serverQueue && serverQueue.audioPlayer.state.status === 'paused') {
        serverQueue.audioPlayer.unpause();
        message.channel.send('Resumed the music!');
    } else {
        message.channel.send('The music is not paused.');
    }
}

function handleStopCommand(message, serverQueue) {
    if (serverQueue) {
        serverQueue.queue = [];
        serverQueue.history = [];
        serverQueue.audioPlayer.stop();
        message.channel.send('Stopped the music and cleared the queue!');
        serverQueue.isPlaying = false;
        // Do not disconnect from the voice channel

        // Save the queue after stopping
        saveQueueData();
    }
}

function handleSkipCommand(message, serverQueue) {
    if (serverQueue && serverQueue.queue.length > 0) {
        // Start playing the previous song
        playNextSong(message.guild.id, message.member.voice.channel, message);
        message.channel.send('Skipped the current song!');
        // Save the queue after skipping
        saveQueueData();
    } else {
        message.channel.send('The song queue is empty. You cannot skip because there are no songs in the queue!');
    }
}

async function playNextSong(guildId, voiceChannel, message) {
    const serverQueue = serverData.get(guildId); // Retrieve the server's queue
    if (!serverQueue) {
        console.log('No server queue found');
        if (message) {
            message.channel.send('There is no song to play.');
        }
        return;
    }

    const nextSong = serverQueue.queue.shift(); // Get the next song from the queue
    if (!nextSong) {
        console.log('No more songs in the queue');
        if (message) {
            message.channel.send('No more songs in the queue. Use `!play` to add more.');
        }
        serverQueue.isPlaying = false;
        return;
    }

    console.log(`Playing next song: ${nextSong.url}`);

    // Update the queue history and prepare for playback
    serverQueue.history.push(serverQueue.lastSong);
    serverQueue.lastSong = nextSong;

    try {
        // In playNextSong, after a song finishes playing:
        if (serverQueue.history.length === 0 || serverQueue.history[serverQueue.history.length - 1].url !== nextSong.url) {
            serverQueue.history.push(nextSong);
        }

        // Get the stream for the song (YouTube or other source)
        const stream = ytdl(nextSong.url, { filter: 'audioonly', begin: `${nextSong.seekTime || 0}s` });
        const resource = createAudioResource(stream, { inlineVolume: true });

        // If the bot isn't in a voice channel, join the channel
        if (!serverQueue.connection) {
            serverQueue.connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: message.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });
            serverQueue.connection.subscribe(serverQueue.audioPlayer);
        }

        // Play the new song
        serverQueue.audioPlayer.play(resource);
        serverQueue.isPlaying = true;

        if (message) {
            message.channel.send(`Now playing: ${nextSong.url}`);
        }
    } catch (error) {
        console.error('Error in playNextSong:', error);
        if (message) {
            message.channel.send('An error occurred while trying to play the next song.');
        }
    }
}

// Function to fetch all video URLs from a YouTube playlist using ytpl
async function fetchPlaylistVideos(playlistUrl) {
    const playlist = await ytpl(playlistUrl, { limit: Infinity });
    return playlist.items.map(item => item.url);
}

// Helper function to parse time from a string (e.g., "1:30" -> 90 seconds)
function parseTime(timeStr) {
    const parts = timeStr.split(':');
    let seconds = 0;
    for (let i = 0; i < parts.length; i++) {
        seconds += parseInt(parts[parts.length - 1 - i], 10) * Math.pow(60, i);
    }
    return seconds;
}

// Save the queue data to a file
function saveQueueData() {
    const data = [];
    serverData.forEach((serverQueue, guildId) => {
        data.push({
            guildId,
            queue: serverQueue.queue,
            history: serverQueue.history,
            lastSong: serverQueue.lastSong, // Save last song
            playbackState: {
                currentSong: serverQueue.currentSong,
                seekTime: serverQueue.seekTime || 0
            }
        });
    });

    try {
        fs.writeFileSync(QUEUE_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
        console.log('Saved queue data with playback state.');
    } catch (error) {
        console.error('Error saving queue data:', error);
    }
}

const { Client, GatewayIntentBits, Events, ActivityType, ShardClientUtil, ShardingManager } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection, VoiceConnectionStatus, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const prism = require('prism-media');
const fs = require('fs');
const wav = require('wav');
const { spawn } = require('child_process');
const gTTS = require('gtts');
const path = require('path'); // Import path module
require('dotenv').config();
const HelpCommands = require('./commands/HelpCommands');
const Music = require('./commands/MusicCommands')
const Plaque_builder = require('./commands/plaqueBuilder')
const QUEUE_FILE_PATH = path.join(__dirname, './commands/queueData.json'); // Path to save the queue data
const { v4: uuidv4 } = require('uuid');

// Declare serverData as a Map at the top
const serverData = new Map();

// Define allowed text channel IDs
const configPath = path.join(__dirname, 'commands/NoVoiceChannels.json');
const dontAccess = path.join(__dirname, 'commands/DoNotAccess.json');
const dontAccessChannels = path.join(__dirname, 'noTalkChannels.json');
let updateChannels = {}; // Object to store update channels for each server
let DoNotAccessChannels = {}; // Object to store update channels for each server
let musicQueue = []; // Object to store update channels for each server
let DoNotTalk = {};

// Load the config file
const loaddontAccessChannels = () => {
    if (fs.existsSync(dontAccessChannels)) {
        const data = fs.readFileSync(dontAccessChannels);
        const config = JSON.parse(data);
        DoNotTalk = config.DoNotTalk || {}; // Load ignored channels from the file
    }
};

// Load the config file
const loadConfig = () => {
    if (fs.existsSync(configPath)) {
        const data = fs.readFileSync(configPath);
        const config = JSON.parse(data);
        updateChannels = config.updateChannels || {}; // Load update channels from the file
    }
};

function loadQueueData() {
    if (fs.existsSync(QUEUE_FILE_PATH)) {
        const data = JSON.parse(fs.readFileSync(QUEUE_FILE_PATH, 'utf8'));

        data.forEach((server) => {
            const { guildId, queue, history, lastSong } = server;

            const clonedQueue = JSON.parse(JSON.stringify(queue)); // Deep clone the queue to avoid reference issues

            const serverQueue = {
                queue: clonedQueue || [],
                history: history || [],
                lastSong: lastSong || null,
                isPlaying: false,
                connection: null,
                audioPlayer: createAudioPlayer()
            };

            serverData.set(guildId, serverQueue); // Save the cloned queue
        });
    }
}

// Load the config file
const loaddontAccess = () => {
    if (fs.existsSync(dontAccess)) {
        const data = fs.readFileSync(dontAccess);
        const config = JSON.parse(data);
        DoNotAccessChannels = config.DoNotAccessChannels || {}; // Load ignored channels from the file
    }
};

// Bot Token and Client Initialization
const token = process.env.MONIKA_TOKEN; // Replace with your bot token
const discordClient = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

module.exports = { discordClient };

let isProcessing = true;  // Flag to avoid multiple recordings
let currentUserId = null;  // Track the current user being processed

discordClient.on('messageCreate', async (message) => {
    loaddontAccessChannels();
    const DoNotAccessChannelIds = DoNotTalk[message.guild.id] || [];

    if (DoNotAccessChannelIds.includes(message.channelId)) {
        console.log("Blocked message in restricted channel.");
        message.delete();
        return;
    }

    // Execute help and music commands in one handler
    HelpCommands(message, discordClient);
    Music(message);
    Plaque_builder(message);
    processTTSMessage(message);
});

function loopWithWhile() {

    // Call the Python script
    const pythonProcess = spawn('python', ['monika/monikaStart.py']);

    // Capture the output from the Python script
    pythonProcess.stdout.on('data', (data) => {
        console.log(`Output: ${data}`);
    });

    // Capture any errors
    pythonProcess.stderr.on('data', (data) => {
        console.error(`Error: ${data}`);
    });

    // When the process finishes
    pythonProcess.on('close', (code) => {
        console.log(`Python script exited with code ${code}`);
    });
}

// Handle Bot Ready Event
discordClient.once(Events.ClientReady, () => {
    console.log(`Logged in as ${discordClient.user.tag}`);
    // Set custom status
    discordClient.user.setPresence({
        activities: [
            { name: 'Bot is getting updated...', type: ActivityType.Custom } // Use 'CUSTOM' type to avoid 'playing'
        ],
        status: 'idle', // You can set 'online', 'idle', 'dnd', or 'invisible'
    });
    loopWithWhile();
    loadConfig();
});

const leaveVoiceChannel = (guildId) => {
    const connection = getVoiceConnection(guildId);
    if (connection) connection.destroy();
};

discordClient.on(Events.VoiceStateUpdate, (oldState, newState) => {
    loaddontAccess();
    const newChannel = newState.channel;
    const oldChannel = oldState.channel;
    const user = newState.member.user.username;
    const DoNotAccessChannelIds = DoNotAccessChannels[newState.guild.id] || [];

    // Ignore updates from the bot itself
    if (newState.member.user.id === discordClient.user.id) return;

    // For all other commands, check if the message is in the designated update channel
    if (DoNotAccessChannelIds.includes(newState.channelId)) return;

    // Check if the bot is already in a voice channel
    const currentConnection = getVoiceConnection(newState.guild.id);

    if (newChannel && !oldChannel) {
        // User joined a voice channel
        if (!currentConnection) {
            const connection = joinVoiceChannel({
                channelId: newChannel.id,
                guildId: newChannel.guild.id,
                adapterCreator: newChannel.guild.voiceAdapterCreator,
                selfDeaf: false,
                selfMute: false,
            });

            const currentTime = new Date();
            const formattedTime = currentTime.toLocaleTimeString();

            connection.on(VoiceConnectionStatus.Ready, () => {
                console.log(`The bot has connected to the ${newChannel.name} with ${user}! Current time: ${formattedTime}`);
                listenAndRecord(connection);
            });

            connection.on(VoiceConnectionStatus.Disconnected, () => {
                console.log(`The bot has disconnected from the ${newChannel.name} with ${user}! Current time: ${formattedTime}`);
                connection.destroy();
            });
        } else {
            console.log(`The bot is already connected to a voice channel in this guild.`);
        }
    } else if (oldChannel && !newChannel) {
        const currentTime = new Date();
        const formattedTime = currentTime.toLocaleTimeString();

        // User left the voice channel, check if the channel is empty
        if (oldState.channel && oldState.channel.members.size === 1) {
            leaveVoiceChannel(oldState.guild.id);
        }
    }
});

discordClient.on('messageCreate', (message) => {
    if (message.author.bot) return; // Ignore bot messages

    // Check if the message content is not blank
    const content = message.content.trim();
    if (content.length === 0) return; // Ignore blank messages

    // Append the message content to a file
    fs.appendFile('messages.txt', `${content}\n`, (err) => {
        if (err) {
            console.error('Error writing to file:', err);
        }
    });
});

function processTTSMessage(message) {
    loadQueueData();

    if (!message.guild) {
        console.error("Received a message outside of a guild, ignoring...");
        return;
    }

    const updateChannelId = updateChannels[message.guild.id];

    if (message.author.id === discordClient.user.id || !updateChannelId || message.channel.id !== updateChannelId) return;

    // Initialize server data if it doesn't exist for the guild
    if (!serverData.has(message.guild.id)) {
        serverData.set(message.guild.id, {
            queue: [],
            history: [],
            isPlaying: false,
            connection: null,
            audioPlayer: createAudioPlayer(),
        });
    }

    const serverQueue = serverData.get(message.guild.id);
    if (!serverQueue) {
        console.error(`No serverQueue found for guild: ${message.guild.id}`);
        return;
    }

    if (serverQueue.queue.length > 0) {
        return;
    }

    if (!message.content.trim()) return;

    const voiceChannel = message.member?.voice.channel;
    if (!voiceChannel) {
        message.reply("Please join a voice channel so I can repeat your message.");
        return;
    }

    const gtts = new gTTS(message.content, 'en');
    // Generate a unique filename for TTS
    const AUDIO_PATH = path.join(__dirname, `tts_resource.mp3`);             

    gtts.save(AUDIO_PATH, async err => {
        if (err) {
            console.error("Error generating TTS:", err);
            return;
        }

        let currentConnection = getVoiceConnection(message.guild.id);
        if (!currentConnection) {
            currentConnection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
            });

            currentConnection.on(VoiceConnectionStatus.Ready, () => {
                console.log(`Connected to ${voiceChannel.name}`);
            });

            currentConnection.on(VoiceConnectionStatus.Disconnected, () => {
                console.log(`Disconnected from ${voiceChannel.name}`);
            });
        }

        const ttsPlayer = createAudioPlayer();
        const resource = createAudioResource(AUDIO_PATH);

        ttsPlayer.play(resource);
        currentConnection.subscribe(ttsPlayer);

        setInterval(() => {
            const files = fs.readdirSync('./'); // List files in the current directory
    
            files.filter(file => file.startsWith('tts_') || file == "tts_resource.mp3").forEach(file => {
    
                fs.unlink(resource, (err) => {
                    if (err) {
                        console.error(`Failed to delete ${resource}:`, err);
                    } else {
                        console.log(`${resource} deleted.`);
                    }
                });
            });
        }, 600); // Runs every 60 seconds

        ttsPlayer.on('error', error => {
            console.error('Error playing TTS audio:', error);
            message.channel.send('An error occurred while trying to play the audio.');
        });
    });
}

const userProcessingMap = new Map();

// Function to listen and record
function listenAndRecord(connection) {
    const receiver = connection.receiver;

    receiver.speaking.on('start', userId => {
        if (userProcessingMap.get(userId)) return;

        userProcessingMap.set(userId, true);

        console.log(`Listening...`);
        isProcessing = true;  // Set the processing flag
        currentUserId = userId;  // Set the current user being processed

        const audioStream = receiver.subscribe(userId, {
            end: {
                behavior: 'manual'
            }
        });

        const pcmStream = new prism.opus.Decoder({ frameSize: 960, channels: 10, rate: 48000 });
        const outputFile = `Voice.wav`;
        const wavStream = new wav.FileWriter(outputFile, {
            sampleRate: 48000,
            channels: 10,
            bitDepth: 16
        });

        let speakingTimeout;

        // Accumulate PCM data and write it to the WAV file
        pcmStream.on('data', (chunk) => {
            wavStream.write(chunk);
        });

        pcmStream.on('end', () => {
            console.log(`PCM stream ended`);
            wavStream.end();
            console.log(`WAV file saved as ${outputFile}`);

            // Convert WAV to text
            console.log('Calling Python script...');
            const pythonProcess = spawn('python', ['monika.py', outputFile]);

            pythonProcess.stdout.on('data', (data) => {
                console.log(`Python stdout: ${data}`);
            });

            pythonProcess.stderr.on('data', (data) => {
                console.error(`Python stderr: ${data}`);
            });

            pythonProcess.on('close', (code) => {
                console.log(`Python process exited with code ${code}`);
                playResponse(connection); // Play the response after the Python script completes
            });
        });

        pcmStream.on('error', (err) => {
            console.error(`Error in PCM stream: ${err.message}`);
            resetProcessingState();
        });

        // End the PCM stream when the user stops speaking
        receiver.speaking.on('end', endUserId => {
            if (endUserId === userId) {
                clearTimeout(speakingTimeout); // Clear any existing timeout
                pcmStream.end(); // End the PCM stream
            }
        });

        // Optionally, set a timeout to force end the PCM stream after a period of inactivity
        speakingTimeout = setTimeout(() => {
            console.log(`No activity from user with ID: ${userId} for timeout period.`);
            pcmStream.end(); // Force end PCM stream after timeout
        }, 10000); // 10 seconds or adjust as needed

        audioStream.pipe(pcmStream);
    });
}

// Function to play the response
function playResponse(connection) {
    const player = createAudioPlayer();
    const resource = createAudioResource('response.wav');

    player.play(resource);
    connection.subscribe(player);

    player.on(AudioPlayerStatus.Playing, () => {
        console.log('The audio player has started playing!');
    });

    player.on(AudioPlayerStatus.Idle, () => {
        console.log('The audio player is now idle!');
        cleanupFiles(player); // Pass the player to the cleanup function
    });

    player.on('error', error => {
        console.error(`Error: ${error.message}`);
        cleanupFiles(player); // Pass the player to the cleanup function
    });
}

// Function to clean up files and reset state
function cleanupFiles(player) {
    // Stop the audio player to release the file
    if (player.state.status !== AudioPlayerStatus.Idle) {
        player.stop();
    }

    // Check if response.wav exists before trying to delete it
    if (fs.existsSync('response.wav')) {
        fs.unlink('response.wav', (err) => {
            if (err) {
                console.error(`Error deleting response.wav: ${err}`);
            } else {
                console.log('response.wav has been deleted.');
            }
        });
    } else {
        console.log('response.wav does not exist.');
    }

    // Clear the output.txt file
    fs.writeFile('output.txt', '', (err) => {
        if (err) {
            console.error(`Error clearing output.txt: ${err}`);
        } else {
            console.log('output.txt has been cleared.');
        }
    });

    resetProcessingState();
}

// Function to reset processing state
function resetProcessingState() {
    isProcessing = false;  // Reset the processing flag
    currentUserId = null;  // Clear the current user being processed
}

// Increase the maximum number of listeners
require('events').EventEmitter.defaultMaxListeners = 20;

// Log in to Discord
discordClient.login(token);

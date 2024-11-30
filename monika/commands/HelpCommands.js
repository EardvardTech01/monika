const { exec } = require('child_process');
const { PermissionsBitField, CategoryChannel } = require('discord.js');
const { getVoiceConnection, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const path = require('path'); // Import path module
const fs = require('fs');
const { discordClient } = require('../monika');
const { channel } = require('diagnostics_channel');

const allowedUpdateChannelId = '1302484920257740831'; // Replace with your channel ID

// Define allowed text channel IDs
const configPath = path.join(__dirname, 'NoVoiceChannels.json');
const dontAccess = path.join(__dirname, 'DoNotAccess.json');
const dontAccessChannels = path.join(__dirname, 'noTalkChannels.json');
const warnChannels = path.join(__dirname, 'warnChannel.json');
const permissionsFilePath = path.join(__dirname, 'permissions.json');
let updateChannels = {}; // Object to store update channels for each server
let DoNotAccessChannels = {}; // Object to store update channels for each server
let DoNotTalk = {};
let warnChannel = {};
let permissions = {};

// Load the config file
const loadConfig = () => {
    if (fs.existsSync(configPath)) {
        const data = fs.readFileSync(configPath);
        const config = JSON.parse(data);
        updateChannels = config.updateChannels || {}; // Load update channels from the file
    }
};

// Load the config file
const loaddontAccess = () => {
    if (fs.existsSync(dontAccess)) {
        const data = fs.readFileSync(dontAccess);
        const config = JSON.parse(data);
        DoNotAccessChannels = config.DoNotAccessChannels || {}; // Load ignored channels from the file
    }
};

// Load the config file
const loaddontAccessChannels = () => {
    if (fs.existsSync(dontAccessChannels)) {
        const data = fs.readFileSync(dontAccessChannels);
        const config = JSON.parse(data);
        DoNotTalk = config.DoNotTalk || {}; // Load ignored channels from the file
    }
};

// Load the config file
const loadWarnChannels = () => {
    if (fs.existsSync(warnChannels)) {
        const data = fs.readFileSync(warnChannels);
        const config = JSON.parse(data);
        warnChannel = config.warnChannel || {}; // Load ignored channels from the file
    }
};

// Function to load permissions from the JSON file or initialize if missing
const loadPermissions = () => {
    try {
        if (fs.existsSync(permissionsFilePath)) {
            permissions = JSON.parse(fs.readFileSync(permissionsFilePath, 'utf8'));
        } else {
            fs.writeFileSync(permissionsFilePath, JSON.stringify({}));
            console.log("Created new permissions.json file.");
        }
    } catch (err) {
        console.error("Error handling permissions.json:", err);
    }
};

// Function to save permissions to the JSON file
const savePermissions = () => {
    try {
        fs.writeFileSync(permissionsFilePath, JSON.stringify(permissions, null, 4));
    } catch (error) {
        console.error("Error saving permissions:", error);
    }
};

// Save the updated channels to the config file
const saveWarnChannels = () => {
    const config = { warnChannel };  // Wrap DoNotTalk object in config
    fs.writeFileSync(warnChannels, JSON.stringify(config, null, 2));  // Save to JSON file with proper formatting
};

// Save the updated channels to the config file
const savedontAccessChannels = () => {
    const config = { DoNotTalk };  // Wrap DoNotTalk object in config
    fs.writeFileSync(dontAccessChannels, JSON.stringify(config, null, 2));  // Save to JSON file with proper formatting
};

// Save the update channels to the config file
const saveConfig = () => {
    const config = { updateChannels };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
};

// Save the "Do Not Access" channels to the config file
const savedontAccess = () => {
    const config = { DoNotAccessChannels };
    fs.writeFileSync(dontAccess, JSON.stringify(config, null, 2));
};

let questions = [
    "Do you need help with verifying?",
    "Did you send 3-5 hentai images in <#1209208014913937421> one at a time?",
    "Do you get @ by this <@&1215767574911123577>"
];

async function inserver(message) {
    let commandList = '';

    const order34Commands = `
    \n**Order 34 help commands**
    - ?verificationhelp: will ask you general questions; if all fits the criteria, you'll be sent to verify
    `;

    const natsukiCommands = `
    \n**Natsuki commands**
    - !reportbug: will report any bug you find to the creator
    - !suggest: will send any suggestion to the creator; will not go for the server, only the made bots
    `;

    const yuriCommands = `
    \n**Yuri commands**
    - If you talk in the <#1243651979637555351>, Yuri will reply to you
    - !level: will show you your current level; only works in <#1267571130466697277>
    `;

    // Check the guild ID
    if (message.guild.id === '1209203729509785600') {
        commandList += order34Commands;
    }

    // Check for the specific user
    const NatsukiID = '1187505510388347042'; // Replace with the actual user ID
    const YuriID = '1182074383762718720'

    try {
        // Fetch the member to see if they're in the guild
        const member = await message.guild.members.fetch(NatsukiID);
        commandList += natsukiCommands; // Add Natsuki commands if the user is present
        console.log(`User ${NatsukiID} is present, adding Natsuki commands.`);
    } catch (error) {
        console.log(`User ${NatsukiID} is not present: ${error.message}`);
    }

    try {
        // Fetch the member to see if they're in the guild
        const member = await message.guild.members.fetch(YuriID);
        commandList += yuriCommands; // Add Natsuki commands if the user is present
        console.log(`User ${YuriID} is present, adding Natsuki commands.`);
    } catch (error) {
        console.log(`User ${YuriID} is not present: ${error.message}`);
    }

    return commandList; // Return the concatenated command list
}

let currentQuestionData = {}; // Track the question index for each user

module.exports = async (message, discordClient) => {
    if (message.author.bot) return; // Ignore bot messages

    loadConfig();
    loaddontAccess();

    loaddontAccessChannels();
    loadWarnChannels();
    loadPermissions();
    const DoNotAccessChannelIds = DoNotTalk[message.guild.id] || [];

    // For all other commands, check if the message is in the designated update channel
    if (DoNotAccessChannelIds.includes(message.channelId)) {
        const guildId = message.guild.id;
        const guildPermissions = permissions[guildId] || {};
        const warnChannelId = warnChannel[message.guild.id];

        // If the message is in a restricted channel, check permissions
        if (DoNotAccessChannelIds.includes(message.channelId)) {
            let canSendMessage = guildPermissions.can_send_message !== undefined ? guildPermissions.can_send_message : true;
            let canSendPictures = guildPermissions.can_send_pictures !== undefined ? guildPermissions.can_send_pictures : false;

            // Check the permission for sending messages
            if (!canSendMessage && message.content) {
                // Inform the user that they cannot send messages in this channel
                await message.delete();
                if (warnChannelId) {
                    try {
                        const warnChannel = await message.guild.channels.fetch(warnChannelId);
                        await warnChannel.send(`<@${message.author.id}> You don't have permission to send messages in that channel`);
                    } catch (error) {
                        console.error(`Failed to fetch or send message to warn channel ${warnChannelId}:`, error);
                    }
                } else {
                    console.warn(`No warning channel found for guild ID: ${message.guild.id}`);
                }
                console.log(`Message deleted from ${message.author.tag} in restricted channel: ${message.channel.name}`);
            }

            // Check the permission for sending pictures
            if (!canSendPictures && message.attachments.size > 0) {
                // Inform the user that they cannot send pictures in this channel
                await message.delete();
                if (warnChannelId) {
                    try {
                        const warnChannel = await message.guild.channels.fetch(warnChannelId);
                        await warnChannel.send(`<@${message.author.id}> You don't have permission to send pictures in that channel`);
                    } catch (error) {
                        console.error(`Failed to fetch or send message to warn channel ${warnChannelId}:`, error);
                    }
                } else {
                    console.warn(`No warning channel found for guild ID: ${message.guild.id}`);
                }
                console.log(`Message with attachment deleted from ${message.author.tag} in restricted channel: ${message.channel.name}`);
            }
        }

        return;
    }

    const guilds = discordClient.guilds.cache;

    const userId = message.author.id;

    // Check for the command
    if (message.content.toLowerCase().startsWith('?commandlist')) {
        // Help commands
        const commandList = `
        **Voice channel commands**
        - !play: plays a song from a youtube url, queues songs if there are already songs playing, and queues youtube playlist songs aswell
        - !skip: skips the current song
        - !back: goes back to the last song, can go back until the first song
        - !pause: pauses the current song
        - !resume: resumes the current song

        \n**Basic commands**
        - if you talk in any no mic vc's the bot will repeat what you say, will not work if there is music playing

        \n**Admin commands**
        - !setvoicechannel: sets a no mic channel for those who doesn't want to speak or can't
        - !removevoicechannel: removes a no mic channel for those who doesn't want to speak or can't
        - !setnoaccessvoicechannel: sets a no access voice chat
        - !removenoaccessvoicechannel: removes a no access voice chat
        - !setwarnchannel: sets a warn channel within this guild
        - !removewarnchannel: removes the warn channel from this guild
        - !setnotalkchannel: sets a channel that no one can talk in based on the permissions set
        - !removenotalkchannel: removes a channel from the list
        - !getnotalkchannels: gets the category of channels to add to the list
        - !removedonttalkchannels: removes the categories channels from the list
        - !setPermission: sets the given permissions to the channels in the list
        
        \n**Help commands**
        - ?commandlist: will show you the list of commands

        ${await inserver(message)}

        \nThis message will delete in 10 seconds
        \n--More coming soon--
        `;

        // Delete the user's command message
        await message.delete();

        // Send a normal message (not a reply)
        const botMessage = await message.channel.send(commandList);

        // Delete the bot's message after 10 seconds
        setTimeout(() => {
            botMessage.delete().catch(console.error);
        }, 10000); // Deletes after 10 seconds
    } else if (message.content.toLowerCase().startsWith('?verificationhelp')) {
        if (!(userId in currentQuestionData)) {
            currentQuestionData[userId] = { index: 0, channelId: message.channel.id }; // Initialize data for the user
            askQuestion(message); // Start asking questions
        } else if (currentQuestionData[userId].channelId === message.channel.id) {
            message.channel.send("You're already in the verification process in this channel!");
        } else {
            message.channel.send("You can only verify in the channel where you started the process.");
        }
    }

    if (currentQuestionData[userId] !== undefined && currentQuestionData[userId].channelId === message.channel.id) {
        // Handle responses only if the user is in the process and in the correct channel
        handleResponse(message);
    }

    const content = message.content.trim();

    // Command to set the update channel
    if (message.content.toLowerCase().startsWith('!setvoicechannel')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('You do not have permission to use this command.');
        }

        // Check for a mentioned channel or extract a channel ID from the message
        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(content.split(' ').pop());

        if (!channel) {
            return message.reply('Please mention a valid channel or provide a channel ID.');
        }

        updateChannels[message.guild.id] = channel.id; // Store the channel ID for the current server
        saveConfig(); // Save the new channel ID to the config file
        message.channel.send(`Update channel set to ${channel.name} for this server.`);
    } else if (message.content.toLowerCase().startsWith('!removevoicechannel')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('You do not have permission to use this command.');
        }
    
        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(content.split(' ').pop());
        
        if (!channel) {
            return message.reply('Please mention a valid channel or provide a channel ID.');
        }
    
        // Check if the specified channel is the one set for updates
        if (updateChannels[message.guild.id] === channel.id) {
            delete updateChannels[message.guild.id]; // Remove the channel ID for the current server
            saveConfig(); // Save the updated configuration to the file
            message.channel.send(`Update channel ${channel.name} has been removed for this server.`);
        } else {
            message.reply('The specified channel is not set as the update channel for this server.');
        }
        return; // Exit after processing the command
    }

    // Command to set the update channel
    if (message.content.toLowerCase().startsWith('!setwarnchannel')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('You do not have permission to use this command.');
        }

        // Check for a mentioned channel or extract a channel ID from the message
        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(content.split(' ').pop());

        if (!channel) {
            return message.reply('Please mention a valid channel or provide a channel ID.');
        }

        warnChannel[message.guild.id] = channel.id; // Store the channel ID for the current server
        saveWarnChannels(); // Save the new channel ID to the config file
        message.channel.send(`Update channel set to ${channel.name} for this server.`);
    } else if (message.content.toLowerCase().startsWith('!removewarnchannel')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('You do not have permission to use this command.');
        }
    
        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(content.split(' ').pop());
        
        if (!channel) {
            return message.reply('Please mention a valid channel or provide a channel ID.');
        }
    
        // Check if the specified channel is the one set for updates
        if (warnChannel[message.guild.id] === channel.id) {
            delete warnChannel[message.guild.id]; // Remove the channel ID for the current server
            saveWarnChannels(); // Save the updated configuration to the file
            message.channel.send(`Update channel ${channel.name} has been removed for this server.`);
        } else {
            message.reply('The specified channel is not set as the update channel for this server.');
        }
        return; // Exit after processing the command
    }

    // Command to set the "Do Not Access" voice channel
    if (message.content.toLowerCase().startsWith('!setnoaccessvoicechannel')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('You do not have permission to use this command.');
        }

        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(message.content.split(' ').pop());

        if (!channel) {
            return message.reply('Please mention a valid channel or provide a channel ID.');
        }

        // Initialize DoNotTalk if not already initialized
        if (!DoNotAccessChannels) {
            DoNotAccessChannels = {};  // Initialize the object if it doesn't exist
        }

        // Initialize the guild's list if it doesn't exist
        if (!DoNotAccessChannels[message.guild.id]) {
            DoNotAccessChannels[message.guild.id] = [];  // Create an empty array for the guild
        }

        // Add the channel ID if it isn't already in the list
        if (!DoNotAccessChannels[message.guild.id].includes(channel.id)) {
            DoNotAccessChannels[message.guild.id].push(channel.id);
        }

        // Save the updated DoNotTalk object to the JSON file
        savedontAccess();

        message.channel.send(`"Do Not Access" channel ${channel.name} has been added for this server.`);
    }else if (message.content.toLowerCase().startsWith('!removenoaccessvoicechannel')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('You do not have permission to use this command.');
        }
    
        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(message.content.split(' ').pop());
    
        if (!channel) {
            return message.reply('Please mention a valid channel or provide a channel ID.');
        }
    
        // Check if the DoNotTalk object exists and if the guild has any channels listed
        if (DoNotAccessChannels && DoNotAccessChannels[message.guild.id]) {
            const index = DoNotAccessChannels[message.guild.id].indexOf(channel.id);
    
            // If the channel is found, remove it from the list
            if (index !== -1) {
                DoNotAccessChannels[message.guild.id].splice(index, 1);
            } else {
                return message.reply('This channel is not in the "Do Not Talk" list.');
            }
        }
    
        // Save the updated DoNotTalk object to the JSON file
        savedontAccess();
    
        message.channel.send(`"Do Not Access" channel ${channel.name} has been removed for this server.`);
    }

    // Example of how you'd update the DoNotTalk object
    if (message.content.toLowerCase().startsWith('!setnotalkchannel')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('You do not have permission to use this command.');
        }

        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(message.content.split(' ').pop());

        if (!channel) {
            return message.reply('Please mention a valid channel or provide a channel ID.');
        }

        console.log(`Channel ID to set: ${channel.id}`);
        console.log('DoNotTalk object before:', DoNotTalk);

        // Initialize DoNotTalk if not already initialized
        if (!DoNotTalk) {
            DoNotTalk = {};  // Initialize the object if it doesn't exist
        }

        // Initialize the guild's list if it doesn't exist
        if (!DoNotTalk[message.guild.id]) {
            DoNotTalk[message.guild.id] = [];  // Create an empty array for the guild
        }

        // Add the channel ID if it isn't already in the list
        if (!DoNotTalk[message.guild.id].includes(channel.id)) {
            DoNotTalk[message.guild.id].push(channel.id);
            console.log('Added channel to the list');
        }

        console.log('DoNotTalk object after:', DoNotTalk);

        // Save the updated DoNotTalk object to the JSON file
        savedontAccessChannels();

        message.channel.send(`"Do Not Access" channel ${channel.name} has been added for this server.`);
    }else if (message.content.toLowerCase().startsWith('!removenotalkchannel')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('You do not have permission to use this command.');
        }
    
        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(message.content.split(' ').pop());
    
        if (!channel) {
            return message.reply('Please mention a valid channel or provide a channel ID.');
        }
    
        console.log(`Channel ID to remove: ${channel.id}`);
        console.log('DoNotTalk object before:', DoNotTalk);
    
        // Check if the DoNotTalk object exists and if the guild has any channels listed
        if (DoNotTalk && DoNotTalk[message.guild.id]) {
            const index = DoNotTalk[message.guild.id].indexOf(channel.id);
    
            // If the channel is found, remove it from the list
            if (index !== -1) {
                DoNotTalk[message.guild.id].splice(index, 1);
                console.log('Removed channel from the list');
            } else {
                return message.reply('This channel is not in the "Do Not Talk" list.');
            }
        }
    
        console.log('DoNotTalk object after:', DoNotTalk);
    
        // Save the updated DoNotTalk object to the JSON file
        savedontAccessChannels();
    
        message.channel.send(`"Do Not Access" channel ${channel.name} has been removed for this server.`);
    }else if (message.content.toLowerCase().startsWith('!getnotalkchannels')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('You do not have permission to use this command.');
        }
        
        const args = message.content.split(' ');
        const catagoryID = args[1];
    
        if (!catagoryID) {
            return message.reply('Please provide a category ID');
        }
    
        const guild = message.guild;
        const catagoryChannel = guild.channels.cache.get(catagoryID);
        
        if (!catagoryChannel || catagoryChannel.type !== 4) {
            return message.reply('Invalid category ID or the category does not exist.');
        }
    
        const channelsInCategory = guild.channels.cache.filter(channel => channel.parentId === catagoryID);
    
        if (channelsInCategory.size === 0) {
            return message.reply('No channels in this category');
        }
    
        const channelList = channelsInCategory.map(channel => channel.id);
    
        // Initialize the list if it doesn't exist
        if (!DoNotTalk[message.guild.id]) {
            DoNotTalk[message.guild.id] = [];
        }
    
        // Filter out channels that are already in the DoNotTalk list
        const newChannels = channelList.filter(id => !DoNotTalk[message.guild.id].includes(id));
        
        // Append only non-duplicate channels
        DoNotTalk[message.guild.id].push(...newChannels);
    
        savedontAccessChannels();
    
        message.reply(`Channels in category **${catagoryChannel.name}** have been saved:\n${newChannels.join('\n')}`);
    } else if (message.content.toLowerCase().startsWith('!removedonttalkchannels')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('You do not have permission to use this command.');
        }

        const args = message.content.split(' ');
        const categoryID = args[1];
        
        if (!categoryID) {
            return message.reply('Please provide a category ID');
        }
        
        const guild = message.guild;
        const categoryChannel = guild.channels.cache.get(categoryID);
        
        if (!categoryChannel || categoryChannel.type !== 4) {
            return message.reply('Invalid category ID or the category does not exist.');
        }
        
        const channelsInCategory = guild.channels.cache.filter(channel => channel.parentId === categoryID);
        
        if (channelsInCategory.size === 0) {
            return message.reply('No channels in this category');
        }
        
        const channelList = channelsInCategory.map(channel => channel.id);
        
        // Remove the category channels from the DoNotTalk list
        if (DoNotTalk[message.guild.id]) {
            // Filter out channels in the given category
            DoNotTalk[message.guild.id] = DoNotTalk[message.guild.id].filter(id => !channelList.includes(id));
        } else {
            return message.reply('There are no channels saved in the DoNotTalk list.');
        }
        
        savedontAccessChannels();
        
        message.reply(`Channels in category **${categoryChannel.name}** have been removed from the DoNotTalk list:\n${channelList.join('\n')}`);
    }

    // Command to set the permissions for a guild
    if (message.guild && message.content.startsWith("!setPermission")) {
        const args = message.content.split(" ");
        const permission = args[1];
        const value = args[2];

        if (!permission || !value) {
            return message.channel.send("Usage: !setPermission <permission> <true|false>");
        }

        // Ensure the permission value is valid
        if (permission !== "can_send_message" && permission !== "can_send_pictures") {
            return message.channel.send("Invalid permission type. Use `can_send_message` or `can_send_pictures`.");
        }

        // Convert "true"/"false" strings to booleans
        const booleanValue = value.toLowerCase() === 'true';

        // Update permissions for the guild
        permissions[message.guild.id] = permissions[message.guild.id] || {};
        permissions[message.guild.id][permission] = booleanValue;

        savePermissions();
        message.channel.send(`Permission ${permission} set to ${booleanValue} for this guild.`);
    }

    // Command to announce that the bot is getting updated in all connected servers
    if (message.content.startsWith('!update')) {
        // Check if the message is in the allowed channel
        if (message.channel.id !== allowedUpdateChannelId) {
            return;
        }

        const announcement = "The bot is currently updating. Please wait!";

        // Iterate through all connected guilds
        guilds.forEach(guild => {
            const connection = getVoiceConnection(guild.id);
            if (connection) {
                // Generate TTS audio using gTTS
                const ttsFilePath = `tts-update-${guild.id}.mp3`; // Unique file for each announcement
                exec(`gtts-cli "${announcement}" --output ${ttsFilePath}`, (error) => {
                    if (error) {
                        console.error(`Error generating TTS: ${error}`);
                        return; // Exit on error
                    }

                    const player = createAudioPlayer();
                    const resource = createAudioResource(ttsFilePath);
                    player.play(resource);
                    connection.subscribe(player);

                    player.on('idle', () => {
                        console.log(`Finished playing the update message in **${guild.name}**.`);
                        connection.destroy();

                        setTimeout(() => {
                            if (fs.existsSync(ttsFilePath)) {
                                try {
                                    fs.unlinkSync(ttsFilePath);
                                } catch (error) {
                                    console.error("Error deleting the TTS file:", error);
                                }
                            }
                        }, 1000);
                        // Optionally delete the TTS file after playing
                        // fs.unlinkSync(ttsFilePath);
                    });
                });
            }
        });

        message.reply('Announcement sent to all connected servers.');
    }

    if (message.content.toLowerCase().startsWith("!emojiballs")) {
        await message.delete()

        await message.channel.send(`<:balls:1303482542955171902>`)
    }

    // if (message.guild.id == 1209203729509785600) {
        
    // }
}

function askQuestion(message) {
    const userId = message.author.id;

    if (currentQuestionData[userId].index < questions.length) {
        // Send the current question to the user in the same channel
        message.channel.send(`${message.author}, ${questions[currentQuestionData[userId].index]}`);
    } else {
        // User has answered all questions
        message.channel.send("Thank you for your responses!");
        // Execute the reward code
        message.channel.send("You may proceed to the verify channel <#1267537196143870002>! 🎉");
        // Reset the data for the user
        delete currentQuestionData[userId];
    }
}

function handleResponse(message) {
    const userId = message.author.id;

    if (message.content.toLowerCase() === 'yes') {
        currentQuestionData[userId].index++;
        askQuestion(message);
    } else if (message.content.toLowerCase() === 'no') {
        message.channel.send("Thank you for your response. Please send 3 or more ONE AT A TIME in <#1209208014913937421> and try again");
        // Reset for the user
        delete currentQuestionData[userId];
    }
}
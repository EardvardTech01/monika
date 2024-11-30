const { ShardingManager } = require('discord.js');
require('dotenv').config();

const manager = new ShardingManager('./monika/monika.js', {
    token: process.env.MONIKA_TOKEN,
    totalShards: 'auto', // Automatically determine the number of shards
});

manager.spawn(); // Spawn all shards only once

manager.on('ready', () => {
    console.log(`Shard ${shard.id} is ready.`);
});

manager.on('death', () => {
    console.error(`Shard ${shard.id} died.`);
    if (!shard.process) {
        console.log(`Respawning shard ${shard.id}...`);
        shard.respawn();
    }
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1); // Restart the bot process if necessary
});
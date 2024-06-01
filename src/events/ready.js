const { Events } = require('discord.js');
const autoDeleteChannel = require('../systems/autoDeleteChannel');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        const intervalId = setInterval(() => autoDeleteChannel(client), 10 * 1000);
    }
};

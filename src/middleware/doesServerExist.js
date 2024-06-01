const { DiscordServers } = require("../models/model");

async function doesServerExist(guildId) {
    const server = await DiscordServers.findOne({ guildId: guildId });
    if(!server) return [false, null]
    return [true, server]
}

module.exports = doesServerExist;
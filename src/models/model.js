const mongoose = require("mongoose");

const DiscordServers = mongoose.model("DiscordServers_EXP", new mongoose.Schema({
    guildId: String,
    levelRoles: [{
        lvl: Number,
        roleId: String,
        default: []
    }],
    multiplier: {
        type: Number,
        default: 1.0,
    },
    channel: {
        type: String,
        default: 0
    },
    profileBackground: String,
    privateChannel: String,
    logPrivateChannel: String,
    parent: String,
    modRole: String,
}));

const DiscordServersUsers = mongoose.model("DiscordServersUsers_EXP", new mongoose.Schema({
    guildId: String,
    userId: String,
    exp: Number,
    lvl: Number,
    voiceTime: Number,
}));


module.exports = { DiscordServers, DiscordServersUsers };

const { Events, PermissionsBitField, ChannelType } = require("discord.js");
const { DiscordServers, DiscordServersUsers } = require("../models/model");
const doesServerExist = require("../middleware/doesServerExist");

module.exports = {
    name: Events.ChannelUpdate,
    async execute(oldChannel, newChannel) {
        const [exist, existServer] = await doesServerExist(newChannel.guild.id);
        if (!exist) return;

        const logChannel = await newChannel.guild.channels.cache.get(existServer.logPrivateChannel);

        if (oldChannel.name !== newChannel.name) {
            await logChannel.send({
                content: `\`[✅] Изменено название приватного канала(${oldChannel.name} -> ${newChannel.name}). \`<#${newChannel.id}>`
            })
        }
        if (oldChannel.bitrate !== newChannel.bitrate) {
            await logChannel.send({
                content: `\`[✅] Изменено количество битрейта приватного канала(${oldChannel.bitrate} -> ${newChannel.bitrate}). \`<#${newChannel.id}>`
            })
        }
        if (oldChannel.userLimit !== newChannel.userLimit) {
            await logChannel.send({
                content: `\`[✅] Изменен лимит приватного канала(${oldChannel.userLimit} -> ${newChannel.userLimit}). \`<#${newChannel.id}>`
            })
        }
    }
}
const { ChannelType } = require("discord.js");
const { DiscordServers } = require("../models/model");

async function autoDeleteChannel(client){

    const guilds = client.guilds.cache.map(guild => guild.id);

    guilds.map(async item => {
        const server = await DiscordServers.findOne({ guildId: item })
        if (!server);
        const guild = await client.guilds.fetch(item);
        var categoryChannels = await guild.channels.cache.filter(c => c.type == ChannelType.GuildVoice)
        var categoryId = server.parent
    
        categoryChannels = categoryChannels.filter((channel) => {
            if (channel.parentId === categoryId && channel.id !== server.privateChannel && channel.members.size === 0) return true;
            return false
        })
    
        const logChannel = await guild.channels.cache.get(server.logPrivateChannel);
    
        categoryChannels.map(async channel => {
            await logChannel.send({
                content: `\`[✅] Приватный канал \`<#${channel.id}>\` был автоматически удален.\``
            })
            await channel.delete();
        })
    })
}

module.exports = autoDeleteChannel;
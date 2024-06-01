const { SlashCommandBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const { DiscordServers } = require('../../models/model');
const doesServerExist = require('../../middleware/doesServerExist');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create-private')
        .setDescription('Включить систему приватных каналов'),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.All)) return;
        const [exist, _] = await doesServerExist(interaction.guild.id);
        if (!exist) return await interaction.reply({
            content: "\`[❌] Сервер не зарегистрирован в базе данных бота.\`",
            ephemeral: true
        })

        const channel = await interaction.guild.channels.create({
            name: "🎧┃Создать приват",
            type: ChannelType.GuildVoice,
            userLimit: "1"
        })

        const channelLog = await interaction.guild.channels.create({
            name: "лог-приватов",
            type: ChannelType.GuildText,
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel],
                }
            ],
        })

        const server = await DiscordServers.findOne({ guildId: interaction.guild.id })

        server.privateChannel = channel.id;
        server.logPrivateChannel = channelLog.id;
        await server.save();

        await interaction.reply({
            content: "\`[✅] Канал был успешно создан!\`",
            ephemeral: true
        })
    },
};
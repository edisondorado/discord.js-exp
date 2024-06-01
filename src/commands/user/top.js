const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { DiscordServersUsers } = require("../../models/model");
const doesServerExist = require("../../middleware/doesServerExist");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("top")
        .setDescription("Топ пользователей по уровню/количеству проведенного времени в голосовых каналах")
        .addSubcommand(subcommand =>
                subcommand
                    .setName("lvl")
                    .setDescription("Топ по уровню"))
        .addSubcommand(subcommand =>
                subcommand
                    .setName('voice')
                    .setDescription("Топ по голосовым каналам")),
        
    async execute(interaction){
        const [exist, _] = await doesServerExist(interaction.guild.id);
        if (!exist) return await interaction.reply({
            content: "\`[❌] Сервер не зарегистрирован в базе данных бота.\`",
            ephemeral: true
        })

        if (interaction.options.getSubcommand() === "lvl") {
            const topLvl = await DiscordServersUsers.find({ guildId: interaction.guild.id })
                .sort({ lvl: -1 })
                .limit(15)

            const embed = new EmbedBuilder()
                .setTitle("👑 | Топ пользователей по уровню")
                .setDescription(`${topLvl.map((user, index) => `**${index + 1}.** <@${user.userId}> **- уровень ${user.lvl}**`).join('\n')}`)
                .setColor(0x00FF00)
                .setTimestamp()
                .setFooter({ text: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL() });

            await interaction.reply({
                content: "",
                embeds: [embed]
            })
    
        } else if (interaction.options.getSubcommand() === "voice"){
            const topVoice = await DiscordServersUsers.find({ guildId: interaction.guild.id })
                .sort({ voiceTime: -1 })
                .limit(15);

            const embed = new EmbedBuilder()
                .setTitle("👑 | Топ пользователей по голосовым каналам")
                .setDescription(`${topVoice.map((user, index) => `**${index + 1}.** <@${user.userId}> **- ${formatTime(user.voiceTime)}ч.**`).join('\n')}`)
                .setColor(0x00FF00)
                .setTimestamp()
                .setFooter({ text: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL() });

            await interaction.reply({
                content: "",
                embeds: [embed]
            })
        }
    }
}

function formatTime(milliseconds) {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

    return hours;
}
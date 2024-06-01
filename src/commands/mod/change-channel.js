const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const { DiscordServers } = require("../../models/model");
const doesServerExist = require("../../middleware/doesServerExist");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("change-channel")
        .setDescription("Настроить канал уведомлений об повышении уровня")
        .addStringOption(option =>
                option
                    .setName("канал")
                    .setDescription("ID Канала. Если ввести \"0\", сообщение будет выводится в последнем чате пользователя")
                    .setRequired(false)),
        
    async execute(interaction){
        if (!interaction.member.permissions.has(PermissionsBitField.All)) return;

        const [exist, _] = await doesServerExist(interaction.guild.id);
        if (!exist) return await interaction.reply({
            content: "\`[❌] Сервер не зарегистрирован в базе данных бота.\`",
            ephemeral: true
        })
        
        const channel = interaction.options.getString("канал");

        if (channel === "0"){
            const server = await DiscordServers.findOne({ guildId: interaction.guild.id })
            server.channel = 1;

            return await server.save()
                .then(async () => {
                    return await interaction.reply({
                        content: `\`[✅] Канал был успешно убран!\``,
                        ephemeral: true
                    })
                })
                .catch(async error => {
                    console.warn(error);
                    return await interaction.reply({
                        content: "\`[❌] Произошла ошибка во время смены канала! Сообщите разработчику: <@701440080111337513>\`",
                        ephemeral: true
                    })
                })
        }

        const isExist = await interaction.guild.channels.cache.has(channel);

        if (!isExist) return await interaction.reply({
            content: "\`[❌] Канал с данным ID не существует!\`",
            ephemeral: true
        })

        const server = await DiscordServers.findOne({ guildId: interaction.guild.id })
        server.channel = channel;

        await server.save()
            .then(async () => {
                await interaction.reply({
                    content: `\`[✅] Канал был успешно изменен на \`<#${channel}>`,
                    ephemeral: true
                })
            })
            .catch(async error => {
                await interaction.reply({
                    content: "\`[❌] Произошла ошибка во время смены канала! Сообщите разработчику: <@701440080111337513>\`",
                    ephemeral: true
                })

                console.warn(error);
            })
    }
}
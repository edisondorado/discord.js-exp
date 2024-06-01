const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const { DiscordServers } = require("../../models/model");
const doesServerExist = require("../../middleware/doesServerExist");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("change-parent")
        .setDescription("Настроить раздел для приватных каналов")
        .addStringOption(option =>
                option
                    .setName("раздел")
                    .setDescription("ID Раздела")
                    .setRequired(true)),
        
    async execute(interaction){
        if (!interaction.member.permissions.has(PermissionsBitField.All)) return;

        const [exist, _] = await doesServerExist(interaction.guild.id);
        if (!exist) return await interaction.reply({
            content: "\`[❌] Сервер не зарегистрирован в базе данных бота.\`",
            ephemeral: true
        })
        
        const parent = interaction.options.getString("раздел");

        const server = await DiscordServers.findOne({ guildId: interaction.guild.id })
        server.parent = parent;

        await server.save()
            .then(async () => {
                await interaction.reply({
                    content: `\`[✅] Раздел был успешно изменен на <#${parent}>\``,
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
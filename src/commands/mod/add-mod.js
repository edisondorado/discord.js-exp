const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, Embed, PermissionsBitField } = require("discord.js");
const { DiscordServers } = require("../../models/model");
const doesServerExist = require("../../middleware/doesServerExist");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("add-mod")
        .setDescription("Добавить роль с полным доступом к приватам")
        .addRoleOption(option =>
            option
                .setName("роль")
                .setDescription("ID Роли")
                .setRequired(true)),
        
    async execute(interaction){
        if (!interaction.member.permissions.has(PermissionsBitField.All)) return;

        const [exist, _] = await doesServerExist(interaction.guild.id);
        if (!exist) return await interaction.reply({
            content: "\`[❌] Сервер не зарегистрирован в базе данных бота.\`",
            ephemeral: true
        })
        
        const role = interaction.options.getRole("роль");

        const server = await DiscordServers.findOne({ guildId: interaction.guild.id })
        server.modRole = role.id;

        await server.save()
            .then(async () => {
                await interaction.reply({
                    content: `\`[✅] Раздел был успешно изменен на \`<@&${role.id}>`,
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
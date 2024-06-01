const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, PermissionsBitField } = require("discord.js");
const doesServerExist = require("../../middleware/doesServerExist");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setup")
        .setDescription("Запустить работу бота."),
    async execute(interaction){
        if (!interaction.member.permissions.has(PermissionsBitField.All)) return;

        const [exist, _] = await doesServerExist(interaction.guild.id);
        if (exist) return await interaction.reply({
            content: "\`[❌] Сервер уже имеется в базе данных бота.\`",
            ephemeral: true
        })

        const embed = new EmbedBuilder()
            .setTitle(`🔐 | Авторизация бота`)
            .setDescription(`Для продолжения, вам необходимо нажать кнопку ниже.\nПосле подтверждения, сервер будет добавлен в базу данных и хранить статистику пользователей.\nВы можете настроить автоматическую выдачу роли за уровни, используя команду: /role-exp\nНастроить множитель опыта: /exp-multiplier\nНастроить канал с повышением уровня, по стандарту значение - 0, будет выводится в чате с последним сообщением: /change-channel`)
            .setColor(0x00FF00)

        const optionButtons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("AcceptBot")
                    .setEmoji({ name: "✅" })
                    .setLabel("Подтвердить")
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId("DeclineBot")
                    .setEmoji({ name: "❌" })
                    .setLabel("Отказаться")
                    .setStyle(ButtonStyle.Danger)
            )

        await interaction.reply({
            content: "",
            embeds: [embed],
            components: [optionButtons],
            ephemeral: true
        })
    }
}
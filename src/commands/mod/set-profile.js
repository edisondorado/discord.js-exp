const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const { DiscordServersUsers } = require("../../models/model");
const doesServerExist = require("../../middleware/doesServerExist");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("set-profile")
        .setDescription("Выдать уровень/опыт")
        .addSubcommand(subcommand =>
                subcommand
                    .setName("lvl")
                    .setDescription("Установить уровень")
                    .addUserOption(option => 
                        option
                            .setName("пользователь")
                            .setDescription("-")
                            .setRequired(true))
                    .addNumberOption(option =>
                        option
                            .setName("уровень")
                            .setDescription("-")
                            .setRequired(true)))
        .addSubcommand(subcommand =>
                    subcommand
                        .setName('exp')
                        .setDescription("Установить количество EXP")
                        .addUserOption(option => 
                            option
                                .setName("пользователь")
                                .setDescription("-")
                                .setRequired(true))
                        .addNumberOption(option =>
                            option
                                .setName("опыт")
                                .setDescription("-")
                                .setRequired(true))),
        
    async execute(interaction){
        if (!interaction.member.permissions.has(PermissionsBitField.All)) return;

        const [exist, existServer] = await doesServerExist(interaction.guild.id);
        if (!exist) return await interaction.reply({
            content: "\`[❌] Сервер не зарегистрирован в базе данных бота.\`",
            ephemeral: true
        })

        const target = interaction.options.getMember("пользователь");
        const user = await DiscordServersUsers.findOne({ userId: target.id, guildId: interaction.guild.id })

        if (interaction.options.getSubcommand() === "lvl") {
            const lvl = interaction.options.getNumber("уровень");

            if (lvl > 100) return await interaction.reply({
                content: `\`[❌] Уровень не может быть выше 100-го!\``,
                ephemeral: true
            })

            if (lvl < 1) return await interaction.reply({
                content: `\`[❌] Уровень не может быть ниже 1-го!\``,
                ephemeral: true
            })

            user.lvl = lvl;
            await user.save();
            
            await interaction.reply({
                content: `\`[✅] Уровень был успешно изменен!\``,
                ephemeral: true
            })
        } else if (interaction.options.getSubcommand() === "exp"){
            const exp = interaction.options.getNumber("опыт");

            if (exp > 1000000) return await interaction.reply({
                content: `\`[❌] Вы ввели слишком большое количество опыта!\``,
                ephemeral: true
            })

            if (exp < 1) return await interaction.reply({
                content: `\`[❌] Количество опыта не может быть меньше 1-го!\``,
                ephemeral: true
            })

            user.exp = exp;
            await user.save();

            await interaction.reply({
                content: `\`[✅] Количество опыта было успешно изменено!\``,
                ephemeral: true
            })
        }
    }
}
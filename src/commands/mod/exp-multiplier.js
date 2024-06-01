const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const { DiscordServers } = require("../../models/model");
const doesServerExist = require("../../middleware/doesServerExist");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("exp-multiplier")
        .setDescription("Настроить множитель опыта за уровень")
        .addStringOption(option =>
                option
                    .setName("множитель")
                    .setDescription("Стандартный множитель опыта - x1.0. Принимаются значения с плавующей точкой(1.5/2.5 и т.д)")
                    .setRequired(false)),
        
    async execute(interaction){
        if (!interaction.member.permissions.has(PermissionsBitField.All)) return;

        const [exist, existServer] = await doesServerExist(interaction.guild.id);
        if (!exist) return await interaction.reply({
            content: "\`[❌] Сервер не зарегистрирован в базе данных бота.\`",
            ephemeral: true
        })
        
        const multiplier = interaction.options.getString("множитель");

        if (!multiplier) return await interaction.reply({
            content: `\`[✅] Активный множитель опыта: x${existServer.multiplier}\``,
            ephemeral: true
        })

        if (isNumeric(multiplier)){
            const float_multiplier = parseFloat(multiplier)

            if (float_multiplier < 0.5) return interaction.reply({
                content: `\`[❌] Значение множителя не может быть меньше 0.5. Пожалуйста, укажите число больше.\``,
                ephemeral: true
            })

            if (float_multiplier === existServer.multiplier) return interaction.reply({
                content: `\`[❌] Введенное значение не отличается от текущего значения. Пожалуйста, укажите другое число для замены.\``,
                ephemeral: true
            })

            const server = await DiscordServers.findOne({ guildId: interaction.guild.id })
            server.multiplier = float_multiplier

            await server.save()
                .then(async () => {
                    await interaction.reply({
                        content: `\`[✅] Множитель опыта был успешно изменен на: x${float_multiplier}!\``,
                        ephemeral: true
                    })
                })
                .catch(async error => {
                    await interaction.reply({
                        content: "\`[❌] Произошла ошибка во время смены множителя! Сообщите разработчику: <@701440080111337513>\`",
                        ephemeral: true
                    })

                    console.warn(error);
                })
        } else {
            await interaction.reply({
                content: "\`[❌] Введено некорректное значение! Поддерживаются только цифры и числа с плавующей точкой(0-9.)\`",
                ephemeral: true
            })
        }
    }
}

function isNumeric(input){
    return !isNaN(parseFloat(input)) && isFinite(input);
}
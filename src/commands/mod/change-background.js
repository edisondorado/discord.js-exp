const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const { DiscordServers } = require("../../models/model");
const doesServerExist = require("../../middleware/doesServerExist");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("change-background")
        .setDescription("Заменить задний фон профиля")
        .addStringOption(option =>
                option
                    .setName("ссылка")
                    .setDescription("Прямая ссылка на картинку(PNG)")
                    .setRequired(true)),
        
    async execute(interaction){
        if (!interaction.member.permissions.has(PermissionsBitField.All)) return;

        const [exist, _] = await doesServerExist(interaction.guild.id);
        if (!exist) return await interaction.reply({
            content: "\`[❌] Сервер не зарегистрирован в базе данных бота.\`",
            ephemeral: true
        })
        
        const urlImage = interaction.options.getString("ссылка");

        getImageBuffer(urlImage)
            .then(async () => {
                const server = await DiscordServers.findOne({ guildId: interaction.guild.id })
                
                server.profileBackground = urlImage

                await server.save();

                await interaction.reply({
                    content: `\`[✅] Вы успешно установили задний фон профиля!\``,
                    ephemeral: true
                })
            })
            .catch(async (error) => {
                console.warn(error);
                await interaction.reply({
                    content: "\`[❌] Предоставленная ссылка не является прямой ссылкой на картинку, либо же формат не поддерживается!\`",
                    ephemeral: true
                })
            })
    }
}

async function getImageBuffer(url) {
    const response = await axios.get(url, {
        responseType: 'arraybuffer'
    });
    return Buffer.from(response.data, 'binary');
}
const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { DiscordServersUsers } = require('../../models/model');
const doesServerExist = require('../../middleware/doesServerExist');
const createImage = require('../../systems/createImage');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Получить статистику'),
    async execute(interaction) {
        const [exist, existServer] = await doesServerExist(interaction.guild.id);
        if (!exist) return await interaction.reply({
            content: "\`[❌] Сервер не зарегистрирован в базе данных бота.\`",
            ephemeral: true
        })

        let user;
        user = await DiscordServersUsers.findOne({ userId: interaction.member.id, guildId: interaction.guild.id })
        
        if (!user) {
            user = await DiscordServersUsers.create({
                guildId: interaction.guild.id,
                userId: interaction.member.id,
                exp: 0,
                lvl: 1,
                voiceTime: 0
            })
        }

        const imageBuffer = await createImage(interaction, interaction.user, user.lvl, user.exp, user.voiceTime, existServer);

        console.log(imageBuffer)

        const attachment = new AttachmentBuilder(imageBuffer, { name: "user-info.png" })

        try {
            await interaction.reply({ files: [attachment] });
        } catch (error) {
            console.error('Произошла ошибка при отправке ответа:', error);
            await interaction.followUp('Произошла ошибка при отправке ответа. Пожалуйста, попробуйте еще раз или свяжитесь с администратором сервера.');
        }
    },
};
const { DiscordServers } = require("../../models/model");

async function setupInteraction(interaction){
    if (interaction.customId === "AcceptBot"){
        await DiscordServers.create({
            guildId: interaction.guild.id,
        })
            .then(async () => {
                await interaction.reply({
                    content: "\`[✅] Бот был успешно авторизован!\`",
                    ephemeral: true
                })
            })
            .catch(async (err) => {
                console.warn("Creating data for server:", err);
                await interaction.reply({
                    content: "\`[❌] Произошла ошибка во время авторизации! Сообщите разработчику: <@701440080111337513>\`",
                    ephemeral: true
                })
            }) 
    } else if (interaction.customId === "DeclineBot"){
        await interaction.reply({
            content: "\`[💔] Вы отказались от меня.\`",
            ephemeral: true
        })
        await interaction.guild.leave()
    }
}

module.exports = setupInteraction;
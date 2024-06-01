const { Events, PermissionsBitField } = require("discord.js");
const { execute } = require("./ready");
const setupInteraction = require("./systems/SetupInteraction");

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isButton()){
            if (interaction.customId === "AcceptBot" || interaction.customId === "DeclineBot") return await setupInteraction(interaction);
        }

        if (interaction.isChatInputCommand()){
            const command = interaction.client.commands.get(interaction.commandName);
            try{
                await command.execute(interaction)
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.channel.send({ content: '\`[❌] Произошла ошибка во время использования команды!\`' });
                } else {
                    await interaction.channel.send({ content: '\`[❌] Произошла ошибка во время использования команды!\`' });
                }
            }
        }
    }
};
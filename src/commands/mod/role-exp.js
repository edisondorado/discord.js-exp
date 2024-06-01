const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");
const { DiscordServers } = require("../../models/model");
const doesServerExist = require("../../middleware/doesServerExist");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("role-exp")
        .setDescription("Настроить выдачу ролей за уровень")
        .addSubcommand(subcommand =>
                subcommand
                    .setName("add")
                    .setDescription("Добавить роль")
                    .addNumberOption(option =>
                        option
                            .setName("уровень")
                            .setDescription("Уровень, за которой будет выдана роль")
                            .setRequired(false))
                    .addStringOption(option =>
                            option
                                .setName("роль")
                                .setDescription("ID Роли")
                                .setRequired(false)))
        .addSubcommand(subcommand =>
                    subcommand
                        .setName('remove')
                        .setDescription("Удалить роль")
                        .addStringOption(option =>
                                option
                                    .setName("роль")
                                    .setDescription("ID Роли")
                                    .setRequired(true)))
        .addSubcommand(subcommand =>
                    subcommand
                        .setName("list")
                        .setDescription("Список занятых ролей/уровней")),
        
    async execute(interaction){
        if (!interaction.member.permissions.has(PermissionsBitField.All)) return;

        const [exist, existServer] = await doesServerExist(interaction.guild.id);
        if (!exist) return await interaction.reply({
            content: "\`[❌] Сервер не зарегистрирован в базе данных бота.\`",
            ephemeral: true
        })
        if (interaction.options.getSubcommand() === "list") {
            const embed = new EmbedBuilder()
                .setTitle("Система уровней:")
                .setDescription(`${existServer.levelRoles.length > 0 ? existServer.levelRoles.map(item => `**${item.lvl} уровень** - <@&${item.roleId}> \`(${item.roleId})\``).join("\n") : "-" }`)
                .setColor(0x00FF00)

            return await interaction.reply({
                content: "",
                embeds: [embed],
                ephemeral: true
            })
        } else if (interaction.options.getSubcommand() === "add"){

            const lvl = interaction.options.getNumber("уровень");
            const role = interaction.options.getString("роль");

            const doesRoleExist = await interaction.guild.roles.cache.has(role);

            if(!doesRoleExist) return await interaction.reply({
                content: "\`[❌] Указанная роль не существует!\`",
                ephemeral: true
            })

            if (existServer.levelRoles > 0) {
                const foundIndexRole = existServer.levelRoles.findIndex(role => role.roleId === role)
                const foundIndexLvl = existServer.levelRoles.findIndex(lvl => lvl.lvl === lvl)
                if (foundIndexRole !== -1){
                    return await interaction.reply({
                        content: "\`[❌] Данная роль уже занята! Для просмотра списка, используйте: /role-exp list\`",
                        ephemeral: true
                    })
                }

                if (foundIndexLvl !== -1){
                    return await interaction.reply({
                        content: "\`[❌] Данная роль уже занята! Для просмотра списка, используйте: /role-exp list\`",
                        ephemeral: true
                    })
                }
            }

            const server = await DiscordServers.findOne({ guildId: interaction.guild.id })

            server.levelRoles.push({lvl: lvl, roleId: role})

            await server.save()

            await interaction.reply({
                content: "\`[✅] Роль была успешно добавлена!\`",
                ephemeral: true
            })
        } else if (interaction.options.getSubcommand() === "remove") {
            const roleIdToRemove = interaction.options.getString("роль");

            const server = await DiscordServers.findOne({ guildId: interaction.guild.id })

            const index = server.levelRoles.findIndex(role => role.roleId === roleIdToRemove)

            if (index !== -1) {
                server.levelRoles.splice(index, 1);

                await server.save()
                    .then(async () => {
                        await interaction.reply({
                            content: "\`[✅] Роль была успешно удалена из базы данных!\`",
                            ephemeral: true
                        })
                    })
                    .catch(async error => {
                        await interaction.reply({
                            content: "\`[❌] Произошла ошибка во время удаления роли из базы данных! Сообщите разработчику: <@701440080111337513>\`",
                            ephemeral: true
                        })

                        console.warn(error);
                    })
            } else {
                await interaction.reply({
                    content: "\`[❌] Роль не была найдена в базе данных!\`",
                    ephemeral: true
                })
            }
        }
    }
}
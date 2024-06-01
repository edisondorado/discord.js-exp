const { Events } = require("discord.js");
const { DiscordServersUsers } = require("../models/model");
const { DiscordServers } = require("../models/model");

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        const server = await DiscordServers.findOne({ guildId: message.guild.id })
        if (!server) return;

        const baseExp = 100;
        const exponent = 1.5;
        const expMultiplier = server.multiplier;
        
        let user;
        user = await DiscordServersUsers.findOne({ userId: message.member.id, guildId: message.guild.id })
        if (!user) {
            user = await DiscordServersUsers.create({
                guildId: message.guild.id,
                userId: message.member.id,
                exp: 0,
                lvl: 1,
                voiceTime: 0
            })
        }

        const sortedRoles = server.levelRoles.sort((a, b) => a.lvl - b.lvl);

        let highestRole = null;

        for (const roleData of sortedRoles) {
            if (roleData.lvl <= user.lvl) {
                highestRole = roleData;
            } else {
                break;
            }
        }

        for (const roleData of sortedRoles) {
            const role = message.guild.roles.cache.get(roleData.roleId);

            if (!role) continue;

            if (roleData !== highestRole && message.member.roles.cache.has(role.id)) {
                try {
                    await message.member.roles.remove(role);
                    console.log(`Роль ${role.name} удалена у пользователя.`);
                } catch (error) {
                    console.error(`Ошибка при удалении роли ${role.name}:`, error);
                }
            }
        }

        if (highestRole) {
            const role = message.guild.roles.cache.get(highestRole.roleId);

            if (role && !message.member.roles.cache.has(role.id)) {
                try {
                    await message.member.roles.add(role);
                    console.log(`Пользователь получил роль ${role.name} за уровень ${highestRole.lvl}.`);
                } catch (error) {
                    console.error(`Ошибка при добавлении роли ${role.name}:`, error);
                }
            }
        }
        

        if (user.lvl < 100){
            const xpGained = giveExp(2, message.content.length > 200 ? 200 : message.content.length, expMultiplier);
            const [total_exp, newLvl] = calculateLevel(baseExp, exponent, user.exp + xpGained, user.lvl);

            if (total_exp !== null){
                user.exp = total_exp;
                user.lvl = newLvl;
                await user.save();
            } else {
                user.exp += xpGained;
                await user.save();
            }
        }
    }
}

function giveExp(baseExpPerMessage, textLength, multiplier) {
    const xp_for_message = baseExpPerMessage * ( multiplier + (textLength / 10) );
    return xp_for_message;
}

function calculateLevel(base_exp, exponent, total_exp, current_level) {
    const xp_need = base_exp * current_level^exponent;

    if (total_exp >= xp_need){
        return [ total_exp - xp_need, current_level + 1 ]
    } else {
        return [ null, current_level ]
    }
}
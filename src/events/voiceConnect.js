const { Events, PermissionsBitField, ChannelType } = require("discord.js");
const { DiscordServers, DiscordServersUsers } = require("../models/model");
const doesServerExist = require("../middleware/doesServerExist");

const voiceConnectionTimes = new Map();
const usersConnect = new Map();

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState) {
        const [exist, existServer] = await doesServerExist(newState.guild.id);
        if (!exist) return;

        if (oldState.channelId !== newState.channelId) {
            if (newState.channelId !== null) {
                voiceConnectionTimes.set(newState.id, Date.now());
                if (existServer.privateChannel && newState.channelId === existServer.privateChannel){
                    const member = await newState.guild.members.cache.get(newState.id);
                    if (usersConnect.has(newState.id) && new Date().getTime() - usersConnect.get(newState.id) < 60 * 1000) return await member.voice.setChannel(null);

                    const createChannel = await newState.guild.channels.cache.get(existServer.privateChannel);
                    if (!await newState.guild.channels.cache.has(existServer.logPrivateChannel)) return;
                    const logChannel = await newState.guild.channels.cache.get(existServer.logPrivateChannel);

                    const everyone = newState.guild.roles.cache.get(newState.guild.id)

                    const channel = await newState.guild.channels.create({
                        name: member.user.username,
                        type: ChannelType.GuildVoice,
                        parent: createChannel.parent,
                        permissionOverwrites: [
                            {
                                id: everyone.id,
                                allow: [
                                    PermissionsBitField.Flags.Stream,
                                    PermissionsBitField.Flags.Connect,
                                ]
                            },
                            {
                                id: newState.id,
                                allow: [
                                    PermissionsBitField.Flags.ManageChannels,
                                    PermissionsBitField.Flags.MuteMembers, 
                                    PermissionsBitField.Flags.DeafenMembers, 
                                    PermissionsBitField.Flags.MoveMembers,
                                    PermissionsBitField.Flags.Stream
                                ],
                            }
                        ],
                    })
                    if (existServer.modRole && newState.guild.roles.cache.has(existServer.modRole)) {
                        channel.permissionOverwrites.set([
                            {
                                id: everyone.id,
                                allow: [
                                    PermissionsBitField.Flags.Stream,
                                    PermissionsBitField.Flags.Connect,
                                ]
                            },
                            {
                                id: newState.id,
                                allow: [
                                    PermissionsBitField.Flags.ManageChannels,
                                    PermissionsBitField.Flags.MuteMembers, 
                                    PermissionsBitField.Flags.DeafenMembers, 
                                    PermissionsBitField.Flags.MoveMembers,
                                    PermissionsBitField.Flags.Stream
                                ],
                            },
                            {
                                id: existServer.modRole,
                                allow: [PermissionsBitField.Flags.MuteMembers, PermissionsBitField.Flags.DeafenMembers, PermissionsBitField.Flags.MoveMembers]
                            }
                        ]);
                    }

                    await member.voice.setChannel(channel.id)
                    usersConnect.set(newState.id, new Date().getTime());

                    await logChannel.send({
                        content: `\`[✅] \`<@${newState.id}>\` создал приватный канал \`<#${channel.id}>\`(${channel.id})\``
                    })
                }
            } else {
                const channel = oldState.guild.channels.cache.get(oldState.channelId);
                const membersInChannel = channel.members.size
                if (channel.parentId === existServer.parent && oldState.channelId !== existServer.privateChannel){
                    if (channel.members){
                        if (membersInChannel === 0){
                            const logChannel = await oldState.guild.channels.cache.get(existServer.logPrivateChannel);
                            await logChannel.send({
                                content: `\`[✅] Приватный канал \`<#${channel.id}>\` был автоматически удален.\``
                            })
                            await channel.delete();
                        }
                    }
                }

                const user = await oldState.guild.members.cache.get(oldState.id);
                if (user.user.bot) return;

                const connectionTime = voiceConnectionTimes.get(oldState.id);

                if (connectionTime){
                    let user;
                    user = await DiscordServersUsers.findOne({ userId: oldState.id, guildId: oldState.guild.id })

                    if(!user){
                        user = await DiscordServersUsers.create({
                            guildId: oldState.guild.id,
                            userId: oldState.id,
                            exp: 0,
                            lvl: 1,
                            voiceTime: 0
                        })
                    }

                    const duration = Date.now() - connectionTime;

                    user.voiceTime += Math.floor(duration);

                    await user.save()

                    voiceConnectionTimes.delete(oldState.id);
                }
            }
        }
    }
}
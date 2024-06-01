const Canvas = require('canvas');
const sharp = require('sharp');
const axios = require('axios');
const { PermissionsBitField } = require('discord.js');

async function createImage(interaction, user, level, exp, voiceTime, server) {
    const canvas = Canvas.createCanvas(700, 250);
    const ctx = canvas.getContext('2d');

    Canvas.registerFont('../fonts/VAG_World.otf', { family: 'VAG World' });
  
    let background;
    try{
        background = await Canvas.loadImage(await convertWebpToPNG(await getImageBuffer(server.profileBackground)))
    } catch(error){
        background = await Canvas.loadImage('../img/background.jpg');
    }
    
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  
    const discordUserAvatar = await user.displayAvatarURL({ format: 'png', size: 512 });
    const avatarBuffer = await getImageBuffer(discordUserAvatar);

    const pngBuffer = await convertWebpToPNG(avatarBuffer);

    const avatarImg = await Canvas.loadImage(pngBuffer);

    const avatarWidth = 150;
    const avatarHeight = 150;

    const avatarX = 25;
    const avatarY = (canvas.height - avatarHeight) / 2;

    const exp_need = 100 * level^1.5

    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarWidth / 2, avatarY + avatarHeight / 2, avatarWidth / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatarImg, avatarX, avatarY, avatarWidth, avatarHeight);
    ctx.restore();
  
    const progressBarWidth = 400;
    const progressBarHeight = 20;
    const progress = exp / exp_need;

    const usernameText = user.username;
    const usernameFontSize = 36;
    const usernameX = avatarX + avatarWidth + 20;
    const usernameY = (avatarHeight - 10) / 2;

    const infoFontSize = 24;
    const infoX = usernameX;
    const infoY = usernameY + usernameFontSize / 2 + 20;
    
    const progressX = avatarX + avatarWidth + 20;
    const progressY = infoY + infoFontSize + 48 ;

    ctx.font = `bold ${usernameFontSize}px "VAG World"`;
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'middle';

    const isMod = interaction.member.permissions.has(PermissionsBitField.All)

    
    ctx.fillText(`${usernameText} ${isMod ? "" : ""}`, usernameX, usernameY);


    ctx.font = `${infoFontSize}px "VAG World"`;
    ctx.fillText(`Уровень: ${level}`, infoX, infoY);
    ctx.fillText(`Опыт: ${Math.floor(exp)} / ${exp_need}`, infoX, infoY + infoFontSize);
    ctx.fillText(`Voice: ${formatTime(voiceTime)}ч.`, infoX, infoY + infoFontSize + 25);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(progressX, progressY, progressBarWidth, progressBarHeight);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(progressX, progressY, progressBarWidth * progress, progressBarHeight);
  
    return canvas.toBuffer();
}

function formatTime(milliseconds) {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

    return hours;
}

async function getImageBuffer(url) {
    const response = await axios.get(url, {
        responseType: 'arraybuffer'
    });
    return Buffer.from(response.data, 'binary');
}

async function convertWebpToPNG(buffer) {
    const pngBuffer = await sharp(buffer)
        .toFormat('png')
        .toBuffer();

    return pngBuffer;
}

module.exports = createImage;
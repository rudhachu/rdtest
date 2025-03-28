const {
    rudhra,
    getJson,
    getUrl,
    mode,
    getBuffer
} = require("../lib/");
const fetch = require('node-fetch');

rudhra({
    pattern: 'insta ?(.*)',
    fromMe: mode,
    desc: 'Download Instagram posts or reels',
    type: 'downloader'
}, async (message, match, client) => {
    match = getUrl(match || message.reply_message.text);
    if (!match) return await message.reply('*Need an Instagram link!*');
    
    try {
        const { result, status } = await getJson('https://api-25ca.onrender.com/api/instagram?url=' + match);
        if (!status || result.length < 1) return await message.reply('*No media found!*');
        
        await message.reply('_Uploading media...⎙_', { quoted: message.data });
        
        for (const url of result) {
            await message.sendFromUrl(url);
        }
    } catch (error) {
        console.error(error);
        await message.reply('*Failed to fetch media.*\n_Please try again later._');
    }
});

rudhra({
    pattern: 'igstory ?(.*)',
    fromMe: mode,
    desc: 'Download Instagram Story',
    type: 'downloader'
}, async (message, match, client) => {
    const storyUrl = match || message.reply_message.text;

    if (!storyUrl) {
        return await message.reply('_Enter an Instagram Story URL!_');
    }

    try {
        let resi = await getJson(`https://api-aswin-sparky.koyeb.app/api/downloader/story?url=${storyUrl}`);
        
        if (!resi || !resi.data || resi.data.length === 0) {
            return await message.reply('_No media found or invalid URL!_');
        }

        await message.reply('_Uploading media...⎙_', { quoted: message.data });

        for (let media of resi.data) {
            if (media?.url) {
                await message.sendFromUrl(media.url, { quoted: message.data });
            } else {
                console.warn('Media object missing URL:', media);
            }
        }
    } catch (error) {
        console.error('Error fetching or sending media:', error);
        await message.reply('_Error fetching media!. Please try again later!_');
    }
});

const { downloadContentFromMessage } = require("@adiwajshing/baileys");
const fs = require("fs").promises;
const { fromBuffer } = require("file-type");
const axios = require("axios");
const path = require("path");
const { writeExifImg, writeExifVid, imageToWebp, videoToWebp } = require("./sticker");

/**
 * Downloads media from a WhatsApp message.
 * @param {Object} message - The message object containing media.
 * @param {string} [pathFile] - Optional file path to save the media.
 * @returns {Promise<Buffer|string>} - Returns media buffer or file path.
 */
async function downloadMedia(message, pathFile) {
    const mimeMap = {
        imageMessage: "image",
        videoMessage: "video",
        stickerMessage: "sticker",
        documentMessage: "document",
        audioMessage: "audio",
    };

    try {
        let type = Object.keys(message)[0];
        let mes = message;

        // Handle different message structures
        if (type === "templateMessage") {
            mes = message.templateMessage.hydratedFourRowTemplate;
            type = Object.keys(mes)[0];
        } else if (type === "interactiveResponseMessage") {
            mes = message.interactiveResponseMessage;
            type = Object.keys(mes)[0];
        } else if (type === "buttonsMessage") {
            mes = message.buttonsMessage;
            type = Object.keys(mes)[0];
        }

        const stream = await downloadContentFromMessage(mes[type], mimeMap[type]);
        const buffer = [];

        for await (const chunk of stream) {
            buffer.push(chunk);
        }

        const mediaBuffer = Buffer.concat(buffer);

        if (pathFile) {
            await fs.writeFile(pathFile, mediaBuffer);
            return pathFile;
        } else {
            return mediaBuffer;
        }
    } catch (error) {
        console.error("Error in downloadMedia:", error);
        throw error;
    }
}

/**
 * Serializes a message and extends functionality.
 * @param {Object} msg - The message object.
 * @param {Object} client - The WhatsApp client instance.
 * @returns {Object} - The enhanced message object.
 */
async function serialize(msg, client) {
    /**
     * Retrieves file data from various sources (Buffer, Base64, URL, or file path).
     * @param {string|Buffer} PATH - File source.
     * @returns {Promise<{ data: Buffer, mime: string, ext: string }>} - File data object.
     */
    client.getFile = async (PATH) => {
        let data;

        if (Buffer.isBuffer(PATH)) {
            data = PATH;
        } else if (/^data:.*?\/.*?;base64,/i.test(PATH)) {
            data = Buffer.from(PATH.split(",")[1], "base64");
        } else if (/^https?:\/\//.test(PATH)) {
            const res = await axios.get(PATH, { responseType: "arraybuffer" });
            data = Buffer.from(res.data, "binary");
        } else {
            try {
                data = await fs.readFile(PATH);
            } catch {
                data = Buffer.alloc(0);
            }
        }

        if (!Buffer.isBuffer(data)) throw new TypeError("Result is not a buffer");

        const type = (await fromBuffer(data)) || { mime: "application/octet-stream", ext: ".bin" };
        return { data, ...type };
    };

    // Add media download function
    msg.download = (pathFile) => downloadMedia(msg.message, pathFile);

    /**
     * Sends an image as a WhatsApp sticker.
     * @param {string} jid - The recipient JID.
     * @param {Buffer} buff - The image buffer.
     * @param {Object} [options] - Sticker metadata options (packname, author).
     */
    client.sendImageAsSticker = async (jid, buff, options = {}) => {
        const buffer = options.packname || options.author ? await writeExifImg(buff, options) : await imageToWebp(buff);
        await client.sendMessage(jid, { sticker: { url: buffer }, ...options }, options);
    };

    /**
     * Sends a video as a WhatsApp sticker.
     * @param {string} jid - The recipient JID.
     * @param {Buffer} buff - The video buffer.
     * @param {Object} [options] - Sticker metadata options (packname, author).
     */
    client.sendVideoAsSticker = async (jid, buff, options = {}) => {
        const buffer = options.packname || options.author ? await writeExifVid(buff, options) : await videoToWebp(buff);
        await client.sendMessage(jid, { sticker: { url: buffer }, ...options }, options);
    };

    return msg;
}

module.exports = { serialize, downloadMedia };

const config = require("../config");
const commands = [];

// Handle command prefix (HANDLERS)
let handler = config.HANDLERS === "null" ? "" : config.HANDLERS;

if (!handler.startsWith("^") && handler !== "") {
    handler = handler.replace("[", "").replace("]", "").replace(/\./g, "[.]");
} else if (/\p{Emoji_Presentation}/gu.test(config.HANDLERS)) {
    handler = "^[.]"; // Default to dot if an emoji is detected
}

config.HANDLERS = handler;

/**
 * Function to register commands
 * @param {Object} info - Command metadata
 * @param {Function} func - Function to execute on command trigger
 * @returns {Object} - Command details
 */
function rudhra(info, func) {
    const types = ["video", "image", "text", "all", "sticker", "audio", "delete"];

    const commandInfo = {
        fromMe: info.fromMe ?? true,
        onlyGroup: info.onlyGroup ?? false,
        desc: info.desc ?? '',
        dontAddCommandList: info.dontAddCommandList ?? false,
        type: info.type ?? false,
        function: func
    };

    if (!info.on && !info.pattern) {
        commandInfo.on = "message";
        commandInfo.fromMe = false;
    } else if (info.on && types.includes(info.on)) {
        commandInfo.on = info.on;
        if (info.pattern) {
            commandInfo.pattern = new RegExp(
                (info.handler === undefined || info.handler ? config.HANDLERS : "") + info.pattern,
                info.flags || ""
            );
        }
    } else if (info.pattern) {
        commandInfo.pattern = new RegExp(
            `^${handler}(${info.pattern.trim()})`,
            "is"
        );
    }

    commands.push(commandInfo);
    return commandInfo;
}

// Extract command prefix
const PREFIX = handler.replace(/[]/g, "").trim() || handler;

// Export module
module.exports = {
    rudhra,
    commands,
    PREFIX,
    mode: config.MODE !== "public"
};

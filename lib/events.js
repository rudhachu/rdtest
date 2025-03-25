const config = require("../config");
const commands = [];
const HANDLERS = config.HANDLERS == "null" ? '' : config.HANDLERS;
let handler = HANDLERS;

if (!handler.startsWith('^') && handler !== '') {
  handler = handler.replace('[', '').replace(']', '').replace(/\./g, '[.]');
} else if (/\p{Emoji_Presentation}/gu.test(HANDLERS)) {
  handler = "^[.]";
}

config.HANDLERS = handler;

function rudhra(info, func) {
  const types = ["video","image","text","all","sticker","audio","delete"];
  const infos = {
    'fromMe': info.fromMe === undefined ? true : info.fromMe,
    'onlyGroup': info.onlyGroup === undefined ? false : info.onlyGroup,
    'desc': info.desc === undefined ? '' : info.desc,
    'dontAddCommandList': info.dontAddCommandList === undefined ? false : info.dontAddCommandList,
    'type': info.type === undefined ? false : info.type,
    'function': func
  };

  if (info.on === undefined && info.pattern === undefined) {
    infos.on = "message";
    infos.fromMe = false;
  } else if (info.on !== undefined && types.includes(info.on)) {
    infos.on = info.on;
    if (info.pattern !== undefined) {
      infos.pattern = new RegExp((info.handler === undefined || info.handler === true ? config.HANDLERS : '') + info.pattern, info.flags !== undefined ? info.flags : '');
    }
  } else {
    infos.pattern = new RegExp((handler.startsWith('^') ? handler : '^' + handler) + '(' + info.pattern + "| " + info.pattern + ')', 'is');
  }

  commands.push(infos);
  return infos;
}
module.exports = {
rudhra: rudhra,
commands: commands,
PREFIX: (config.HANDLERS ? config.HANDLERS.startsWith("^") ? config.HANDLERS.match(/\[(\W*)\]/)?.[1]?.[0] : config.HANDLERS.replace(/\[/g, "").replace(/\]/g, "") : "").trim() || config.HANDLERS,
mode: config.MODE == 'public' ? false : true
}

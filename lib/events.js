const config = require('../config');
let commands = [];
const PREFIX = (!config.HANDLER || config.HANDLER.trim() == 'null' || config.HANDLER.trim() == 'false') ? '' : config.HANDLER.trim();
const mode = config.MODE == 'public' ? false : true;
function rudhra(info, func) {
  let types = ["video","image","text","all","sticker","audio","delete"];
  let infos = {
    type: info["type"] === undefined || undefined ? "others" : info["type"],
    fromMe: info["fromMe"] === undefined ? true : info["fromMe"],
    onlyGroup: info["onlyGroup"] === undefined ? false : info["onlyGroup"],
    desc: info["desc"] === undefined ? "" : info["desc"],
    dontAddCommandList: info["dontAddCommandList"] === undefined ? false : info["dontAddCommandList"],
    function: func
  };
 if (info.on === undefined && info.pattern === undefined) { infos.on = "message"; infos.fromMe = false;} 
  else if (info.on !== undefined && types.includes(info.on)) { infos.on = info.on; if (info.pattern !== undefined) infos.pattern = info.pattern === undefined ? [] : info.pattern;} 
  else infos.pattern = info.pattern === undefined ? [] : info.pattern;
  commands.push(infos);
  return infos;
};

module.exports = { rudhra, commands, mode, PREFIX };

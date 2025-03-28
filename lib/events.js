const commands = [];
const config = require('../config');

const PREFIX =(!config.PREFIX || config.PREFIX == 'false' || config.PREFIX == 'null') ? "" : (config.PREFIX.includes('[') && config.PREFIX.includes(']')) ? config.PREFIX[2] : config.PREFIX.trim();
const mode = (!config.MODE || config.MODE.toLowerCase().trim() != 'public') ? true : false;

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
   if (info.on === undefined && info.pattern === undefined) { infos.on = "message"; infos.fromMe = false;} 
  else if (info.on !== undefined && types.includes(info.on)) { infos.on = info.on; if (info.pattern !== undefined) infos.pattern = info.pattern === undefined ? [] : info.pattern;} 
  else infos.pattern = info.pattern === undefined ? [] : info.pattern;
  commands.push(infos);
  return infos;
};

module.exports = { rudhra, commands, mode, PREFIX };

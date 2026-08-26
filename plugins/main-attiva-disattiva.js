// Plugin AntiNuke by Elixir & 888 staff

import fs from 'fs';

let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  const userName = m.pushName || 'Utente';

  let imgBuffer;
  try {
    imgBuffer = fs.readFileSync('icone/888.jpg');
  } catch {
    imgBuffer = Buffer.from('');
  }

  const fake = {
    key: {
      participants: '0@s.whatsapp.net',
      fromMe: false,
      id: '888Attiva'
    },
    message: {
      locationMessage: {
        name: '🤖 888 BOT • Signal Control',
        jpegThumbnail: imgBuffer.toString('base64'),
        vcard: 'BEGIN:VCARD\nVERSION:3.0\nN:;333;;;\nFN:333\nEND:VCARD'
      }
    },
    participant: '0@s.whatsapp.net'
  };

  if (!m.isGroup) {
    return conn.sendMessage(m.chat, { text: '⚠️ Questo comando può essere usato solo nei gruppi.' }, { quoted: fake });
  }

  if (!isAdmin && !isOwner && !isROwner) {
    return conn.sendMessage(m.chat, { text: '⚠️ *Azione negata:* Comando riservato agli owner.' }, { quoted: fake });
  }

  let isEnable = /true|enable|attiva|(turn)?on|1/i.test(command);
  if (/disable|disattiva|off|0/i.test(command)) isEnable = false;

  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {};
  let chat = global.db.data.chats[m.chat];

 
  if (!args.length || args[0].toLowerCase() === 'antinuke') {
    if (chat.antinuke === isEnable) {
      const statusText = isEnable ? 'risulta già attivo.' : 'risulta già disattivato.';
      return conn.sendMessage(m.chat, { text: `🟨 *AntiNuke* ${statusText}` }, { quoted: fake });
    }

    chat.antinuke = isEnable;
    const statusText = isEnable ? 'ATTIVATO' : 'DISATTIVATO';
    const icon = isEnable ? '🟩' : '🟥';

    const msg = `╭━━━〔 *888 CONTROL* 〕━━━┈\n` +
                `┃ ⚙️ *Funzione:* antinuke\n` +
                `┃ ${icon} *Stato:* *${statusText}*\n` +
                `┃ 👤 *Operatore:* ${userName}\n` +
                `╰━━━━━━━━━━━━━━━━━━━━┈`;

    return conn.sendMessage(m.chat, { text: msg }, { quoted: fake });
  } else {
    return conn.sendMessage(m.chat, { text: `⚠️ Modulo non riconosciuto. Usa *${usedPrefix}${command} antinuke*` }, { quoted: fake });
  }
};

handler.help = ['888 antinuke', 'ds antinuke'];
handler.tags = ['owner'];
handler.command = ['enable', 'disable', 'attiva', '888', 'on', 'off'];

export default handler;

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

  const isEnable = /^(888|enable|attiva|on|1)$/i.test(command);

  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {};
  let chat = global.db.data.chats[m.chat];

  if (args[0] && args[0].toLowerCase() === 'antinuke') {
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
    return conn.sendMessage(m.chat, { text: `⚠️ Usa *${usedPrefix}888 antinuke* per attivare o *${usedPrefix}444 antinuke* per disattivare.` }, { quoted: fake });
  }
};

handler.help = ['888 antinuke', '444 antinuke'];
handler.tags = ['owner'];
handler.command = ['888', '444'];

export default handler;

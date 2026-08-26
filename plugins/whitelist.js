let handler = async (m, { conn, text, command, usedPrefix, args }) => {

    global.db.data.chats = global.db.data.chats || {}
    global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}
    const chat = global.db.data.chats[m.chat]

    if (!Array.isArray(chat.safelist)) {
        chat.safelist = (Array.isArray(chat.whitelist) && chat.whitelist.length) ? chat.whitelist : []
    }

    const cmd = command.toLowerCase()
    const subCmd = args[0] ? args[0].toLowerCase() : ''

    if (cmd === 'safelist' && (!args.length || subCmd === 'list')) {
        if (!chat.safelist.length) {
            return m.reply(
                `╭━━━〔 📑 *SAFELIST GRUPPO* 〕━━━┈\n` +
                `┃ *Bot:* 𝟴𝟴𝟴 𝗕𝗢𝗧\n` +
                `┃ *Stato:* Utenti Autorizzati\n` +
                `┃━━━━━━━━━━━━━━━━━━\n` +
                `┃ ⚠️ _Nessun utente autorizzato in questo gruppo._\n` +
                `╰━━━━━━━━━━━━━━━━━━┈`
            )
        }

        let list = chat.safelist.map(jid => `┃ ⮕ @${jid.split('@')[0]}`).join('\n')
        let caption = `╭━━━〔 📑 *SAFELIST GRUPPO* 〕━━━┈\n` +
                      `┃ *Bot:* 𝟴𝟴𝟴 𝗕𝗢𝗧\n` +
                      `┃ *Stato:* Utenti Autorizzati\n` +
                      `┃━━━━━━━━━━━━━━━━━━\n` +
                      `${list}\n` +
                      `╰━━━━━━━━━━━━━━━━━━┈`

        return conn.sendMessage(m.chat, {
            text: caption,
            mentions: chat.safelist
        }, { quoted: m })
    }

    let action = null
    let targetInput = ''

    if (cmd === 'addsafelist' || (cmd === 'safelist' && subCmd === 'add')) {
        action = 'add'
        targetInput = cmd === 'safelist' ? args.slice(1).join(' ') : text
    } else if (cmd === 'delsafelist' || (cmd === 'safelist' && (subCmd === 'remove' || subCmd === 'del'))) {
        action = 'remove'
        targetInput = cmd === 'safelist' ? args.slice(1).join(' ') : text
    }

    let who = false
    if (m.mentionedJid && m.mentionedJid[0]) {
        who = m.mentionedJid[0]
    } else if (m.quoted && m.quoted.sender) {
        who = m.quoted.sender
    } else if (targetInput) {
        let cleaned = targetInput.replace(/[^0-9]/g, '')
        if (cleaned.length >= 7) {
            who = cleaned + '@s.whatsapp.net'
        }
    }

    if (!action || !who) {
        return m.reply(
            `⚠️ *Uso corretto dei comandi Safelist:*\n\n` +
            `📌 *Visualizzare lista:* _${usedPrefix}safelist_\n` +
            `➕ *Aggiungere utente:* _${usedPrefix}safelist add @tag_ oppure _${usedPrefix}addsafelist @tag_\n` +
            `➖ *Rimuovere utente:* _${usedPrefix}safelist remove @tag_ oppure _${usedPrefix}delsafelist @tag_`
        )
    }

    if (action === 'add') {
        if (chat.safelist.includes(who)) {
            return m.reply('✨ _L\'utente è già presente nella safelist di questo gruppo._')
        }

        chat.safelist.push(who)
        await global.db.write()

        return conn.sendMessage(m.chat, {
            text: `╭━━━〔 ✅ *UTENTE AUTORIZZATO* 〕━━━┈\n` +
                  `┃ 👤 *Utente:* @${who.split('@')[0]}\n` +
                  `┃ 🏰 *Ambito:* Questo Gruppo\n` +
                  `┃━━━━━━━━━━━━━━━━━━\n` +
                  `┃ ⮕ _L'utente è ora esente dai controlli Antinuke._\n` +
                  `╰━━━━━━━━━━━━━━━━━━┈`,
            mentions: [who]
        }, { quoted: m })
    }

    if (action === 'remove') {
        if (!chat.safelist.includes(who)) {
            return m.reply('❌ _L\'utente non è presente nella safelist di questo gruppo._')
        }

        chat.safelist = chat.safelist.filter(jid => jid !== who)
        await global.db.write()

        return conn.sendMessage(m.chat, {
            text: `╭━━━〔 🗑️ *UTENTE RIMOSSO* 〕━━━┈\n` +
                  `┃ 👤 *Utente:* @${who.split('@')[0]}\n` +
                  `┃ 🏰 *Ambito:* Questo Gruppo\n` +
                  `┃━━━━━━━━━━━━━━━━━━\n` +
                  `┃ ⮕ _L'utente è stato rimosso dalla safelist locale._\n` +
                  `╰━━━━━━━━━━━━━━━━━━┈`,
            mentions: [who]
        }, { quoted: m })
    }
}

handler.help = ['safelist', 'addsafelist', 'delsafelist']
handler.tags = ['owner', 'group']
handler.command = /^(safelist|addsafelist|delsafelist)$/i

handler.owner = true
handler.group = true

export default handler
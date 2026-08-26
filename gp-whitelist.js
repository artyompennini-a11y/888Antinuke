let handler = async (m, { conn, text, command, usedPrefix, args }) => {

    // Inizializzazione database chat
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
    if (!global.db.data.chats[m.chat].whitelist) global.db.data.chats[m.chat].whitelist = []

    let chat = global.db.data.chats[m.chat]
    let who;

    // LISTA SAFELIST
    if (command === 'safelist' && (!args || args.length === 0 || (args.length === 1 && args[0] === 'list'))) {
        let list = chat.whitelist.map(jid => `┃  ⮕ @${jid.split('@')[0]}`).join('\n')
        let caption = `╭━━━〔 📑 *SAFELIST GRUPPO* 〕━━━┈
┃ *Bot:* 𝟴𝟴𝟴 𝗕𝗢𝗧
┃ *Stato:* Utenti Autorizzati
┃━━━━━━━━━━━━━━━━━━
${list ? list : '┃  ⚠️ _Nessun utente autorizzato in questo gruppo._'}
╰━━━━━━━━━━━━━━━━━━┈`.trim()
        return m.reply(caption, null, { mentions: conn.parseMention(list) })
    }

    // Determinazione azione
    let action = null
    if (command === 'safelist' && args && args.length >= 2) {
        action = args[0].toLowerCase()

        let targetText = args.slice(1).join(' ')
        who = m.mentionedJid[0]
            ? m.mentionedJid[0]
            : m.quoted
                ? m.quoted.sender
                : targetText
                    ? targetText.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
                    : false

    } else if (command === 'addsafelist') {
        action = 'add'
        who = m.mentionedJid[0]
            ? m.mentionedJid[0]
            : m.quoted
                ? m.quoted.sender
                : text
                    ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
                    : false

    } else if (command === 'delsafelist') {
        action = 'remove'
        who = m.mentionedJid[0]
            ? m.mentionedJid[0]
            : m.quoted
                ? m.quoted.sender
                : text
                    ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
                    : false
    }

    if (!who) {
        return m.reply(
            `⚠️ *Uso corretto:* _${usedPrefix}safelist add @tag_ o _${usedPrefix}addsafelist @tag_`
        )
    }

    // AGGIUNTA
    if (action === 'add' || command === 'addsafelist') {
        if (chat.whitelist.includes(who)) {
            return m.reply('✨ _L\'utente è già presente nella safelist di questo gruppo._')
        }

        chat.whitelist.push(who)
        await global.db.write()

        await conn.sendMessage(m.chat, {
            text: `╭━━━〔 ✅ *UTENTE AUTORIZZATO* 〕━━━┈
┃ 👤 *Utente:* @${who.split('@')[0]}
┃ 🏰 *Ambito:* Questo Gruppo
┃━━━━━━━━━━━━━━━━━━
┃ ⮕ _L'utente è ora esente dai controlli Antinuke._
╰━━━━━━━━━━━━━━━━━━┈`,
            contextInfo: { mentionedJid: [who] }
        }, { quoted: m })

        return
    }

    // RIMOZIONE
    if (action === 'remove' || command === 'delsafelist') {
        if (!chat.whitelist.includes(who)) {
            return m.reply('❌ _L\'utente non è presente nella safelist di questo gruppo._')
        }

        chat.whitelist = chat.whitelist.filter(jid => jid !== who)
        await global.db.write()

        await conn.sendMessage(m.chat, {
            text: `╭━━━〔 🗑️ *UTENTE RIMOSSO* 〕━━━┈
┃ 👤 *Utente:* @${who.split('@')[0]}
┃ 🏰 *Ambito:* Questo Gruppo
┃━━━━━━━━━━━━━━━━━━
┃ ⮕ _L'utente è stato rimosso dalla safelist locale._
╰━━━━━━━━━━━━━━━━━━┈`,
            contextInfo: { mentionedJid: [who] }
        }, { quoted: m })

        return
    }
}

handler.help = ['addsafelist', 'delsafelist', 'safelist']
handler.tags = ['owner', 'group']
handler.command = /^(addsafelist|delsafelist|safelist)$/i

handler.owner = true   // SOLO OWNER DEL BOT
handler.group = true   // Solo nei gruppi

export default handler

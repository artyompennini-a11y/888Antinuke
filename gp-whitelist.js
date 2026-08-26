let handler = async (m, { conn, text, command, usedPrefix, args }) => {

    // Inizializzazione database chat
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
    if (!global.db.data.chats[m.chat].whitelist) global.db.data.chats[m.chat].whitelist = []

    let chat = global.db.data.chats[m.chat]
    let who = false
    let action = null

    const cmd = command.toLowerCase()

    // 1. VISUALIZZAZIONE LISTA (.safelist oppure .safelist list)
    if (cmd === 'safelist' && (!args.length || args[0].toLowerCase() === 'list')) {
        let list = chat.whitelist.map(jid => `┃  ⮕ @${jid.split('@')[0]}`).join('\n')
        let caption = `╭━━━〔 📑 *SAFELIST GRUPPO* 〕━━━┈
┃ *Bot:* 𝟴𝟴𝟴 𝗕𝗢𝗧
┃ *Stato:* Utenti Autorizzati
┃━━━━━━━━━━━━━━━━━━
${list ? list : '┃  ⚠️ _Nessun utente autorizzato in questo gruppo._'}
╰━━━━━━━━━━━━━━━━━━┈`.trim()
        return m.reply(caption, null, { mentions: conn.parseMention(list) })
    }

    // 2. DETERMINAZIONE AZIONE (ADD / REMOVE)
    if (cmd === 'addsafelist' || (cmd === 'safelist' && args[0]?.toLowerCase() === 'add')) {
        action = 'add'
    } else if (cmd === 'delsafelist' || (cmd === 'safelist' && (args[0]?.toLowerCase() === 'remove' || args[0]?.toLowerCase() === 'del'))) {
        action = 'remove'
    }

    // 3. ESTRAZIONE TARGET (Chi deve essere aggiunto/rimosso)
    if (cmd === 'safelist' && (args[0]?.toLowerCase() === 'add' || args[0]?.toLowerCase() === 'remove' || args[0]?.toLowerCase() === 'del')) {
        let targetText = args.slice(1).join(' ')
        who = m.mentionedJid[0]
            ? m.mentionedJid[0]
            : m.quoted
                ? m.quoted.sender
                : targetText
                    ? targetText.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
                    : false
    } else {
        who = m.mentionedJid[0]
            ? m.mentionedJid[0]
            : m.quoted
                ? m.quoted.sender
                : text
                    ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
                    : false
    }

    // Validazione target
    if (!action || !who || who === '@s.whatsapp.net') {
        return m.reply(
            `⚠️ *Uso corretto:*\n` +
            `• _${usedPrefix}safelist_ (mostra lista)\n` +
            `• _${usedPrefix}safelist add @tag_\n` +
            `• _${usedPrefix}safelist remove @tag_\n` +
            `• _${usedPrefix}addsafelist @tag_\n` +
            `• _${usedPrefix}delsafelist @tag_`
        )
    }

    // 4. ESECUZIONE AGGIUNTA
    if (action === 'add') {
        if (chat.whitelist.includes(who)) {
            return m.reply('✨ _L\'utente è già presente nella safelist di questo gruppo._')
        }

        chat.whitelist.push(who)
        await global.db.write()

        return conn.sendMessage(m.chat, {
            text: `╭━━━〔 ✅ *UTENTE AUTORIZZATO* 〕━━━┈
┃ 👤 *Utente:* @${who.split('@')[0]}
┃ 🏰 *Ambito:* Questo Gruppo
┃━━━━━━━━━━━━━━━━━━
┃ ⮕ _L'utente è ora esente dai controlli Antinuke._
╰━━━━━━━━━━━━━━━━━━┈`,
            contextInfo: { mentionedJid: [who] }
        }, { quoted: m })
    }

    // 5. ESECUZIONE RIMOZIONE
    if (action === 'remove') {
        if (!chat.whitelist.includes(who)) {
            return m.reply('❌ _L\'utente non è presente nella safelist di questo gruppo._')
        }

        chat.whitelist = chat.whitelist.filter(jid => jid !== who)
        await global.db.write()

        return conn.sendMessage(m.chat, {
            text: `╭━━━〔 🗑️ *UTENTE RIMOSSO* 〕━━━┈
┃ 👤 *Utente:* @${who.split('@')[0]}
┃ 🏰 *Ambito:* Questo Gruppo
┃━━━━━━━━━━━━━━━━━━
┃ ⮕ _L'utente è stato rimosso dalla safelist locale._
╰━━━━━━━━━━━━━━━━━━┈`,
            contextInfo: { mentionedJid: [who] }
        }, { quoted: m })
    }
}

handler.help = ['safelist', 'addsafelist', 'delsafelist']
handler.tags = ['owner', 'group']
handler.command = ['safelist', 'addsafelist', 'delsafelist']

handler.owner = true   // Solo Owner del Bot
handler.group = true   // Solo nei gruppi

export default handler

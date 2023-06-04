import dotenv from 'dotenv';
dotenv.config();
import TelegramBot from 'node-telegram-bot-api';
import { Message } from "./types.js";
import { fetchFeeds, addKeyword } from './fetchFeeds.js';

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN as string, { polling: true });

bot.on("polling_error", (msg) => console.log(msg));
bot.on('message', async (msg: Message) => {
  const chatId = msg.chat.id;
  const telegram_user_id = msg.from?.id ?? 0;
  const telegram_username = msg.from?.username ?? '';
  const first_name = msg.from?.first_name ?? '';


  let text = msg.text ?? '';

  if (text === '/getId') {
    sendReply(chatId, `${chatId}`);
    console.log(msg);
  }

  if (text === '/run') {
    fetchFeeds();
  }

});


// =====================
// 
// CODE FOR COMMANDS
// 
// =====================

const addCommand = /^\/add\b(.*)/;
bot.onText(addCommand, (msg, match) => {
  const chatId = msg.chat.id;

  if (chatId === Number(process.env.GROUP_ID)) {
    if (!match) {
      // Handle the case when match is null, probably log an error message.
      console.error('No match found');
      return;
    }

    const command = match[0].split(" ", 1)[0];
    const rawKeywords = match[1];

    if (!rawKeywords) {
      sendReply(chatId, `<pre>Ik heb een keyword nodig.</pre>`);
    } else {
      const keywords = rawKeywords.trim().split(/,\s*/);
      keywords.forEach(async (keyword) => {
        await addKeyword(keyword);
      });
    }
  }
});


// =====================
// 
// HELPER FUNCTIONS
// 
// =====================

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendReply(chatId: number, msg: string) {
  return bot.sendMessage(chatId, msg, { parse_mode: 'HTML' });
}

export { bot, sendReply, delay };
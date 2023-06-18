import dotenv from 'dotenv';
dotenv.config();
import TelegramBot from 'node-telegram-bot-api';
import { Message } from "./types.js";
import { scanFeeds, addKeywords, toggleFetchMethod, deleteAllArticles, listAllKeywords, deleteKeyword } from './fetchFeeds.js';
import { Article, Keyword } from './database.js';

const ALLOWED_CHAT_IDS = [
  Number(process.env.GROUP_ID_IDB),
  Number(process.env.GROUP_ID_MINE),
  Number(process.env.GROUP_ID_FANO),
  Number(process.env.GROUP_ID_OTHER)
];

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN as string, { polling: true });

bot.on("polling_error", (msg) => console.log(msg));
bot.on('message', async (msg: Message) => {
  const chatId = msg.chat.id;
  let text = msg.text ?? '';

  if (text === '/getId') {
    sendReply(chatId, `${chatId}`);
    console.log(msg);
  }


  if (ALLOWED_CHAT_IDS.includes(chatId)) {
    if (text === '/list' || text === '/list@su_news_bot') {
      listAllKeywords(chatId);
    }
  } else {
    // sendReply(chatId, `<pre>you do not have access to this feature. to request access contact</pre> @ramirodotme`)
  }

  if (chatId === Number(process.env.GROUP_ID_ADMIN)) {
    if (text === '/deleteAllArticles') {
      deleteAllArticles();
    }

    if (text === '/toggle') {
      toggleFetchMethod();
    }

    if (text === '/run') {
      scanFeeds();
    }

  }

});


// =====================
// 
// CODE FOR COMMANDS
// 
// =====================

// add keywords command
const addCommand = /^\/add\b(.*)/;
bot.onText(addCommand, (msg, match) => {
  const chatId = msg.chat.id;

  if (ALLOWED_CHAT_IDS.includes(chatId)) {
    if (!match) {
      // Handle the case when match is null, probably log an error message.
      console.error('No match found');
      return;
    }

    const command = match[0].split(" ", 1)[0];
    let rawKeywords = match[1];

    // Check if the command is '/add@su_news_bot' without any keyword
    if (rawKeywords && (rawKeywords.trim() === '@su_news_bot' || rawKeywords.trim() === '@ramiro_tester_bot')) {
      rawKeywords = '';
    }

    if (!rawKeywords) {
      sendReply(chatId, `Please enter keyword(s) after the /add command.\n\nExample:\n\n/add someKeyword`);
    } else {
      const keywords = rawKeywords.trim().split(/,\s*/);

      console.log(keywords);

      addKeywords(keywords, chatId);

      // keywords.forEach(async (keyword) => {
      //   await addKeywords(keyword, chatId);
      // });

    }
  }
});

// delete keywords command
const delCommand = /^\/delete\b(.*)/;
bot.onText(delCommand, (msg, match) => {
  const chatId = msg.chat.id;

  if (ALLOWED_CHAT_IDS.includes(chatId)) {
    if (!match) {
      // Handle the case when match is null, probably log an error message.
      console.error('No match found');
      return;
    }

    const command = match[0].split(" ", 1)[0];
    let rawKeywords = match[1];

    // Check if the command is '/delete@su_news_bot' without any keyword
    if (rawKeywords && (rawKeywords.trim() === '@su_news_bot' || rawKeywords.trim() === '@ramiro_tester_bot')) {
      rawKeywords = '';
    }

    if (!rawKeywords) {
      sendReply(chatId, `Please enter keyword(s) after the /delete command.\n\nExample:\n\n/delete someKeyword`);
    } else {
      const keywords = rawKeywords.trim().split(/,\s*/);

      console.log(keywords);

      deleteKeyword(keywords, chatId);

      // keywords.forEach(async (keyword) => {
      //   await addKeywords(keyword, chatId);
      // });

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
  return bot.sendMessage(chatId, msg, { parse_mode: 'HTML', disable_web_page_preview: false });
}

export { bot, sendReply, delay };
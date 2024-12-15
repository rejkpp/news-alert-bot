import dotenv from 'dotenv';
dotenv.config();
import TelegramBot from 'node-telegram-bot-api';
import { Message } from "./types.js";
import { scanFeeds, addKeywords, toggleFetchMethod, deleteAllArticles, listAllKeywords, deleteKeyword } from './fetchFeeds.js';
import { gitUpdate, gitPull, reboot } from './sync.js';
import { Article, Keyword } from './database.js';

const ALLOWED_CHAT_IDS = [
  Number(process.env.GROUP_ID_IDB),
  Number(process.env.GROUP_ID_MINE),
  Number(process.env.GROUP_ID_FANO),
  Number(process.env.GROUP_ID_OTHER)
];

const allFeeds = {
  'https://dwtonline.com/feed/': 'dwtonline',
  'https://www.srherald.com/feed/': 'srherald',
  'https://www.waterkant.net/feed/': 'waterkant',
  'https://www.dbsuriname.com/feed/': 'dbsuriname',
  'https://dagbladdewest.com/feed/': 'dagbladdewest',
  'https://www.starnieuws.com/rss/starnieuws.rss': 'starnieuws',
  'https://www.culturu.com/feed/': 'culturu',
  'https://keynews.sr/feed/': 'keynews',
  'https://gov.sr/feed/': 'gov',
  'https://abcsuriname.com/feed/': 'abcsuriname',
  'https://feeds.feedburner.com/ApintieTV': 'apintie',
  'https://feeds.nos.nl/nosnieuwsalgemeen': 'nosalgemeen',
  'https://feeds.nos.nl/nosnieuwspolitiek': 'nospolitiek',
  'https://politie.sr/feed/': 'politie',
  // 'https://www.imf.org/en/Publications/RSS/': 'imf',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCs-vubxCoIhYeYMuoSRi0hw': 'Stanvaste_Radio',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCQXwqZdA_SCaELZc0zCAJFw': 'limfmsu8307',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCvRijg2ZaG75hlE8v93il5A': 'TRISHULBROADCASTINGNETWORK',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCdWnHfrY2T-Mh5dcFSLhNcw': 'devliegendereporter3350',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCY6TOkRfo9f3tMpPU-2ERZA': 'dtv-express',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCr2ND1I1kb4q3FQogJfU_tw': 'limetvsurinamech26.23',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCz39f4fYNzXYbqAlyclTvWQ': 'ABCRadio-TV',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCA9AEzibiGP_y8UvJXDCeJw': 'ApintieLive',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCz-n78QGdFr8JLTZF3dOSvA': 'STVSJournaal',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCfiwzLy-8yKzIbsmZTzxDgw': 'aljazeeraenglish',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UChqUTb7kYRX8-EiaN3XFrSQ': 'Reuters',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UC6LnqqAXZ3NmrOqIehHXYQA': 'IDBInvestBIDInvest',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCNGpYr7N7jCZbtjcgGqXz2g': 'nytimes',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UC-bbHiTZGWKbsCjpzUfrk6Q': 'jeugdjournaal',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UC5xziMuoFAOpX9mwUVhe2Jw': 'nosop3',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UC76M_0Un9WMpZnEkGmdS5ZA': 'communicatiedienstsuriname1114',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCFnWsY5l_-IuEoyoZoci3AQ': 'NIVSuriname',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UC0r4lw4rfUS2UoVo57e17Xg': 'DeNationaleAssemblee',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCLUHDYiX8iOi7N_bVTEr1zA': 'tropenbossuriname9055',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCvG075gL2lu3NulXuspoftg': 'openbarewerkensuriname9604',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCWmavXPyfoCv9uHOj1dCgPg': 'leerkracht4534',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCuDOIIwB5HhtcxR2u7MwVdg': 'ministerievanonderwijswete439',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCybRbhfYsQVwRH6ymA3_Izw': 'FIBOSEdumediaConnectedSchools',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCspvMaJDuJZ2J1e312R9ndg': 'ministerievanarbeidwerkgel9099',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCFrlkz1r-EDUxxaBA5nTwvg': 'funparamaribo314',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UC6vyDMCCHcgO1bDi6nCehFg': 'wwf-guianas1895',
  // 'https://www.youtube.com/feeds/videos.xml?channel_id=UCxl9JzYJPxGhDzdmfZlJgiQ': 'JoinUN75',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCGwkWczHlZQxm_d8MLDFRbg': 'verenigingeconomistensurin6507',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCWB3Ra7gbog5cDrKxwFWG2A': 'staatsolie2002',
};

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
      scanFeeds(allFeeds);
    }

    if (text === '/sync') {
      gitUpdate();
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

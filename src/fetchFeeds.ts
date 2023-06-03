import dotenv from 'dotenv';
dotenv.config();
import Parser from 'rss-parser';
import { Article, Keyword } from './database.js';
import TelegramBot from 'node-telegram-bot-api';

// const bot = new TelegramBot(process.env.TELEGRAM_TOKEN );
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN as string, { polling: true });

if (!process.env.GROUP_ID) {
  throw new Error('GROUP_ID is not defined in your environment variables');
}
const chatId = process.env.GROUP_ID;

const parser = new Parser();

const feeds = [
  'https://dwtonline.com/feed/',
  'https://www.srherald.com/feed/',
  'https://www.waterkant.net/feed/',
  'https://www.dbsuriname.com/feed/',
  'https://dagbladdewest.com/feed/',
  'https://www.starnieuws.com/rss/starnieuws.rss',
];

async function fetchFeeds() {
  for (const feed of feeds) {
    const feedData = await parser.parseURL(feed);
    for (const item of feedData.items) {
      if (!item.title) {
        continue;
      }

      const [article, created] = await Article.findOrCreate({
        where: { title: item.title },
        defaults: { link: item.link },
      });

      if (created) {
        const keywords = await Keyword.findAll();
        const matchingKeywords = keywords.filter(keyword =>
          (item.title as string).includes(keyword.get('word') as string)
        );

        if (matchingKeywords.length > 0) {
          const keywordStrings = matchingKeywords.map(keywordInstance => keywordInstance.get('word'));
          const message = `${item.title}\n\nKeywords: ${keywordStrings.join(', ')}\n\n${item.link}`;

          // const message = `${item.title}\n\nKeywords: ${matchingKeywords.join(', ')}\n\n${item.link}`;

          // Send message to Telegram group
          bot.sendMessage(chatId, message);
        }

      }
    }
  }
}

export default fetchFeeds;

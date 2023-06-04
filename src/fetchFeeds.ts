import dotenv from 'dotenv';
dotenv.config();
import Parser from 'rss-parser';
import fetch, { RequestInit } from 'node-fetch';
import { Article, Keyword } from './database.js';
import { sendReply } from './tgBot.js';

if (!process.env.GROUP_ID_IDB) {
  throw new Error('GROUP_ID is not defined in your environment variables');
}
const idbGroup = Number(process.env.GROUP_ID_IDB);
const adminGroup = Number(process.env.GROUP_ID_ADMIN);

const parser = new Parser({
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36' }
});

const feeds = [
  'https://dwtonline.com/feed/',
  'https://www.srherald.com/feed/',
  'https://www.waterkant.net/feed/',
  'https://www.dbsuriname.com/feed/',
  'https://dagbladdewest.com/feed/',
  'https://www.starnieuws.com/rss/starnieuws.rss',
];

// Change this value to switch between methods
let useFetch = false;

function toggleFetchMethod() {
  useFetch = !useFetch;
}

async function fetchFeeds() {
  for (const feed of feeds) {
    try {
      console.log(`📀 scanning feed ${feed}`);

      let feedData;


      if (useFetch) {
        // ======================
        // USE FETCH TO GET FEED
        // ======================
        const response = await fetch(feed, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36' }
        });

        if (response.status < 200 || response.status >= 600) {
          console.error(`Non-okay status code ${response.status} for feed ${feed}`);
          continue;
        }

        const text = await response.text();
        feedData = await parser.parseString(text);
      } else {
        // ======================
        // USE PARSER TO GET FEED
        // ======================
        feedData = await parser.parseURL(feed);
      }


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

            // Send message to Telegram group
            await sendReply(idbGroup, message);
          }
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error fetching feed ${feed}: ${error.message}`);
      } else {
        console.error(`Error fetching feed ${feed}: `, error);
      }
    }
  }
}

async function addKeyword(keyword: string, chatId: number) {
  const [newKeyword, created] = await Keyword.findOrCreate({
    where: { word: keyword },
  });

  if (created) {
    console.log(`Keyword ${keyword} added.`);
    const message = `Keyword ${keyword} added.`;
    await sendReply(chatId, message);

  } else {
    console.log(`Keyword ${keyword} already exists.`);
    const message = `Keyword ${keyword} already exists.`;
    await sendReply(chatId, message);
  }
}

export { fetchFeeds, addKeyword, toggleFetchMethod };
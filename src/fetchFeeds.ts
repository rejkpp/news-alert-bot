import dotenv from 'dotenv';
dotenv.config();
import Parser from 'rss-parser';
import fetch, { RequestInit } from 'node-fetch';
import { Article, Keyword } from './database.js';
import { sendReply } from './tgBot.js';
import { Op } from 'sequelize';


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

let useFetch = false;

// this function is to toggle between using node-fetch or rss-parser
function toggleFetchMethod() {
  useFetch = !useFetch;
  let message;
  if (useFetch) {
    message = `fetch on`;
  } else {
    message = `fetch off`;
  }
  sendReply(adminGroup, message)
}

// this function gets the feeds, it scans the feeds, stores new articles in database, finds keyword matches in the title.
async function scanFeeds() {
  for (const feed of feeds) {
    try {
      console.log(`📀 scanning feed ${feed}`);

      let feedData;


      // get the data from each feed and store it as feedData
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


      // boolean flag to track whether any new articles were found in this feed
      let newArticlesFound = false;

      // check each item in the feed
      for (const item of feedData.items) {
        if (!item.title) {
          continue;
        }

        const [article, created] = await Article.findOrCreate({
          where: { title: item.title },
          defaults: { link: item.link },
        });

        // if the item is newly added to the database, search for matching keywords and send to chat
        if (created) {
          newArticlesFound = true; // Set the flag to true as a new article has been found

          const keywords = await Keyword.findAll();
          const matchingKeywords = keywords.filter(keyword => {
            // substring/partial matching
            // (item.title as string).toLowerCase().includes((keyword.get('word') as string).toLowerCase());

            // Split the title into individual words
            const titleWords = (item.title as string).toLowerCase().split(/\s+/);

            // Check if the keyword is in the list of words
            return titleWords.includes((keyword.get('word') as string).toLowerCase());

          });

          if (matchingKeywords.length > 0) {
            // const keywordStrings = matchingKeywords.map(keywordInstance => keywordInstance.get('word'));
            const keywordStrings = [...new Set(matchingKeywords.map(keywordInstance => keywordInstance.get('word')))];
            const message = `${item.title}\n\nKeywords: ${keywordStrings.join(', ')}\n\n${item.link}`;

            // Send message to each unique chatId that has matching keywords
            const uniqueChatIds = [...new Set(matchingKeywords.map(keyword => keyword.get('chatId') as number))];
            for (const chatId of uniqueChatIds) {
              await sendReply(chatId, message);
            }

          }

        }
      }

      // After all articles have been processed, check if the flag is true
      // If it is, send a message to the admin group
      if (newArticlesFound) {
        sendReply(adminGroup, `<pre>✅ ${feed}</pre>`);
      }

    } catch (error) {
      if (error instanceof Error) {
        console.error(`<pre>❌ Error fetching feed ${feed}: ${error.message}</pre>`);
        sendReply(adminGroup, error.message);
      } else {
        console.error(`❌ Error fetching feed ${feed}: `, error);
      }
    }
  }
}

async function addKeywords(keywords: string[], chatId: number) {
  // Iterate over the array of keywords
  for (const keyword of keywords) {
    const [newKeyword, created] = await Keyword.findOrCreate({
      where: { word: keyword, chatId: chatId },
      defaults: { chatId: chatId },
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
}

async function listAllKeywords(chatId: number) {
  const keywords = await Keyword.findAll({
    where: {
      chatId: chatId
    }
  });
  const keywordStrings = keywords.map(keywordInstance => keywordInstance.get('word'));
  // Sort the keywords alphabetically
  keywordStrings.sort();

  const message = `Keywords:\n\n<pre>${keywordStrings.join(`\n`)}</pre>`;

  await sendReply(chatId, message);
  console.log('All keywords sent to chat.');
}

async function deleteKeyword(keywordsToDelete: string[], chatId: number) {
  const result = await Keyword.destroy({
    where: {
      word: {
        [Op.in]: keywordsToDelete
      },
      chatId: chatId
    }
  });

  if (result === 0) {
    console.log(`None of the keywords were found.`);
    let message = `None of the keywords were found.`;
    sendReply(chatId, message);
  } else {
    console.log(`${keywordsToDelete} deleted.`);
    let message = `${keywordsToDelete} deleted.`;
    sendReply(chatId, message);
  }
}

async function deleteAllArticles() {
  await Article.destroy({ where: {} });
  const message = `All articles deleted.`;
  await sendReply(adminGroup, message);

  console.log('All articles deleted.');
}

async function deleteOldArticles() {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  await Article.destroy({
    where: {
      createdAt: {
        [Op.lt]: oneDayAgo
      }
    }
  });
}


export { scanFeeds, addKeywords, toggleFetchMethod, deleteAllArticles, listAllKeywords, deleteKeyword, deleteOldArticles };
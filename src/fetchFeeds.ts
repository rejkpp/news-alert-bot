import dotenv from 'dotenv';
dotenv.config();
import Parser from 'rss-parser';
import fetch, { RequestInit } from 'node-fetch';
import { Article, Keyword } from './database.js';
import { sendReply } from './tgBot.js';
import { Op } from 'sequelize';

// ============
// DEFINE TYPES FOR TYPESCRIPT
// ============

interface Link {
  $: {
    href: string;
  };
}

interface Item {
  link: string | Link[];
}

// ============

const adminGroup = Number(process.env.GROUP_ID_ADMIN);

const parser = new Parser({
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36' }
});

let useFetch = false;

// this function is to toggle between using node-fetch or rss-parser
async function toggleFetchMethod() {
  useFetch = !useFetch;
  let message;
  if (useFetch) {
    message = `fetch on`;
  } else {
    message = `fetch off`;
  }
  await sendReply(adminGroup, message)
}

// this function gets the feeds, it scans the feeds, stores new articles in database, finds keyword matches in the title.
async function scanFeeds(feeds: Record<string, string>) {
  for (const [feed, name] of Object.entries(feeds)) {
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
            return (item.title as string).toLowerCase().includes((keyword.get('word') as string).toLowerCase());

          });

          if (matchingKeywords.length > 0) {
            // Get unique chatIds
            const uniqueChatIds = [...new Set(matchingKeywords.map(keyword => keyword.get('chatId') as number))];

            for (const chatId of uniqueChatIds) {
              // Filter matching keywords for this chatId
              const chatKeywords = matchingKeywords.filter(keyword => keyword.get('chatId') === chatId);

              // Get unique words for this chatId
              const keywordStrings = [...new Set(chatKeywords.map(keywordInstance => keywordInstance.get('word')))];

              // Build and send the message
              const message = `${item.title}\n\nKeywords: ${keywordStrings.join(', ')}\n\n${item.link}`;
              await sendReply(chatId, message);
            }

          }

        }
      }

      // After all articles have been processed, check if the flag is true
      // If it is, send a message to the admin group
      if (newArticlesFound) {
        await sendReply(adminGroup, `<pre>✅ ${name}</pre>`);
      }

    } catch (error) {
      if (error instanceof Error) {
        console.error(`❌ Error fetching feed ${feed}: ${error.message}`);
        let message = `<pre>❌ Error fetching feed ${feed}: ${error.message}</pre>`;
        await sendReply(adminGroup, message);
      } else {
        console.error(`❌ Error fetching feed ${feed}: `, error);
        let message = `<pre>❌ Error fetching feed ${feed}: ${error}</pre>`;
        await sendReply(adminGroup, message);
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

  let message;
  if (keywordStrings.length === 0) {
    message = "None of the keywords were found. Use the /add command to add keywords. Example:\n\n/add someKeyword";
  } else {
    // Sort the keywords alphabetically
    keywordStrings.sort();
    message = `Keywords:\n\n<pre>${keywordStrings.join(`\n`)}</pre>`;
  }

  await sendReply(chatId, message);
  console.log('Keywords sent to chat.');
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

  let message;
  if (result === 0) {
    console.log(`None of the keywords were found.`);
    message = `None of the keywords were found. Use the /list command to check for existing keywords.`;
  } else {
    console.log(`Deleted:\n${keywordsToDelete.join('\n')}`);
    message = `Deleted:\n\n<pre>${keywordsToDelete.join('\n')} </pre>`;
  }

  await sendReply(chatId, message);
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
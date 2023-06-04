import { sequelize } from './database.js';
import { fetchFeeds } from './fetchFeeds.js';
import "./tgBot.js";

sequelize.sync().then(() => {
  console.log('Database sync complete.');

  // setInterval(fetchFeeds, 5 * 60 * 1000); // every 5 minutes
});

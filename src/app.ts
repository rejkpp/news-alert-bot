import { sequelize } from './database.js';
import fetchFeeds from './fetchFeeds.js';

sequelize.sync().then(() => {
  console.log('Database sync complete.');
  
  setInterval(fetchFeeds, 60 * 1000); // every hour
});

import { sequelize } from './database.js';
import { fetchFeeds } from './fetchFeeds.js';
import { CronJob } from 'cron';

import "./tgBot.js";

sequelize.sync().then(() => {
  console.log('Database sync complete.');

  // setInterval(fetchFeeds, 5 * 60 * 1000); // every 5 minutes
});


// schedule for reminders
const remindersJob = new CronJob('*/5 * * * *', async () => {
  fetchFeeds();
}, null, true, "America/Paramaribo");

remindersJob.start();

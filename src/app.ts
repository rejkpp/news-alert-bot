import { sequelize } from './database.js';
import { scanFeeds } from './fetchFeeds.js';
import { CronJob } from 'cron';

import "./tgBot.js";

sequelize.sync().then(() => {
  console.log('Database sync complete.');

  // setInterval(scanFeeds, 5 * 60 * 1000); // every 5 minutes

  // schedule for reminders
  const remindersJob = new CronJob('*/10 * * * *', async () => {
    console.log("✅cron started");
    scanFeeds();
  }, null, true, "America/Paramaribo");

  remindersJob.start();

});



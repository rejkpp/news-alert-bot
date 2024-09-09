import { sequelize } from './database.js';
import { scanFeeds } from './fetchFeeds.js';
import { CronJob } from 'cron';

import "./tgBot.js";

const newsFeeds = {
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
};

const ytFeeds = {
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCs-vubxCoIhYeYMuoSRi0hw': '@Stanvaste_Radio',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCQXwqZdA_SCaELZc0zCAJFw': '@limfmsu8307',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCvRijg2ZaG75hlE8v93il5A': '@TRISHULBROADCASTINGNETWORK',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCdWnHfrY2T-Mh5dcFSLhNcw': '@devliegendereporter3350',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCY6TOkRfo9f3tMpPU-2ERZA': '@dtv-express',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCr2ND1I1kb4q3FQogJfU_tw': '@limetvsurinamech26.23',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCz39f4fYNzXYbqAlyclTvWQ': '@ABCRadio-TV',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCA9AEzibiGP_y8UvJXDCeJw': '@ApintieLive',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCz-n78QGdFr8JLTZF3dOSvA': '@STVSJournaal',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCfiwzLy-8yKzIbsmZTzxDgw': '@aljazeeraenglish',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UChqUTb7kYRX8-EiaN3XFrSQ': '@Reuters',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UC6LnqqAXZ3NmrOqIehHXYQA': '@IDBInvestBIDInvest',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCNGpYr7N7jCZbtjcgGqXz2g': '@nytimes',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UC-bbHiTZGWKbsCjpzUfrk6Q': '@jeugdjournaal',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UC5xziMuoFAOpX9mwUVhe2Jw': '@nosop3',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UC76M_0Un9WMpZnEkGmdS5ZA': '@communicatiedienstsuriname1114',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCFnWsY5l_-IuEoyoZoci3AQ': '@NIVSuriname',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UC0r4lw4rfUS2UoVo57e17Xg': '@DeNationaleAssemblee',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCLUHDYiX8iOi7N_bVTEr1zA': '@tropenbossuriname9055',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCvG075gL2lu3NulXuspoftg': '@openbarewerkensuriname9604',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCWmavXPyfoCv9uHOj1dCgPg': '@leerkracht4534',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCuDOIIwB5HhtcxR2u7MwVdg': '@ministerievanonderwijswete439',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCybRbhfYsQVwRH6ymA3_Izw': '@FIBOSEdumediaConnectedSchools',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCspvMaJDuJZ2J1e312R9ndg': '@ministerievanarbeidwerkgel9099',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCFrlkz1r-EDUxxaBA5nTwvg': '@funparamaribo314',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UC6vyDMCCHcgO1bDi6nCehFg': '@wwf-guianas1895',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCxl9JzYJPxGhDzdmfZlJgiQ': '@JoinUN75',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCGwkWczHlZQxm_d8MLDFRbg': '@verenigingeconomistensurin6507',
  'https://www.youtube.com/feeds/videos.xml?channel_id=UCWB3Ra7gbog5cDrKxwFWG2A': '@staatsolie2002',
};

sequelize.sync().then(() => {
  console.log('Database sync complete.');

  // setInterval(scanFeeds, 5 * 60 * 1000); // every 5 minutes

  // schedule
  const newScanJob = new CronJob('*/12 * * * *', async () => {
    console.log("✅ news cron started");
    scanFeeds(newsFeeds);
  }, null, true, "America/Paramaribo");

  const ytScanJob = new CronJob('17,38,56 * * * *', async () => {
    console.log("✅ yt cron started");
    scanFeeds(ytFeeds);
  }, null, true, "America/Paramaribo");

  newScanJob.start();
  ytScanJob.start();

});



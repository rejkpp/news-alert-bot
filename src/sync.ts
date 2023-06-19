import { spawn } from 'node:child_process';
import { delay, sendReply } from './tgBot.js';

const adminGroup = Number(process.env.GROUP_ID_ADMIN);

async function gitUpdate() {
    gitPull();
    await delay(2000);
    build();
    await delay(4000);
    reboot();
}

async function gitAdd() {
    const execGitAdd = spawn('git', ['add','data/']);

    execGitAdd.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
      sendReply(adminGroup,'✅ git add data/');
    });

}

async function gitCommit() {
    const execGitCommit = spawn('git', ['commit','-m','comment here.']);

    execGitCommit.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
      sendReply(adminGroup, `<pre>✅ ${data}</pre>`);
    });

}

async function gitPush() {
    const execGitPush = spawn('git', ['push','origin','main']);

    execGitPush.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
      sendReply(adminGroup, `✅ data files updated`);
    });

}

async function gitPull() {
    const execGitPull = spawn('git', ['pull']);

    execGitPull.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
      sendReply(adminGroup, `<pre>${data}</pre>`);
    });

    await delay(2000);
    sendReply(adminGroup, `<pre>✅ sync with github repo finished</pre>`);
    await delay(3000);
    reboot();
}

async function build() {
  const execReboot = spawn('yarn', ['run','build']);

  execReboot.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });
  sendReply(adminGroup, `<pre>✅ app rebooted</pre>`);

}

async function reboot() {
  const execReboot = spawn('pm2', ['restart','7']);

  execReboot.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });
  sendReply(adminGroup, `<pre>✅ app rebooted</pre>`);

}

export { gitUpdate, gitPull, build, reboot };

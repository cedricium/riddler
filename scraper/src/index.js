const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const puppeteer = require('puppeteer');

/**
 * Resources:
 *  + https://codeburst.io/a-guide-to-automating-scraping-the-web-with-javascript-chrome-puppeteer-node-js-b18efb9e9921
 *  + https://medium.com/the-z/having-fun-with-puppeteer-js-5a744babaf0a
 *  + https://gist.github.com/ZeroX-DG/5fadc377fb19f19fada40a6187006425#file-ieltcuecardscrapper-js
 */
const scrapeRiddles = async () => {
  const BASE_URL = 'https://riddles.fyi/';
  const PAGINATION_PATH = 'page/'
  const MAX_PAGES = 25;

  const browser = await puppeteer.launch({
    headless: true
  });
  const page = await browser.newPage();

  let data = [];
  for (let sitePage = 1; sitePage < MAX_PAGES; sitePage++) {
    await page.goto(`${BASE_URL}${PAGINATION_PATH}${sitePage}`, {
      waitUntil: 'networkidle2',
      timeout: 0
    });

    const riddles = await page.evaluate(() => {
      let riddles = [];
      let items = document.querySelectorAll('article.post');
      items.forEach((item) => {
        if (item.querySelector('h2.entry-title') && item.querySelector('div.su-spoiler-content')) {
          let riddle = item.querySelector('h2.entry-title').textContent;
          let answer = item.querySelector('div.su-spoiler-content').textContent;
          const riddleObj = {riddle, answer};
          riddles.push(riddleObj);
        }
      });
      return riddles;
    });

    Array.prototype.push.apply(data, riddles);
  }

  await page.close();
  await browser.close();
  return data;
};

const createJSONFile = (data) => {
  const JSON_DIR = path.join(__dirname, '..', 'data');
  const json = JSON.stringify(data, null, 2);
  if (!fs.existsSync(JSON_DIR)) {
    mkdirp.sync(JSON_DIR);
  }
  fs.writeFileSync(path.join(JSON_DIR, 'riddles-fyi.json'), json, {flag: 'w', encoding: 'utf8'});
};

scrapeRiddles().then((results) => {
  // create json file with results
  createJSONFile(results);
});

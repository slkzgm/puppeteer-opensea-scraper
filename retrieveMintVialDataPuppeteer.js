const fs = require('fs');
const { performance } = require('perf_hooks');
const puppeteer = require('puppeteer-extra');
const path = require("path");
const stealth = require('puppeteer-extra-plugin-stealth')();
const config = require('./config.json');

const selectors = {
  box: {
    dnaBox: '#Header\\ trait-filter-DNA',
    humanBox: '#Human',
    robotBox: '#Robot',
    demonBox: '#Demon',
    angelBox: '#Angel',
    reptileBox: '#Reptile',
    undeadBox: '#Undead',
    murakamiBox: '#Murakami',
    alienBox: '#Alien'
  },
  buyNow: '#Buy_Now > div > span > input',
  firstItem: '#main > div > div > div.sc-1xf18x6-0.sc-17boio7-0.hnKAL.dpgtT > div > div.sc-1po1rbf-5.imKjCb > div.sc-1xf18x6-0.cPWSa-d.AssetSearchView--main > div.AssetSearchView--results.collection--results.AssetSearchView--results--phoenix > div.sc-1xf18x6-0.haVRLx.AssetsSearchView--assets > div.fresnel-container.fresnel-greaterThanOrEqual-sm > div > div > div:nth-child(1) > div > article > a > div.sc-1xf18x6-0.sc-dw611d-0.hocRfR.bhhGea',
  firstListingPrice: '#main > div > div > div.sc-1xf18x6-0.sc-17boio7-0.hnKAL.dpgtT > div > div.sc-1po1rbf-5.imKjCb > div.sc-1xf18x6-0.cPWSa-d.AssetSearchView--main > div.AssetSearchView--results.collection--results.AssetSearchView--results--phoenix > div.sc-1xf18x6-0.haVRLx.AssetsSearchView--assets > div.fresnel-container.fresnel-greaterThanOrEqual-sm > div > div > div:nth-child(1) > div > article > a > div.sc-1xf18x6-0.sc-dw611d-0.hocRfR.bhhGea > div.sc-1xf18x6-0.sc-1twd32i-0.sc-1wwz3hp-0.xGokL.kKpYwv.kuGBEl > div > div > div.sc-1a9c68u-0.jdhmum.Price--main.sc-1rzu7xl-0.eYVhXE > div.sc-7qr9y8-0.iUvoJs.Price--amount',
  floorPrice: '#main > div > div > div.sc-1xf18x6-0.sc-17boio7-0.hnKAL.dpgtT > div > div.sc-1xf18x6-0.haVRLx > div > div.fresnel-container.fresnel-greaterThanOrEqual-md > div > div:nth-child(8) > a > div > span.sc-1xf18x6-0.sc-1aqfqq9-0.haVRLx.cUPmoY.styledPhoenixText > div',
  noItems: '#main > div > div > div.sc-1xf18x6-0.sc-z0wxa3-0.hnKAL.hWJuuu > div > div.sc-1po1rbf-6.bUKivE > div.sc-1xf18x6-0.cPWSa-d.AssetSearchView--main > div.AssetSearchView--results.collection--results.AssetSearchView--results--phoenix > div.sc-ixw4tc-0.kyBdWA',
  supply: '#main > div > div > div.sc-1xf18x6-0.sc-17boio7-0.hnKAL.dpgtT > div > div.sc-1po1rbf-5.imKjCb > div.sc-1xf18x6-0.cPWSa-d.AssetSearchView--main > div.AssetSearchView--results.collection--results.AssetSearchView--results--phoenix > div.fresnel-container.fresnel-greaterThanOrEqual-md.sc-1po1rbf-1.hsgVfN > div > div > p',
};
let cloneX = {
  floorPrice: 0,
  supply: 0,
  traits: {
    human: {
      floorPrice: 0,
      supply: 0,
      supplyListed: 0
    },
    robot: {
      floorPrice: 0,
      supply: 0,
      supplyListed: 0
    },
    demon: {
      floorPrice: 0,
      supply: 0,
      supplyListed: 0
    },
    angel: {
      floorPrice: 0,
      supply: 0,
      supplyListed: 0
    },
    reptile: {
      floorPrice: 0,
      supply: 0,
      supplyListed: 0
    },
    undead: {
      floorPrice: 0,
      supply: 0,
      supplyListed: 0
    },
    murakami: {
      floorPrice: 0,
      supply: 0,
      supplyListed: 0
    },
    alien: {
      floorPrice: 0,
      supply: 0,
      supplyListed: 0
    },
  }
};
let mintVial = {
  floorPrice: 0
};
const timeout = config.timeout;
let errors = 0;

const retrieveSupply = async (page) => {
  return await page.$eval(selectors.supply, e => parseInt(e.textContent
    .replace(" ", "")
    .replace(",", ""))
  );
}

const retrieveFirstListingPrice = async (page) => {
  return await page.$eval(selectors.firstListingPrice, e => parseFloat(e.textContent));
}

const toClick = async (page, selector) => {
  try {
    await page.click(selector);
    await page.waitForSelector(selectors.firstItem, {timeout});
  } catch (e) {
    console.log(`First listing not found for ${selector} on ${page.url()} check for "no items"`);
    console.log(e);
    await page.waitForSelector(selectors.noItems, {timeout: timeout / 2});
  }
}

const retrieveTraitsData = async (page, selector, data) => {
  try {
    await toClick(page, selector);
    data.supply = await retrieveSupply(page);
    await toClick(page, selectors.buyNow);
    data.supplyListed = await retrieveSupply(page);
    if (data.supplyListed > 0)
      data.floorPrice = await retrieveFirstListingPrice(page);
    else
      data.floorPrice = 0;
    await toClick(page, selector);
    await toClick(page, selectors.buyNow);
  } catch (err) {console.log(`selector: ${selector} not found.`)}
}

const retrieveMintVialData = async (browser) => {
  try {
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({'Accept-Language': 'en'});
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/78.0.3904.108 Chrome/78.0.3904.108 Safari/537.36');

    await page.goto('https://opensea.io/collection/clonex-mintvial');
    await page.waitForSelector(selectors.floorPrice, {timeout});
    mintVial.floorPrice = await page.$eval(selectors.floorPrice, e => parseFloat(e.textContent));
    await page.close();
  } catch (err) {
    console.log(`Error while trying to access MintVial data: ${err}`);
    errors += 1;
  }
}

const retrieveCloneXData = async (browser) => {
  try {
    const collectionSlug = 'clonex';
    const url = `https://opensea.io/collection/${collectionSlug}?search[sortAscending]=true&search[sortBy]=PRICE`;
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({'Accept-Language': 'en'});
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/78.0.3904.108 Chrome/78.0.3904.108 Safari/537.36');

    await page.goto(url);
    await page.waitForSelector(selectors.floorPrice, {timeout});
    cloneX.floorPrice = await page.$eval(selectors.floorPrice, e => parseFloat(e.textContent));
    cloneX.supply = await retrieveSupply(page);
    await toClick(page, selectors.box.dnaBox);
    await retrieveTraitsData(page, selectors.box.humanBox, cloneX.traits.human);
    await retrieveTraitsData(page, selectors.box.robotBox, cloneX.traits.robot);
    await retrieveTraitsData(page, selectors.box.demonBox, cloneX.traits.demon);
    await retrieveTraitsData(page, selectors.box.angelBox, cloneX.traits.angel);
    await retrieveTraitsData(page, selectors.box.reptileBox, cloneX.traits.reptile);
    await retrieveTraitsData(page, selectors.box.undeadBox, cloneX.traits.undead);
    await retrieveTraitsData(page, selectors.box.murakamiBox, cloneX.traits.murakami);
    await retrieveTraitsData(page, selectors.box.alienBox, cloneX.traits.alien);
    await page.close();
  } catch (err) {
    // console.log(err);
    console.log(`Error while trying to access CloneX data: ${err}`);
    errors += 1;
  }
}

const retrieveData = async () => {
  const start = performance.now();
  puppeteer.use(stealth);
  const browser = await puppeteer.launch({
    headless: config.headless,
    defaultViewport: {
      width: 1200,
      height: 800
    },
    args: config.proxyEnabled ? [`--proxy-server=${config.proxyUrl}:${config.proxyPort}`] : ['']
  });
  const page = await browser.newPage();
  if (config.proxyEnabled) {
    await page.authenticate({
      username: config.proxy.username,
      password: config.proxy.password
    });
  }
  await page.goto('https://showmyip.com');
  const ip = await page.$eval('#ipv4', e => e.textContent);
  await page.close();
  console.log(`Script started using ${ip}...`);
  let data = {};

  if (fs.existsSync('./data/mintVialData.json'))
    data = JSON.parse(fs.readFileSync('./data/mintVialData.json'));
  else
    data.lastSuccessfullUpdate = 0;

  errors = 0;
  await Promise.all([
    retrieveMintVialData(browser),
    retrieveCloneXData(browser)
  ]);
  await browser.close();
  console.log(performance.now() - start);
  return ({
    cloneX,
    mintVial,
    lastUpdate: Date.now(),
    lastSuccessfullUpdate: errors >= 1 ? data.lastSuccessfullUpdate : Date.now()
  });
}

const updateJSON = async () => {
  const data = await retrieveData();
  const json = JSON.stringify(data);
  const dataDirectory = path.join(process.cwd(), 'data');
  const filename = '/mintVialData.json';

  if (errors <= config.maxErrorsForUpdate)
    fs.writeFile(dataDirectory + filename, json, () => console.log(`${filename} updated.`));
  else {
    console.log(`${filename} not updated.`);
    if (config.proxyEnabled) {
      console.log('Trying one more time');
      await updateJSON();
    }
  }
}

(async () => {
  await updateJSON();
})();

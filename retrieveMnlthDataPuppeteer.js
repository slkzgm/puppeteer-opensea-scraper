const fs = require('fs');
const { performance } = require('perf_hooks');
const puppeteer = require('puppeteer-extra');
const path = require("path");
const stealth = require('puppeteer-extra-plugin-stealth')();
const config = require('./config.json');

const selectors = {
  box: {
    vialBoxDunk: '#Header\\ trait-filter-VIAL',
    equippedBox: '#EQUIPPED',
    dnaBox: '#Header\\ trait-filter-DNA',
    humanBox: '#HUMAN',
    robotBox: '#ROBOT',
    demonBox: '#DEMON',
    angelBox: '#ANGEL',
    reptileBox: '#REPTILE',
    undeadBox: '#UNDEAD',
    murakamiBox: '#MURAKAMI',
    alienBox: '#ALIEN'
  },
  buyNow: '#Buy_Now > div > span > input',
  firstItem: '#main > div > div > div.sc-1xf18x6-0.sc-17boio7-0.hnKAL.dpgtT > div > div.sc-1po1rbf-5.imKjCb > div.sc-1xf18x6-0.cPWSa-d.AssetSearchView--main > div.AssetSearchView--results.collection--results.AssetSearchView--results--phoenix > div.sc-1xf18x6-0.haVRLx.AssetsSearchView--assets > div.fresnel-container.fresnel-greaterThanOrEqual-sm > div > div > div:nth-child(1) > div > article > a > div.sc-1xf18x6-0.sc-dw611d-0.hocRfR.bhhGea',
  firstListingPrice: '#main > div > div > div.sc-1xf18x6-0.sc-17boio7-0.hnKAL.dpgtT > div > div.sc-1po1rbf-5.imKjCb > div.sc-1xf18x6-0.cPWSa-d.AssetSearchView--main > div.AssetSearchView--results.collection--results.AssetSearchView--results--phoenix > div.sc-1xf18x6-0.haVRLx.AssetsSearchView--assets > div.fresnel-container.fresnel-greaterThanOrEqual-sm > div > div > div:nth-child(1) > div > article > a > div.sc-1xf18x6-0.sc-dw611d-0.hocRfR.bhhGea > div.sc-1xf18x6-0.sc-1twd32i-0.sc-1wwz3hp-0.xGokL.kKpYwv.kuGBEl > div > div > div.sc-1a9c68u-0.jdhmum.Price--main.sc-1rzu7xl-0.eYVhXE > div.sc-7qr9y8-0.iUvoJs.Price--amount',
  floorPrice: '#main > div > div > div.sc-1xf18x6-0.sc-17boio7-0.hnKAL.dpgtT > div > div.sc-1xf18x6-0.haVRLx > div > div.fresnel-container.fresnel-greaterThanOrEqual-md > div > div:nth-child(8) > a > div > span.sc-1xf18x6-0.sc-1aqfqq9-0.haVRLx.cUPmoY.styledPhoenixText > div',
  noItems: '#main > div > div > div.sc-1xf18x6-0.sc-17boio7-0.hnKAL.dpgtT > div > div.sc-1po1rbf-5.imKjCb > div.sc-1xf18x6-0.cPWSa-d.AssetSearchView--main > div.AssetSearchView--results.collection--results.AssetSearchView--results--phoenix > div.sc-ixw4tc-0.kyBdWA',
  supply: '#main > div > div > div.sc-1xf18x6-0.sc-17boio7-0.hnKAL.dpgtT > div > div.sc-1po1rbf-5.imKjCb > div.sc-1xf18x6-0.cPWSa-d.AssetSearchView--main > div.AssetSearchView--results.collection--results.AssetSearchView--results--phoenix > div.fresnel-container.fresnel-greaterThanOrEqual-md.sc-1po1rbf-1.hsgVfN > div > div > p',
};
let dunkGenesis = {
  floorPrice: 0,
  supply: 0,
  equippedSupply: 0,
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
let mnlth = {
  floorPrice: 0
};
let mnlth2 = {
  floorPrice: 0
};
let skinVial = {
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
const timeout = config.timeout;
let errors = 0;

const retrieveSupply = async (page) => {
  return await page.$eval(selectors.supply, e => parseInt(e.textContent
    .replace(" ", "")
    .replace(",", ""))
  );
};

const retrieveFirstListingPrice = async (page) => {
  return await page.$eval(selectors.firstListingPrice, e => parseFloat(e.textContent));
}

const toClick = async (page, selector) => {
  try {
    await page.click(selector);
    await page.waitForSelector(selectors.firstItem, {timeout});
  } catch (e) {
    console.log(`First listing not found for ${selector} on ${page.url()} check for "no items"`);
    await page.waitForSelector(selectors.noItems, {timeout: 10000});
  }
}

const retrieveEquippedDunk = async (page) => {
  try {
    await toClick(page, selectors.box.vialBoxDunk);
    await toClick(page, selectors.box.equippedBox);
    dunkGenesis.equippedSupply = await retrieveSupply(page);
  } catch (e) {console.log(e)}
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

const retrieveMnlthData = async (browser) => {
  try {
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({'Accept-Language': 'en'});
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/78.0.3904.108 Chrome/78.0.3904.108 Safari/537.36');

    await page.goto('https://opensea.io/collection/rtfkt-mnlth');
    await page.waitForSelector(selectors.floorPrice, {timeout});
    mnlth.floorPrice = await page.$eval(selectors.floorPrice, e => parseFloat(e.textContent));
    await page.close();
  } catch (err) {
    console.log(`Error while trying to access MNLTH data: ${err}`);
    errors += 1;
  }
}

const retrieveMnlth2Data = async (browser) => {
  try {
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({'Accept-Language': 'en'});
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/78.0.3904.108 Chrome/78.0.3904.108 Safari/537.36');

    await page.goto('https://opensea.io/collection/rtfktmonolith');
    await page.waitForSelector(selectors.floorPrice, {timeout});
    mnlth2.floorPrice = await page.$eval(selectors.floorPrice, e => parseFloat(e.textContent));
    await page.close();
  } catch (err) {
    console.log(`Error while trying to access MNLTH2 data: ${err}`);
    errors += 1;
  }
}

const retrieveDunkGenesisData = async (browser) => {
  try {
    const collectionSlug = 'rtfkt-nike-cryptokicks';
    const url = `https://opensea.io/collection/${collectionSlug}?search[sortAscending]=true&search[sortBy]=PRICE`;
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({'Accept-Language': 'en'});
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/78.0.3904.108 Chrome/78.0.3904.108 Safari/537.36');

    await page.goto(url);
    await page.waitForSelector(selectors.floorPrice, {timeout});
    dunkGenesis.floorPrice = await page.$eval(selectors.floorPrice, e => parseFloat(e.textContent));
    dunkGenesis.supply = await retrieveSupply(page);

    await toClick(page, selectors.box.dnaBox);
    await retrieveTraitsData(page, selectors.box.humanBox, dunkGenesis.traits.human);
    await retrieveTraitsData(page, selectors.box.robotBox, dunkGenesis.traits.robot);
    await retrieveTraitsData(page, selectors.box.demonBox, dunkGenesis.traits.demon);
    await retrieveTraitsData(page, selectors.box.angelBox, dunkGenesis.traits.angel);
    await retrieveTraitsData(page, selectors.box.reptileBox, dunkGenesis.traits.reptile);
    await retrieveTraitsData(page, selectors.box.undeadBox, dunkGenesis.traits.undead);
    await retrieveTraitsData(page, selectors.box.murakamiBox, dunkGenesis.traits.murakami);
    await retrieveTraitsData(page, selectors.box.alienBox, dunkGenesis.traits.alien);
    await retrieveEquippedDunk(page);
    // await page.close();
  } catch (err) {
    console.log(err);
    // console.log(`Error while trying to access Dunk Genesis data: ${err}`);
    errors += 1;
  }
}

const retrieveSkinVialData = async (browser) => {
  try {
    const collectionSlug = 'skinvial-evox';
    const url = `https://opensea.io/collection/${collectionSlug}?search[sortAscending]=true&search[sortBy]=PRICE`;
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({'Accept-Language': 'en'});
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/78.0.3904.108 Chrome/78.0.3904.108 Safari/537.36');

    await page.goto(url);
    await page.waitForSelector(selectors.floorPrice, {timeout});
    skinVial.floorPrice = await page.$eval(selectors.floorPrice, e => parseFloat(e.textContent));
    skinVial.supply = await retrieveSupply(page);
    await toClick(page, selectors.box.dnaBox);
    await retrieveTraitsData(page, selectors.box.humanBox, skinVial.traits.human);
    await retrieveTraitsData(page, selectors.box.robotBox, skinVial.traits.robot);
    await retrieveTraitsData(page, selectors.box.demonBox, skinVial.traits.demon);
    await retrieveTraitsData(page, selectors.box.angelBox, skinVial.traits.angel);
    await retrieveTraitsData(page, selectors.box.reptileBox, skinVial.traits.reptile);
    await retrieveTraitsData(page, selectors.box.undeadBox, skinVial.traits.undead);
    await retrieveTraitsData(page, selectors.box.murakamiBox, skinVial.traits.murakami);
    await retrieveTraitsData(page, selectors.box.alienBox, skinVial.traits.alien);
    await page.close();
  } catch (err) {
    // console.log(err);
    console.log(`Error while trying to access Skin Vials data: ${err}`);
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

  if (fs.existsSync('./commands/data.json'))
    data = JSON.parse(fs.readFileSync('./commands/data.json'));
  else
    data.lastSuccessfullUpdate = 0;

  errors = 0;
  await Promise.all([
    // retrieveMnlthData(browser),
    // retrieveMnlth2Data(browser),
    retrieveDunkGenesisData(browser),
    // retrieveSkinVialData(browser)
  ]);
  // await browser.close();
  console.log(performance.now() - start);
  return ({
    mnlth,
    mnlth2,
    skinVial,
    dunkGenesis,
    lastUpdate: Date.now(),
    lastSuccessfullUpdate: errors >= 1 ? data.lastSuccessfullUpdate : Date.now()
  });
}

const updateJSON = async () => {
  const data = await retrieveData();
  const json = JSON.stringify(data);
  const dataDirectory = path.join(process.cwd(), 'data');
  const filename = '/mnlthData.json';

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

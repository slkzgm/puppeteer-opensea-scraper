# puppeteer-opensea-scraper

Node scripts used to retrieve data from opensea.io website.

As the opensea API isn't frequently enough being updated, and some informations are hard to retrieve or even totally missings altogether, those script use Puppeteer along with extra-plugin-stealth to simulate human browsering to retrieve more accurate collections data.

# Run it yourself:

1: Clone the repo

2: Install dependencies: npm install

3: Edit the config.json file as you please:

```json
{
  "headless": false,
  "timeout": 10000,
  "maxErrorsForUpdate": 1,
  "proxyEnabled": false,
  "proxyUrl": "YOUR_PROXY_URL",
  "proxyPort": "YOUR_PROXY_PORT",
  "proxyUsername": "YOUR_PROXY_USERNAME",
  "proxyPassword": "YOUR_PROXY_PASSWORD",
  "autoReload": false
}
```
`headless`: Define the launching parameter for puppeteer. It can help to debug or to bypass more easily the cloudflare protection.

`autoReload`: Is usefull if you want to use a proxy service, like brighdata superproxy, the script will automatically reload with new ip if it get blocked by the cloudflare protection.

4: Run the desired script: `node script_name`

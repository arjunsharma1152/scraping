
const puppeteer = require('puppeteer');
const fs = require("fs");

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false
  });
  const page = await browser.newPage();

  await page.goto(`https://www.wionews.com/india-news`,{
    waitUntil: "domcontentloaded",
  });
  
  await page.click('.btn-read-more');
  
  await page.click('.btn-read-more');

  await page.waitForSelector('div.text-center .p4', { hidden: true });

    const link = await page.evaluate(() => { return Array.from(document.querySelectorAll(".article-list-txt h2 a")).map(x => x.href)});

    const heading = await page.evaluate(() => { return Array.from(document.querySelectorAll(".article-list-txt h2 a")).map(x => x.textContent)});
    
    let content = [] , location = [] , updated = [];

    for(let j=0 ; j<link.length ; j++){
      await page.goto(`${link[j]}`,{
        waitUntil: "domcontentloaded",
      })

      let pageData = await page.evaluate(() => { return Array.from(document.querySelectorAll(".article-main-data > div:not([class]):not([id]) > p")).map(x => x.innerHTML)})

      let div = await page.evaluate(() => { return Array.from(document.querySelectorAll(".new-loc-date-stamp > div > span")).map(x => x.innerHTML)})
   
      pageData.splice(-3);

      const myContent = pageData.join(" ");

      content.push(myContent);

      updated.push(div[2]);

      location.push(div[0]);

    }

    const objectArray = [];

    for (let i = 0; i < heading.length; i++) {
      const newObj = {
        heading: heading[i],
        link: link[i],
        content: content[i],
        location: location[i],
        updated: updated[i]
      };

      objectArray.push(newObj);
    }

console.log(objectArray.length);
const allData = JSON.stringify(objectArray);

fs.writeFile('news.json', allData, (err) => {
  if (err) throw err;
  console.log('Object saved to file!');
});
await browser.close();
})();
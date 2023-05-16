
const puppeteer = require('puppeteer');
const fs = require("fs");

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false
  });
  const page = await browser.newPage();

  await page.goto(`https://www.jagran.com/news/national-news-hindi.html?itm_medium=national&amp;itm_source=dsktp&amp;itm_campaign=navigation`,{
    waitUntil: "domcontentloaded",
  });
  
    const link = await page.evaluate(() => { return Array.from(document.querySelectorAll(".main-story li.article .summary .summaryTop h3 a")).map(x => x.href)});

    const heading = await page.evaluate(() => { return Array.from(document.querySelectorAll(".main-story li.article .summary .summaryTop h3 a")).map(x => x.textContent)});
    
    let content = [], publishedAt = [];

    for(let j=0 ; j<link.length ; j++){
      await page.goto(`${link[j]}`,{
        waitUntil: "domcontentloaded",
      })

      let pageData = await page.evaluate(() => { return Array.from(document.querySelectorAll(".articlecontent > p:not([class]):not([id])")).map(x => x.textContent)})

      let div = await page.evaluate(() => { return Array.from(document.querySelectorAll(".dateInfo span")).map(x => x.textContent)})
   
      const myContent = pageData.join(" ");

      content.push(myContent);

      publishedAt.push(div[1]);

    }

    const objectArray = [];

    for (let i = 0; i < heading.length; i++) {
      const newObj = {
        heading: heading[i],
        link: link[i],
        content: content[i],
        publishedAt: publishedAt[i]
      };

      objectArray.push(newObj);
    }

console.log(objectArray.length);
const allData = JSON.stringify(objectArray);

fs.writeFile('jagran.json', allData, (err) => {
  if (err) throw err;
  console.log('DATA EXTRACTED!');
});
await browser.close();
})();
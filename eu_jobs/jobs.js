
const puppeteer = require('puppeteer');
const fs = require("fs");

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false
  });
  const page = await browser.newPage();
  const data = {};
  for(let i=1;i<2;i++){
  await page.goto(`https://jobs.theguardian.com/jobs/europe/${i}`);

    const link = await page.evaluate(() => { return Array.from(document.querySelectorAll(".lister__header a")).map(x => x.href)});
    
    let contract = [], hours = [], l_type = [], industry = [], description = [] ;
    
    for(let j=0 ; j<link.length ; j++){
      await page.goto(`${link[j]}`)

      let pageData = await page.evaluate(() => { return Array.from(document.querySelectorAll(".mds-padding-top-b3 dd a")).map(x => x.textContent)})
      let divText = await page.evaluate(() => {
        const div = document.querySelector('div.mds-edited-text.mds-font-body-copy-bulk');
        return div.textContent;
      });

      divText= divText.replace(/\n/g, '');

      contract.push(pageData[0]);
      hours.push(pageData[1]);
      l_type.push(pageData[2]);
      industry.push(pageData[3]);
      description.push(divText);

    }
    
    await page.goto(`https://jobs.theguardian.com/jobs/europe/${i}`);

    const title = await page.evaluate(() => { return Array.from(document.querySelectorAll(".lister__header span")).map(x => x.textContent)})
    const salary = await page.evaluate(() => { return Array.from(document.querySelectorAll(".lister__meta .lister__meta-item--salary")).map(x => x.textContent)})
    const organisation = await page.evaluate(() => { return Array.from(document.querySelectorAll(".lister__meta .lister__meta-item--recruiter")).map(x => x.textContent)})


    const objectArray = [];

    for (let i = 0; i < title.length; i++) {
      const newObj = {
        title: title[i],
        salary: salary[i],
        organisation: organisation[i],
        link: link[i],
        contract: contract[i],
        hours: hours[i],
        listing_type: l_type[i],
        industry: industry[i],
        description: description[i],
      };
      objectArray.push(newObj);
    }

  data[i] = objectArray;
}
// console.log(data);
const allData = JSON.stringify(data);

fs.writeFile('jobs.json', allData, (err) => {
  if (err) throw err;
  console.log('Object saved to file!');
});
await browser.close();
})();
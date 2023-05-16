
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
  await page.goto(`https://eurojobs.com/browse-by-country/European%20Union/?searchId=1683199745.5279&action=search&page=${i}&view=list`);

  const link = await page.evaluate(() => { return Array.from(document.querySelectorAll(".listing-title a:nth-child(2)")).map(x => x.href)});
  
  let description = [], salary = [], category = [];

  for(let j=0 ; j<link.length ; j++){
    await page.goto(`${link[j]}`);

    const desc = await page.evaluate(() => { return Array.from(document.querySelectorAll(".displayFieldBlock")).map(x => x.textContent.replace(/[\t\n]/g, ''))});

    const sal = await page.evaluate(() => { return Array.from(document.querySelectorAll(".displayFieldBlock div")).map(x => x.textContent.replace(/[\t\n]/g, ''))});

    const cat = await page.evaluate(() => { return Array.from(document.querySelectorAll(".displayFieldBlock div")).map(x => x.textContent.replace(/[\t\n]/g, ''))});

    category.push(cat[1]);
    salary.push((sal[2] == 'Yes') ? 'Not disclosed' : sal[2]);
    description.push(desc[8]);
  }

  await page.goto(`https://eurojobs.com/browse-by-country/European%20Union/?searchId=1683199745.5279&action=search&page=${i}&view=list`);


    const title = await page.evaluate(() => { return Array.from(document.querySelectorAll(".listing-title a:nth-child(2)")).map(x => x.textContent)});
    const organisation = await page.evaluate(() => { return Array.from(document.querySelectorAll(".left-side span:nth-child(4)")).map(x => x.textContent.replace(/[\t\n]/g, ''))});
    const location = await page.evaluate(() => { return Array.from(document.querySelectorAll(".left-side span:nth-child(2)")).map(x => x.textContent)});
    const posted = await page.evaluate(() => { return Array.from(document.querySelectorAll(".left-side span:nth-child(6)")).map(x => x.textContent)});

    const objectArray = [];

    for (let i = 0; i < title.length; i++) {
      const newObj = {
        title: title[i],
        organisation: organisation[i],
        link: link[i],
        category: category[i],
        salary: salary[i],
        location: location[i],
        posted: posted[i],
        description: description[i]
      };
      objectArray.push(newObj);
    }
  
  data[i] = objectArray;
}
console.log(data);

const allData = JSON.stringify(data);

fs.writeFile('eurojobs.json', allData, (err) => {
  if (err) throw err;
  console.log('Object saved to file!');
});

await browser.close();
})();

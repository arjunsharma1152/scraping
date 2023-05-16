const puppeteer = require('puppeteer');
const fs = require("fs");

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false
  });
  const page = await browser.newPage();
  const objectArray = [];
  for(let i=2;i<5;i++){
    const a = i*30;
  await page.goto(`https://www.freshersworld.com/jobs-in-india/999900?&limit=30&offset=${a}`);

  let link = await page.evaluate(() => { return Array.from(document.querySelectorAll("#sort-jobs #all-jobs-append")).map(x => x.getAttribute('job_display_url'))});

  if(i == 2){
    link = link.slice(12);
  }

  let description = [], salary = [], jobExperience = [], jobTitle = [], qualification = [], jobLocation = [], organisation = [];

  for(let j=0 ; j<link.length ; j++){
    await page.goto(`${link[j]}`);

    const title = await page.evaluate(() => {
        return document.querySelector('div.job-role h2').textContent;
      });

    const experience  = await page.evaluate(() => {
        return document.querySelector('div.experience .job-details-sub-div > .space').textContent;
      });

    const sal  = await page.evaluate(() => {
        return document.querySelector('div.salary .job-details-sub-div > .space').textContent;
      });

    const qual  = await page.evaluate(() => {
        return document.querySelector('div.qualification-div .qualifications').textContent;
      });

    const location  = await page.evaluate(() => {
        return document.querySelector('div.location .job-location').textContent;
      });

    const org  = await page.evaluate(() => {
        return document.querySelector('div.company-name > span').textContent;
      });

    const desc  = await page.evaluate(() => {
        return document.querySelector('div.job-detail-section .job-desc').innerHTML;
      });

    salary.push(sal);
    jobTitle.push(title);
    jobExperience.push(experience);
    qualification.push(qual);
    jobLocation.push(location);
    organisation.push(org);
    description.push(desc);

  }

    for (let i = 0; i < jobTitle.length; i++) {
      const newObj = {
        title: jobTitle[i],
        organisation: organisation[i],
        link: link[i],
        experience: jobExperience[i],
        salary: salary[i],
        location: jobLocation[i],
        qualification: qualification[i],
        description: description[i]
      };
      objectArray.push(newObj);
    }
}

const allData = JSON.stringify(objectArray);

fs.writeFile('indianjobs.json', allData, (err) => {
  if (err) throw err;
  console.log('DATA EXTRACTED');
});

await browser.close();
})();

const puppeteer = require('puppeteer');
const fs = require("fs");

const extractData = async (type) => {
  const mainBrowser = await puppeteer.launch({
    headless: false,
    defaultViewport: false
  });
  const mainPage = await mainBrowser.newPage();

  const fullData = [];

  await mainPage.goto(`https://internshala.com/${type}`, {
    waitUntil: "domcontentloaded",
  });

  const title = await mainPage.evaluate(() => { return (Array.from(document.querySelectorAll("#content > div > div > div > div.directory_container > div > div.directory > div > a")).map(x => x.textContent)) });

  const links = await mainPage.evaluate(() => { return (Array.from(document.querySelectorAll("#content > div > div > div > div.directory_container > div > div.directory > div > a")).map(x => x.href)) });

  const internshipItems = [];

  await mainBrowser.close();

  for(let i=0; i<links.length ; i++){

    const allInternships = [];

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: false
      });
      const page = await browser.newPage();
        
      await page.goto(`${links[i]}`, {
        waitUntil: "domcontentloaded",
      });

    const itemLinks = await page.evaluate(() => { return (Array.from(document.querySelectorAll("#internship_list_container_1 > div > div:nth-child(2) > div > a")).map(x => x.href)) });

    for(let j=0; j<itemLinks.length; j++){
            
          await page.goto(`${itemLinks[j]}`, {
            waitUntil: "domcontentloaded",
          });

          const profile = await page.evaluate(() => {
            const profileDiv = document.querySelector('div.company > h3 > span');
            if(profileDiv){
            return profileDiv.textContent;
            } else {
              return " ";
            }
          });

          const company = await page.evaluate(() => {
            const companyDiv = document.querySelector('div.company > h4 > div > a');
            if(companyDiv){
            return companyDiv.textContent;
            } else {
              return " ";
            }
          });

          const location = await page.evaluate(() => {
            const locationDiv = document.querySelector('#location_names > span > a');
            if(locationDiv){
            return locationDiv.textContent;
            } else {
              return " ";
            }
          });

          const starts = await page.evaluate(() => {
            const startsDiv = document.querySelector('#start-date-first > span.start_immediately_desktop');
            if(startsDiv){
            return startsDiv.textContent;
            } else {
              return " ";
            }
          });

          const duration = await page.evaluate(() => {
            const durationDiv = document.querySelector('div.individual_internship_details.individual_internship_internship > div.internship_other_details_container > div:nth-child(1) > div:nth-child(2) > div.item_body');
            if(durationDiv){
            return durationDiv.textContent;
            } else {
              return " ";
            }
          });

          const stipend = await page.evaluate(() => {
            const stipendDiv = document.querySelector('div.individual_internship_details.individual_internship_internship > div.internship_other_details_container > div:nth-child(2) > div.other_detail_item.stipend_container > div.item_body > span');
            if(stipendDiv){
            return stipendDiv.textContent;
            } else {
              return " ";
            }
          });

          const applyBy = await page.evaluate(() => {
            const applyByDiv = document.querySelector('div.individual_internship_details.individual_internship_internship > div.internship_other_details_container > div:nth-child(2) > div.other_detail_item.apply_by > div.item_body');
            if(applyByDiv){
            return applyByDiv.textContent;
            } else {
              return " ";
            }
          });

          const aboutCompany = await page.evaluate(() => {
            const aboutCompanyDiv = document.querySelector('#details_container > div.detail_view > div.internship_details > div.text-container.about_company_text_container');
            if(aboutCompanyDiv){
            return aboutCompanyDiv.textContent;
            } else {
              return " ";
            }
          });

          let aboutInternship = await page.evaluateHandle(() => {
            const headingDiv = document.querySelector('.about_heading');
            
            if(headingDiv){
            const nextDiv = headingDiv.nextElementSibling;
            return nextDiv.innerHTML;
            } else {
                return " "
            }
          });

          aboutInternship = await aboutInternship.jsonValue();

          let skills = await page.evaluateHandle(() => {
            const headingDiv = document.querySelector('.skills_heading');

            if(headingDiv){
            const nextDiv = headingDiv.nextElementSibling;
            return nextDiv.innerHTML;
            } else{
                return " "
            }
          });

          skills = await skills.jsonValue();

          if(skills != " "){
          skills = skills.match(/<span.*?>(.*?)<\/span>/g).map((span) => span.replace(/<.*?>/g, ''));
          }

          let whoCanApply = await page.evaluate(() => {
            const whoCanApplyDiv = document.querySelector('#details_container > div.detail_view > div.internship_details > div.text-container.who_can_apply');
            if(whoCanApplyDiv){
            return whoCanApplyDiv.innerHTML;
            } else {
              return " ";
            }
          });

          whoCanApply = whoCanApply.replace(/<\/?p.*?>/g, '').replace(/^\s+|\s+$/g, '').replace(/\n\s+/g, '\n').trim();

          let perks = await page.evaluateHandle(() => {
            const headingDiv = document.querySelector('.perks_heading');
            
            if(headingDiv){
            const nextDiv = headingDiv.nextElementSibling;
            return nextDiv.innerHTML;
            } else{
                return " ";
            }
          });

          perks = await perks.jsonValue();

          if(perks != " "){
          perks = perks.match(/<span.*?>(.*?)<\/span>/g).map((span) => span.replace(/<.*?>/g, ''));
          }

          const openings = await page.evaluate(() => {
            const openingsDiv = document.querySelector('#details_container > div.detail_view > div.internship_details > div:nth-last-child(4)');
            if(openingsDiv){
            return openingsDiv.innerHTML;
            } else {
              return " ";
            }
          });

          const obj = {
            profile,
            company: company.trim(),
            location,
            starts,
            duration: duration.trim(),
            stipend,
            applyBy,
            aboutCompany: aboutCompany.trim(),
            aboutInternship: aboutInternship.trim(),
            skills,
            whoCanApply,
            perks,
            openings: openings.trim()
          }

          allInternships.push(obj);
          
    }

    internshipItems.push(allInternships);

    await browser.close();
  }

  for(let l=0; l<links.length ; l++){
    const mainObj = {
      category: title[l],
      interships: internshipItems[l]
    }
    fullData.push(mainObj);
  }

  await mainBrowser.close();

  return fullData;
};

(async () => {

const categoryData = await extractData("internships-by-category");

const locationData = await extractData("internships-by-location");

const newData = {
    intershipsByCategory: categoryData,
    intershipsByLocation: locationData
  }

  const data = JSON.stringify(newData);

  fs.writeFile('internships.json', data, (err) => {
    if (err) throw err;
    console.log('DATA EXTRACTED');
  });
})();
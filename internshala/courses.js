const puppeteer = require('puppeteer');
const fs = require("fs");

(async () => {
    const mainBrowser = await puppeteer.launch({
        headless: false,
        defaultViewport: false
    });
    const mainPage = await mainBrowser.newPage();

    const fullData = [], fullDataHTML = [];

    await mainPage.goto(`https://trainings.internshala.com/?utm_source=is_web_internshala-menu-dropdown1`, {
        waitUntil: "domcontentloaded",
    });

    const title = await mainPage.evaluate(() => { return (Array.from(document.querySelectorAll("#footer > div > div > div.footer-inner > div.inner-footer.d-none.d-lg-block > div.menu-heading > p")).map(x => x.textContent)) });

    const categoryItem = [], categoryItemHTML = [];

    const div = await mainPage.$$('#footer > div > div > div.footer-inner > div');

    await mainBrowser.close();

    for (let i = 2; i < div.length - 1; i++) {

        const mainItems = [], mainItemsHTML = [];

        const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: false
        });
        const page = await browser.newPage();

        await page.goto(`https://trainings.internshala.com/?utm_source=is_web_internshala-menu-dropdown1`, {
            waitUntil: "domcontentloaded",
        });

        const div = await page.$$('#footer > div > div > div.footer-inner > div');

        const lis = await div[i].$$('div.items > div > a');

        const itemLinks = await Promise.all(lis.map(li => li.evaluate(node => node.href)));

        const itemTitles = await Promise.all(lis.map(li => li.evaluate(node => node.textContent)));

        const itemData = [], itemDataHTML = [];

        await browser.close();

        for (let j = 0; j < itemLinks.length; j++) {

            const newBrowser = await puppeteer.launch({
                headless: false,
                defaultViewport: false
            });
            const tempPage = await newBrowser.newPage();

            await tempPage.goto(`${itemLinks[j]}`, {
                waitUntil: "domcontentloaded",
            });

            const name = await tempPage.evaluate(() => {
                const nameDiv = document.querySelector('#banner > div:nth-child(1) > div.trainings > h1');
                if (nameDiv) {
                    return nameDiv.textContent;
                } else {
                    return " ";
                }
            });

            const subHeading = await tempPage.evaluate(() => {
                const subHeadingDiv = document.querySelector('#banner > div:nth-child(1) > div.trainings > p');
                if (subHeadingDiv) {
                    return subHeadingDiv.textContent;
                } else {
                    return " ";
                }
            });

            const subPoints = await tempPage.evaluate(() => { return Array.from(document.querySelectorAll("#banner > div:nth-child(1) > div.trainings > div.tags > div")).map(x => x.textContent.trim()) });

            const subPointsHTML = await tempPage.evaluate(() => { return Array.from(document.querySelectorAll("#banner > div:nth-child(1) > div.trainings > div.tags > div")).map(x => x.innerHTML) });

            const price = await tempPage.evaluate(() => {
                const priceDiv = document.querySelector('.dynamic-price');
                if (priceDiv) {
                    return priceDiv.textContent;
                } else {
                    return " ";
                }
            });

            const highlights = await tempPage.evaluate(() => { return Array.from(document.querySelectorAll("#training-highlights > div > div > div.details")).map(x => x.innerHTML.replace(/<\/p>/, " :").replace(/\s*<[^>]+>\s*/g, ' ').replace(/\s+/g, ' ').trim()) });

            const highlightsHTML = await tempPage.evaluate(() => { return Array.from(document.querySelectorAll("#training-highlights > div > div > div.details")).map(x => x.innerHTML.replace(/\n\s*/g, "")) });

            const whyLearn = await tempPage.evaluate(() => { return Array.from(document.querySelectorAll("#why-learn > div > div.points > div")).map(x => x.innerHTML.replace(/<\/p>/, " :").replace(/\s*<[^>]+>\s*/g, ' ').replace(/\s+/g, ' ').trim()) });

            const whyLearnHTML = await tempPage.evaluate(() => { return Array.from(document.querySelectorAll("#why-learn > div > div.points > div")).map(x => x.innerHTML.replace(/\n\s*/g, "")) });

            const certificate = await tempPage.evaluate(() => { return Array.from(document.querySelectorAll("#certificate > div > div.points > div > div.description > p")).map(x => x.innerHTML.replace(/<\/p>/, " :").replace(/\s*<[^>]+>\s*/g, ' ').replace(/\s+/g, ' ').trim()) });

            const placement = await tempPage.evaluate(() => { return Array.from(document.querySelectorAll("#placement > div > div.points > div")).map(x => x.innerHTML.replace(/<\/p>/, " :").replace(/\s*<[^>]+>\s*/g, ' ').replace(/\s+/g, ' ').trim()) });

            const placementHTML = await tempPage.evaluate(() => { return Array.from(document.querySelectorAll("#placement > div > div.points > div")).map(x => x.innerHTML.replace(/\n\s*/g, "")) });

            const features = await tempPage.evaluate(() => { return Array.from(document.querySelectorAll("#features > div > div > div.details")).map(x => x.innerHTML.replace(/<\/p>/, " :").replace(/\s*<[^>]+>\s*/g, ' ').replace(/\s+/g, ' ').trim()) });

            const featuresHTML = await tempPage.evaluate(() => { return Array.from(document.querySelectorAll("#features > div > div > div.details")).map(x => x.innerHTML.replace(/\n\s*/g, "")) });

            const brief = await tempPage.evaluate(() => { return Array.from(document.querySelectorAll("#syllabus > div.brief > div > p")).map(x => x.textContent) });

            const syllabus = await tempPage.evaluate(() => { return Array.from(document.querySelectorAll("#accordion-syllabus > div > div > div.module-container.collapse-title.collapsed > div.module > h4")).map(x => x.textContent) });

            const description = await tempPage.evaluate(() => {
                const descriptionDiv = document.querySelector('#course-projects-section > div > div.projects-container > div > div.body > p');
                if (descriptionDiv) {
                    return descriptionDiv.textContent;
                } else {
                    return " ";
                }
            });


            const obj = {
                name,
                subHeading,
                subPoints,
                price,
                highlights,
                whyLearn,
                certificate,
                placement,
                features,
                brief,
                syllabus,
                description
            };

            const objHTML = {
                name,
                subHeading,
                subPointsHTML,
                price,
                highlightsHTML,
                whyLearnHTML,
                certificate,
                placementHTML,
                featuresHTML,
                brief,
                syllabus,
                description
            };

            itemData.push(obj);

            itemDataHTML.push(objHTML);

            await newBrowser.close();

        }

        for (let j = 0; j < itemTitles.length; j++) {

            const courseObj = {
                title: itemTitles[j].replace(/\n/g, "").trim(),
                link: itemLinks[j],
                data: itemData[j]
            }

            const courseObjHTML = {
                title: itemTitles[j].replace(/\n/g, "").trim(),
                link: itemLinks[j],
                data: itemDataHTML[j]
            }

            mainItems.push(courseObj);

            mainItemsHTML.push(courseObjHTML);

        }

        categoryItem.push(mainItems);

        categoryItemHTML.push(mainItemsHTML);

    }

    for (let l = 0; l < title.length - 1; l++) {
        const mainObj = {
            category: title[l],
            courses: categoryItem[l]
        }

        const mainObjHTML = {
            category: title[l],
            courses: categoryItemHTML[l]
        }

        fullData.push(mainObj);

        fullDataHTML.push(mainObjHTML);
    }

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: false
    });
    const page = await browser.newPage();

    await page.goto(`https://trainings.internshala.com/?utm_source=is_web_internshala-menu-dropdown1`, {
        waitUntil: "domcontentloaded",
    });

    const newDiv = await page.$$('#footer > div > div > div.footer-inner > div');

    const lis = await newDiv[newDiv.length - 1].$$('div.items > div > a');

    const lastItemLinks = await Promise.all(lis.map(li => li.evaluate(node => node.href)));

    const lastItemTitles = await Promise.all(lis.map(li => li.evaluate(node => node.textContent)));

    const lastItems = [], lastItemsHTML = [];

    await browser.close();

    for (let j = 0; j < lastItemLinks.length; j++) {

        const newBrowser = await puppeteer.launch({
            headless: false,
            defaultViewport: false
        });
        const tempPage = await newBrowser.newPage();

        await tempPage.goto(`${lastItemLinks[j]}`, {
            waitUntil: "domcontentloaded",
        });

        const name = await tempPage.evaluate(() => {
            const nameDiv = document.querySelector('#content > div.banner-section > div.banner-content > div > div > div.heading > h1');
            if (nameDiv) {
                return nameDiv.innerHTML.replace(/<\/?span[^>]*>/g, '');
            } else {
                return " ";
            }
        });

        const subHeading = await tempPage.evaluate(() => {
            const subHeadingDiv = document.querySelector('#content > div.banner-section > div.banner-content > div > div > div.heading > div');
            if (subHeadingDiv) {
                return subHeadingDiv.textContent;
            } else {
                return " ";
            }
        });

        const price = await tempPage.evaluate(() => {
            const priceDiv = document.querySelector('#program-fee > div.section-content > div > div.fees > div.slab');
            if (priceDiv) {
                return priceDiv.textContent;
            } else {
                return " ";
            }
        });

        const highlights = await tempPage.evaluate(() => { return Array.from(document.querySelectorAll("#key_highlights > div > div > div > div > div.highlights-content")).map(x => x.innerHTML.replace(/<\/div>/, " :").replace(/\s*<[^>]+>\s*/g, ' ').replace(/\s+/g, ' ').trim()) });

        const highlightsHTML = await tempPage.evaluate(() => { return Array.from(document.querySelectorAll("#key_highlights > div > div > div > div > div.highlights-content")).map(x => x.innerHTML.replace(/\n\s*/g, "")) });

        const certificate = await tempPage.evaluate(() => { return Array.from(document.querySelectorAll("#certifications > div.section-content > div > div")).map(x => x.innerHTML.replace(/<\/p>/, " :").replace(/\s*<[^>]+>\s*/g, ' ').replace(/\s+/g, ' ').trim()) });

        const certificateHTML = await tempPage.evaluate(() => { return Array.from(document.querySelectorAll("#certifications > div.section-content > div > div")).map(x => x.innerHTML.replace(/\n\s*/g, "")) });

        const careerOptions = await tempPage.evaluate(() => { return Array.from(document.querySelectorAll("#top_careers > div > div.custom-carousel > div.slider > div > div > div")).map(x => x.innerHTML.replace(/<\/div>/, " :").replace(/\s*<[^>]+>\s*/g, ' ').replace(/\s+/g, ' ').trim()) });

        const careerOptionsHTML = await tempPage.evaluate(() => { return Array.from(document.querySelectorAll("#top_careers > div > div.custom-carousel > div.slider > div > div")).map(x => x.innerHTML.replace(/\n\s*/g, "")) });

        const features = await tempPage.evaluate(() => { return Array.from(document.querySelectorAll("#placement_guarantee > div > div > div > div.highlights-content")).map(x => x.textContent.replace(/\n\s*/g, "")) });

        const featuresHTML = await tempPage.evaluate(() => { return Array.from(document.querySelectorAll("#placement_guarantee > div > div > div ")).map(x => x.innerHTML.replace(/\n\s*/g, "")) });

        const brief = await tempPage.evaluate(() => { return Array.from(document.querySelectorAll("#specialization-syllabus-section > div > div.syllabus-heading-info-container > div > span")).map(x => x.textContent) });

        const briefHTML = await tempPage.evaluate(() => { return Array.from(document.querySelectorAll("#specialization-syllabus-section > div > div.syllabus-heading-info-container > div ")).map(x => x.innerHTML.replace(/\n\s*/g, "")) });

        const syllabus = await tempPage.evaluate(() => { return Array.from(document.querySelectorAll("#accordion > div > div.syllabus-course-container.collapse-title > div.course > h4")).map(x => x.textContent) });

        const skills = await tempPage.evaluate(() => { return Array.from(document.querySelectorAll("#skills > div > div > div > div > div.highlights-content")).map(x => x.textContent.replace(/\n\s*/g, "")) });

        const skillsHTML = await tempPage.evaluate(() => { return Array.from(document.querySelectorAll("#skills > div > div > div > div ")).map(x => x.innerHTML.replace(/\n\s*/g, "")) });

        const obj = {
            name,
            subHeading,
            price,
            highlights,
            certificate,
            careerOptions,
            features,
            brief,
            syllabus,
            skills
        };

        const objHTML = {
            name,
            subHeading,
            price,
            highlightsHTML,
            certificateHTML,
            careerOptionsHTML,
            featuresHTML,
            briefHTML,
            syllabus,
            skillsHTML
        };

        lastItems.push(obj);

        lastItemsHTML.push(objHTML);

        await newBrowser.close();
    }

    const mainLastItems = [], mainLastItemsHTML = [];

    for (let j = 0; j < lastItemTitles.length; j++) {

        const courseObj = {
            title: lastItemTitles[j].replace(/\n/g, "").replace("NEW","").trim(),
            link: lastItemLinks[j],
            data: lastItems[j]
        }

        const courseObjHTML = {
            title: lastItemTitles[j].replace(/\n/g, "").replace("NEW","").trim(),
            link: lastItemLinks[j],
            data: lastItemsHTML[j]
        }

        mainLastItems.push(courseObj);

        mainLastItemsHTML.push(courseObjHTML);

    }

    const tempObj = {
        category: title[title.length - 1],
        courses: mainLastItems
    }

    const tempObjHTML = {
        category: title[title.length - 1],
        courses: mainLastItemsHTML
    }

    fullData.push(tempObj);

    fullDataHTML.push(tempObjHTML);

    const data = JSON.stringify(fullData);

    const dataHTML = JSON.stringify(fullDataHTML);

    fs.writeFile('courses.json', data, (err) => {
        if (err) throw err;
        console.log('DATA EXTRACTED');
    });

    fs.writeFile('coursesHTML.json', dataHTML, (err) => {
        if (err) throw err;
        console.log('HTML DATA EXTRACTED');
    });

})();

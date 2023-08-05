const puppeteer = require('puppeteer');
const fs = require("fs");

(async () => {
    const mainBrowser = await puppeteer.launch({
        headless: false,
        defaultViewport: false
    });
    const mainPage = await mainBrowser.newPage();

    const fullData = [], mcqs = [];

    await mainPage.goto(`https://www.allindiaexams.in/aptitude-questions-and-answers`, {
        waitUntil: "domcontentloaded",
    });

    const titles = await mainPage.evaluate(() => { return (Array.from(document.querySelectorAll('#int_con_bg > div.int_content > section:nth-child(2) > div > ul > li > a')).map(x => x.textContent)) });

    const links = await mainPage.evaluate(() => { return (Array.from(document.querySelectorAll('#int_con_bg > div.int_content > section:nth-child(2) > div > ul > li > a')).map(x => x.href)) });

    console.log(titles);
    console.log(links);

    await mainBrowser.close();

    for (let i = 0; i < links.length; i++) {

        const mainItems = [];

        const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: false
        });
        const page = await browser.newPage();

        await page.goto(`${links[i]}`, {
            waitUntil: "domcontentloaded",
        });

        const pages = await page.evaluate(() => {
            const nameDiv = document.querySelector('#right-panel > div.pagination > ul > li:nth-last-child(2) > a');
            if (nameDiv) {
                return nameDiv.textContent;
            } else {
                return " ";
            }
        });

        await browser.close();

        for (let j = 1; j <= pages; j++) {

            const subBrowser = await puppeteer.launch({
                headless: false,
                defaultViewport: false
            });
            const subPage = await subBrowser.newPage();

            await subPage.goto(`${links[i]}/${j}`, {
                waitUntil: "domcontentloaded",
            });

            const mainDiv = await subPage.evaluate(() => { return (Array.from(document.querySelectorAll('#right-panel > div.qa_list')).map(x => x.innerHTML)) });

            const ques = [], option = [], ans = [], exp = [];

            for (let l = 0; l < mainDiv.length; l++) {

                const tagsRegex = /<[^>]*>/g;

                const tabsRegex = /\t/g;

                const cleanString = mainDiv[l].replace(tagsRegex, '').replace(tabsRegex, '').replace(/\n/g, "");

                const questionRegex = /<span class="sno">\d+.<\/span>(.+?)<ul class="options_list clearfix">/;
                const optionsRegex = /<span class="(answer|not-answer) option" alt="\d+"> <a href="javascript: void\(0\)">([A-D])\.<\/a> (.+?)<\/span>/g;
                const answerRegex = /<p>   Answer: (Option [A-D]) <\/p>/;
                const explanationRegex = /Explanation:(.*?)Workspace/g;

                const questionMatch = mainDiv[l].match(questionRegex);
                const question = questionMatch ? questionMatch[1].trim() : null;

                let options = [];
                let optionMatch;
                while ((optionMatch = optionsRegex.exec(mainDiv[l])) !== null) {
                    const alphabet = optionMatch[2];
                    const optionText = optionMatch[3].trim();
                    options.push(`${alphabet}) ${optionText}`);
                }

                const answerMatch = mainDiv[l].match(answerRegex);
                const answer = answerMatch ? answerMatch[1].trim() : null;

                const explanationMatch = explanationRegex.exec(cleanString);
                const explanation = explanationMatch[1].trim();


                ques.push(question);
                option.push(options);
                ans.push(answer);
                exp.push(explanation);
            }

            await subBrowser.close();

            for (let l = 0; l < ques.length; l++) {
                const obj = {
                    question: ques[l],
                    options: option[l],
                    answer: ans[l],
                    explanation: exp[l]
                }

                mainItems.push(obj);
            }

        }

        mcqs.push(mainItems);
    }

    for (let l = 0; l < titles.length; l++) {
        const obj = {
            topic: titles[l],
            mcqs: mcqs[l]
        }

        fullData.push(obj);
    }

    const data = JSON.stringify(fullData);

    fs.writeFile('aptitude_mcq.json', data, (err) => {
        if (err) throw err;
        console.log('DATA EXTRACTED');
    });

})();

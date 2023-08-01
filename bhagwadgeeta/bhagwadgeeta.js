const puppeteer = require('puppeteer');
const fs = require("fs");

(async () => {
    const mainBrowser = await puppeteer.launch({
        headless: false,
        defaultViewport: false
    });
    const mainPage = await mainBrowser.newPage();

    const fullData = [];

    const url = 'https://www.gitasupersite.iitk.ac.in/srimad';

    await mainPage.goto(url, {
        waitUntil: "domcontentloaded",
    });

    const language = await mainPage.evaluate(() => { return (Array.from(document.querySelectorAll('#edit-language > option')).map(x => x.value)) });

    const languageText = await mainPage.evaluate(() => { return (Array.from(document.querySelectorAll('#edit-language > option')).map(x => x.textContent)) });

    const languageContentArray = [];

    await mainBrowser.close();

    for (let i = 0; i < language.length; i++) {

        console.log(language[i]);

        const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: false
        });
        const page = await browser.newPage();

        await page.goto(`${url}?language=${language[i]}`, {
            waitUntil: "domcontentloaded",
        });

        const chapters = await page.evaluate(() => {
            const chaptersDiv = document.querySelectorAll('#edit-field-chapter-value > option');
            return chaptersDiv.length;
        });

        const chaptersArray = [], mainShlokasArray = [];

        for (let j = 1; j <= chapters; j++) {

            await page.goto(`${url}?language=${language[i]}&field_chapter_value=${j}`, {
                waitUntil: "domcontentloaded",
            });

            const shlokas = await page.evaluate(() => {
                const shlokasDiv = document.querySelectorAll('#edit-field-nsutra-value > option');
                return shlokasDiv.length;
            });

            const shlokaArray = [], shlokasArray = [];

            for (let k = 1; k <= shlokas; k++) {

                await page.goto(`${url}?language=${language[i]}&field_chapter_value=${j}&field_nsutra_value=${k}&show_mool=1&show_purohit=1&show_tej=1&httyn=1&etpurohit=1`, {
                    waitUntil: "domcontentloaded",
                });

                const mainShloka = await page.evaluate(() => {
                    const mainShlokaDiv = document.querySelector('#block-system-main > div > div > div.view-content > div > div.custom_display_even > div > div > p:nth-child(3) > font');
                    if (mainShlokaDiv) {
                        return mainShlokaDiv.innerHTML;
                    } else {
                        return " ";
                    }
                });

                const mainShlokaAudio = await page.evaluate(() => {
                    const mainShlokaAudioDiv = document.querySelector('#slkaudio > source');
                    if (mainShlokaAudioDiv) {
                        return mainShlokaAudioDiv.src;
                    } else {
                        return " ";
                    }
                });

                const hindiTranslation = await page.evaluate(() => {
                    const hindiTranslationDiv = document.querySelector('#block-system-main > div > div > div.view-content > div > div.custom_display_odd > div > div > p:nth-child(3) > font');
                    if (hindiTranslationDiv) {
                        return hindiTranslationDiv.innerHTML;
                    } else {
                        return " ";
                    }
                });

                const hindiTranslationAudio = await page.evaluate(() => {
                    const hindiTranslationAudioDiv = document.querySelector('#tejAudio > source');
                    if (hindiTranslationAudioDiv) {
                        return hindiTranslationAudioDiv.src;
                    } else {
                        return " ";
                    }
                });

                const englishTranslation = await page.evaluate(() => {
                    const englishTranslationDiv = document.querySelector('#block-system-main > div > div > div.attachment.attachment-after > div > div > div > div.custom_display_even > div > div > p:nth-child(3) > font');
                    if (englishTranslationDiv) {
                        return englishTranslationDiv.innerHTML;
                    } else {
                        return " ";
                    }
                });

                const englishTranslationAudio = await page.evaluate(() => {
                    const englishTranslationAudioDiv = document.querySelector('#purohitAudio > source');
                    if (englishTranslationAudioDiv) {
                        return englishTranslationAudioDiv.src;
                    } else {
                        return " ";
                    }
                });

                const mainShlokaObj = {
                    mainShloka,
                    mainShlokaAudio
                }

                const hindiShlokaObj = {
                    hindiTranslation,
                    hindiTranslationAudio
                }

                const englishShlokaObj = {
                    englishTranslation,
                    englishTranslationAudio
                }

                const shloka = [
                    mainShlokaObj,
                    hindiShlokaObj,
                    englishShlokaObj
                ]

                shlokaArray.push(shloka);

            }

            for (let l = 0; l < shlokaArray.length; l++) {
                const obj = {
                    shlokaNumber: l + 1,
                    shloka: shlokaArray[l]
                }

                shlokasArray.push(obj);

            }
            mainShlokasArray.push(shlokasArray);

        }

        await browser.close();

        for (let l = 0; l < chapters; l++) {
            const obj = {
                chapter: l+1,
                shlokas: mainShlokasArray[l]
            }
    
            chaptersArray.push(obj);
        }

        languageContentArray.push(chaptersArray);
    }

    for (let l = 0; l < language.length; l++) {
        const obj = {
            language: languageText[l],
            chapters: languageContentArray[l]
        }

        fullData.push(obj);
    }

    const data = JSON.stringify(fullData);

    fs.writeFile('bhagwadgeeta.json', data, (err) => {
        if (err) throw err;
        console.log('DATA EXTRACTED');
    });

})();

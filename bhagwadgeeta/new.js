const puppeteer = require('puppeteer');
const fs = require("fs");
const translate = require('@iamtraction/google-translate');

const splitStringIntoNParts = (str, n) => {
    const len = str.length;
    const partLength = Math.ceil(len / n);
    
    const parts = Array.from({ length: n }, (_, i) =>
      str.slice(i * partLength, i * partLength + partLength)
    );
  
    return parts;
  }

(async () => {

    try{
    const fullData = [];

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: false
    });
    const page = await browser.newPage();

    await page.goto("https://www.dlshq.org/download/bhagavad-gita/#_VPID_27");

    await page.waitForSelector('#page-2622 > div', { timeout: 10000 });

    const text = await page.evaluate(() => {
        const textDiv = document.querySelector('#page-2622 > div');
        if (textDiv) {
            return textDiv.innerHTML;
        } else {
            return " ";
        }
    });

    await browser.close();

    const indiaLanguages = [
        { fullName: 'Hindi', code: 'hi' },
        { fullName: 'Bengali', code: 'bn' },
        { fullName: 'Punjabi', code: 'pa' },
        { fullName: 'Gujarati', code: 'gu' },
        { fullName: 'Tamil', code: 'ta' },
        { fullName: 'Telugu', code: 'te' },
        { fullName: 'Kannada', code: 'kn' },
        { fullName: 'Malayalam', code: 'ml' },
        { fullName: 'Marathi', code: 'mr' },
    ];

    fullData.push({ language: 'English', data: text });

    const parts = splitStringIntoNParts(text, 5);

    console.log(parts[0]);

    for (let i = 0; i < indiaLanguages.length; i++) {

        const newParts = [];

        for(let j = 0; j < parts.length; j++){

            console.log(j);
        const translatedContent = await translate(parts[j], { from: 'en', to: `${indiaLanguages[i].code}` });


        newParts.push(translatedContent.text);
        }

        const newText = newParts.join('');

        const obj = {
            language: indiaLanguages[i].fullName,
            data: newText.replace(/\n/g,"").replace(/\t/g,"")
        };

        fullData.push(obj);

    }

    const data = JSON.stringify(fullData);

    fs.writeFile('extract.json', data, (err) => {
        if (err) throw err;
        console.log('DATA EXTRACTED');
    });
} catch(err){
    console.log(err);
}

})();

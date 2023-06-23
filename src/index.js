import { Selector, test, t } from 'testcafe';
const XLSX = require('xlsx');

//Read xlsx file
const workbook = XLSX.readFile('C:/projects/PT-3935/src/file.xlsx');
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
var data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }).flat();
data.shift();
//data = data.slice(0, 100);
const length = data.length;


//Result xlsx file
const resultFile = XLSX.utils.book_new();
const headers = ['ZKPO', 'Full company name'];
XLSX.utils.sheet_add_aoa(result, [headers], { origin: 'A1' });

//For debug
const dataTest = ['0001348', '00016797', '00032106'];
var result = {};
const startTime = new Date();


//Selectors
const mainSelector = Selector('.bg-white.rounded').nth(1).child('row').nth(0).child('div').nth(1).child('div').nth(1).child('p');
const uniSelector = Selector('div.small.text-black-50').withText('Повна назва').parent('div').child('div').nth(1).child('p');
var h1Selector = Selector('H1');

//Work script
fixture`test`
    .after(async () => {
        console.log(result);
        const resultSheet = XLSX.utils.aoa_to_sheet(Object.entries(result));
        const resultBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(resultBook, resultSheet, 'Sheet1');
        XLSX.writeFile(resultBook, 'output.xlsx');
    });

data.forEach((item, index) => {
    test(`Перегляд сторінки з ${item}`, async () => {
    
        const url = `https://opendatabot.ua/c/${item}`;
        
        await t.navigateTo(url);
        try{
            var h1Text = await h1Selector.innerText
            await t.wait(1500)
            if(h1Text === '404'){
                result[item] = '404';
            } else if(h1Text == '429 Too Many Requests'){
                await t.wait(4000);
                await t.eval(() => location.reload(true));
                var nameText = await uniSelector.innerText;
                result[item] = nameText;
            }
            else {
                var nameText = await uniSelector.innerText;
                result[item] = nameText;
            }
        } catch(error){
            result[item] = 'Невідома помилка';
            console.error('Помилка:', error)
        }
        
    })
    .after(async t => {
        const endTime = new Date()
        console.log((index+1) +'/'+ length + ' = ' + ((index+1)/length*100).toFixed(2) + '%' + ' ' + ((endTime - startTime) / 1000) + 'сек' );
        
    });
});
//console.log(result)
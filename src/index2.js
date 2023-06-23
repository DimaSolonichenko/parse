import { Selector, test, t, ClientFunction } from 'testcafe';
const XLSX = require('xlsx');

//Read xlsx file
const workbook = XLSX.readFile('file.xlsx');
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
var data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }).flat();
data.shift();
data = data.slice(700, 713);
const length = data.length;


//Result xlsx file
const resultFile = XLSX.utils.book_new();
const headers = ['ZKPO', 'Full company name'];
XLSX.utils.sheet_add_aoa(result, [headers], { origin: 'A1' });

//For debug
const dataTest = ['26207129', '0001679', '00032106'];
var result = {};
const startTime = new Date();


//Selectors
const mainSelector = Selector('.bg-white.rounded').nth(1).child('row').nth(0).child('div').nth(1).child('div').nth(1).child('p');
const uniSelector = Selector('div.small.text-black-50').withText('Повна назва').parent('div').child('div').nth(1).child('p');
var h1Selector = Selector('H1');
var searchSelector = Selector('#q-l');
//var tovFullNameSelector = Selector('div').withText('Повне найменування юридичної особи').parent('div.seo-table-row').child('div.seo-table-col-2').child('span')
var tovFullNameSelector = Selector('.seo-table-row').nth(0).child('div.seo-table-col-2').child('span');
var searchButton = Selector('button').withText('Пошук');

//Work script
fixture`test`
    .page('https://youcontrol.com.ua/')
    .after(async () => {
        console.log(result);
        const resultSheet = XLSX.utils.aoa_to_sheet(Object.entries(result));
        const resultBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(resultBook, resultSheet, 'Sheet1');
        XLSX.writeFile(resultBook, 'output1.xlsx');
    });

data.forEach((item, index) => {
    test(`Перегляд сторінки з ${item}`, async () => {
        
        try{
            await t
                .click(searchSelector)
                .typeText(searchSelector, item)
                .click(searchButton);
            var URL = await ClientFunction(() => window.location.href)();
            if (URL.includes('fop_details')){
                var h1Text = await h1Selector.innerText;
                result[item] = h1Text;
                await t.wait(1500)
            }
            else if (URL.includes('company_details')){
                var fullNameText = await tovFullNameSelector.innerText
                result[item] = fullNameText;
                await t.wait(1500)
            }            
            else {
                result[item] = '404';
                await t.wait(1500)
            }
        } catch(error){
            result[item] = 'Невідома помилка';
            console.error('Помилка:', error);
            await t.wait(1500)
        }
        
    })
    .after(async t => {
        if(index%5 == 0)
        {
            const resultSheet = XLSX.utils.aoa_to_sheet(Object.entries(result));
            const resultBook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(resultBook, resultSheet, 'Sheet1');
            XLSX.writeFile(resultBook, 'output1.xlsx');
        }
        const endTime = new Date()
        console.log((index+1) +'/'+ length + ' = ' + ((index+1)/length*100).toFixed(2) + '%' + ' ' + ((endTime - startTime) / 1000) + 'сек' );
        
    });
});
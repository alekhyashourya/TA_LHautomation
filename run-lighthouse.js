const fs = require('fs');
const csvjson = require('csvjson');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const options = require('./optionsconfig.js')

var pathConfig = {};
var file_data = fs.readFileSync('./data/TesturlUpdated.csv', { encoding : 'utf8'});
console.log(file_data);
pathConfig.array = csvjson.toObject(file_data, options);
console.log(pathConfig.array); 
module.exports = pathConfig;
const header = ['requestedUrl', 'finalUrl', 'Overall Performance Category Score', 'First Contentful Paint', 'Time to Interactive', 'Speed Index'];
fs.appendFileSync(`./output/result.csv`, header.toString()+'\n');

(async () => {
  const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
  //Please replace desktop with mobile in 'ops'to switch between 
  const ops = {logLevel: 'info', 
  output: 'csv', 
  onlyCategories: ['performance'], 
  formFactor: options.desktopSettings.formFactor,
  throttling: options.desktopSettings.throttling,
  throttlingMethod: options.desktopSettings.throttlingMethod,
  screenEmulation: options.desktopSettings.screenEmulation,
  emulatedUserAgent: options.desktopSettings.emulatedUserAgent,
  port:chrome.port};
//running lighthouse for each url
  for(let i=0; i<pathConfig.array.length;i++){
    const runnerResult = await lighthouse(pathConfig.array[i].URL, ops);
    //var index= i.toString()

   // var pagename=`lhreport_${index}`;
   //var reporthtml = runnerResult.report
   //fs.appendFileSync(`./output/pagename.html`, reporthtml);

    // `.report` is the csv report as a string
    var out = runnerResult.report.split(',');
    //output of only desired metrics writing to results.csv
    for(let j=0; j<header.length;j++){
        var reportcsv= out[j].toString()+','
    fs.appendFileSync(`./output/result.csv`, reportcsv);
    };
    fs.appendFileSync(`./output/result.csv`, '\n');

    // `.lhr` is the Lighthouse Result as a JS object
    console.log('Report is done for', runnerResult.lhr.finalUrl);
    console.log('Performance score was', runnerResult.lhr.categories.performance.score * 100);
  }
 

  await chrome.kill();
})();
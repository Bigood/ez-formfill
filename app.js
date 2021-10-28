const fs = require('fs');

//https://github.com/pimterry/loglevel
var log = require('loglevel');
//https://www.npmjs.com/package/free-proxy
const ProxyList = require('free-proxy');


const puppeteer = require('puppeteer');
//https://www.npmjs.com/package/dotenv
const dotenv = require('dotenv').config();
//https://caolan.github.io/async/v3/docs.html#times
const timesLimit = require('async/timesLimit');

var faker = require('faker/locale/' + process.env.FAKER_LOCALE || "fr");

async function fillForm (iterationNumber, nextIteration) {
  const proxyList = new ProxyList();
  let args = [];

  if (process.env.USE_PROXY_GENERATOR){
    // More on proxying:
    //    https://www.chromium.org/developers/design-documents/network-settings
    //https://github.com/puppeteer/puppeteer/blob/main/examples/proxy.js
    const proxy = await proxyList.random()
    log.warn('Proxy', proxy);
    args.push(`--proxy-server=${proxy.ip}:${proxy.port}`)
    // Use proxy for localhost URLs
    args.push('--proxy-bypass-list=<-loopback>')
  }
  else if (process.env.USE_PROXY_URL) {
    args.push(`--proxy-server=${process.env.USE_PROXY_URL}`)
    // Use proxy for localhost URLs
    args.push('--proxy-bypass-list=<-loopback>')
  }
  log.warn('Iteration #', iterationNumber);
  const browser = await puppeteer.launch({
    args,
  });
  const page = await browser.newPage();
  await page.goto(process.env.URL, {
    waitUntil: 'networkidle2', //https://github.com/puppeteer/puppeteer/blob/v10.4.0/docs/api.md#pagegotourl-options
  });

  var firstName = faker.name.firstName(); // Rowan 
  var lastName = faker.name.lastName(); // Nikolaus
  var email = faker.internet.email(); // Kassandra.Haley@erich.biz
  var phone = faker.phone.phoneNumber("06########"); // 0602020202
  var zip = faker.address.zipCode("#####"); // 23300
  
  log.warn('Profil : ', { firstName, lastName, email, phone, zip });

  try {
    // await page.waitForSelector("#cf-error-details", {timeout: 1000})
    //https://github.com/puppeteer/puppeteer/blob/v10.4.0/docs/api.md#pagewaitforselectorselector-options
    await page.waitForSelector("#nantes_page_new_event_rsvp_form", {timeout: 1000})
  } catch (error) {
    log.error("Interception par Cloudflare. Essayer un autre proxy / VPN")
    let bodyHTML = await page.evaluate(() => document.body.innerHTML);
    log.debug(bodyHTML)
    throw "Interception par Cloudflare"
  }
  //https://blog.antoine-augusti.fr/2019/08/submit-form-puppeteer/
  //https://github.com/puppeteer/puppeteer/blob/v10.4.0/docs/api.md#pagetypeselector-text-options
  await page.type('#event_rsvp_first_name', firstName);
  await page.type('#event_rsvp_last_name', lastName);
  await page.type('#event_rsvp_email', email);
  await page.type('#event_rsvp_mobile_number', phone);
  await page.type('#event_rsvp_submitted_address', zip);
  await page.keyboard.press('Enter');
  
  await page.waitForNavigation();
  log.warn('Navigation à la page ', page.url());
  
  await page.waitForSelector("#flash-share", {visible : true, timeout: 4000})
  let messageFin = await page.evaluate(() => document.body.querySelector("#flash-share h1").innerText);
  log.warn('Message de confirmation :', messageFin);

  await browser.close();
  nextIteration(null, { iterationNumber, firstName, lastName, email, phone, zip })
}


timesLimit(process.env.ITERATIONS || 1, process.env.PARALLEL_ITERATIONS || 2,
  function (n, next) {
    fillForm(n, next);
  }, function(err, result) {
  if(err)
    log.error(err)
  else {

    fs.appendFile('out.log', JSON.stringify(result, null, 2), function (err) {
      if (err) throw err;
      log.warn('Résultat sauvegardé dans out.log');
    });
  }
})
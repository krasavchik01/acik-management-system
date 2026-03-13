const cheerio = require('cheerio');

async function fetchRates() {
  const res = await fetch('https://mig.kz/');
  const html = await res.text();
  const $ = cheerio.load(html);
  
  const rates = {};
  $('.informer tbody tr').each((i, el) => {
    const tds = $(el).find('td');
    if (tds.length === 3) {
      const currency = $(tds[0]).text().trim();
      const buy = $(tds[1]).text().trim();
      const sell = $(tds[2]).text().trim();
      if (currency && buy && sell) {
        rates[currency] = { buy, sell };
      }
    }
  });
  
  console.log(JSON.stringify(rates, null, 2));
}

fetchRates();

const express = require('express');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

dotenv.config();

const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/get-user', async (req, res) => {
  try {
    const userResponse = await fetch('https://randomuser.me/api/');
    const userData = await userResponse.json();
    const user = userData.results[0];

    const userInfo = {
      firstName: user.name.first,
      lastName: user.name.last,
      gender: user.gender,
      profilePicture: user.picture.large,
      age: user.dob.age,
      dob: new Date(user.dob.date).toLocaleDateString(),
      city: user.location.city,
      country: user.location.country,
      fullAddress: `${user.location.street.number} ${user.location.street.name}, ${user.location.city}, ${user.location.state} ${user.location.postcode}, ${user.location.country}`
    };

    // replace your country lookup block with this
let countryInfo = {};
try {
  // try countrylayer name endpoint (smaller, direct match)
  const clRes = await fetch(`https://api.countrylayer.com/v2/name/${encodeURIComponent(userInfo.country)}?access_key=${process.env.COUNTRYLAYER_KEY}`);
  const clData = await clRes.json();
  console.log('countrylayer response for', userInfo.country, clData);

  // clData may be an array (successful) or an error object
  const clEntry = Array.isArray(clData) ? clData[0] : (clData && clData.data ? clData.data[0] : clData);

  const getLanguages = entry => {
    if (!entry || !entry.languages) return null;
    // languages might be [{name:"English"}] or ["English"] depending on API/plan
    if (Array.isArray(entry.languages)) {
      return entry.languages.map(l => (typeof l === 'string' ? l : (l.name || l.nativeName || JSON.stringify(l)))).join(', ');
    }
    // sometimes languages is an object (restcountries v3 shape handled later)
    return null;
  };

  const getCurrencies = entry => {
    if (!entry || !entry.currencies) return null;
    if (Array.isArray(entry.currencies)) {
      return entry.currencies.map(c => (c.name ? `${c.name} (${c.code || ''})`.trim() : (typeof c === 'string' ? c : JSON.stringify(c)))).join(', ');
    }
    return null;
  };

  if (clEntry && !clEntry.error) {
    countryInfo = {
      name: clEntry.name || 'N/A',
      capital: clEntry.capital || 'N/A',
      languages: getLanguages(clEntry) || 'N/A',
      currency: getCurrencies(clEntry) || 'N/A',
      flag: clEntry.flag || (clEntry.flags && (clEntry.flags.svg || clEntry.flags.png)) || 'N/A'
    };
  }

  // if countrylayer didn't provide languages/currency/flag, fallback to restcountries
  const missing = !countryInfo.languages || countryInfo.languages === 'N/A'
                || !countryInfo.currency || countryInfo.currency === 'N/A'
                || !countryInfo.flag || countryInfo.flag === 'N/A';

  if (missing) {
    console.log('Partial/missing data from countrylayer, falling back to restcountries.com');
    const rcRes = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(userInfo.country)}?fullText=true`);
    const rcData = await rcRes.json();
    const rc = Array.isArray(rcData) ? rcData[0] : rcData;

    countryInfo = {
      name: countryInfo.name !== 'N/A' ? countryInfo.name : (rc?.name?.common || 'N/A'),
      capital: countryInfo.capital !== 'N/A' ? countryInfo.capital : ((rc?.capital && rc.capital[0]) || 'N/A'),
      languages: countryInfo.languages !== 'N/A' ? countryInfo.languages : (rc?.languages ? Object.values(rc.languages).join(', ') : 'N/A'),
      currency: countryInfo.currency !== 'N/A' ? countryInfo.currency : (rc?.currencies ? Object.entries(rc.currencies).map(([code, obj]) => `${obj.name} (${code})`).join(', ') : 'N/A'),
      flag: countryInfo.flag !== 'N/A' ? countryInfo.flag : (rc?.flags?.svg || rc?.flags?.png || 'N/A')
    };
  }

} catch (err) {
  console.error('Country lookup error:', err);
  countryInfo = { name: 'N/A', capital: 'N/A', languages: 'N/A', currency: 'N/A', flag: 'N/A' };
}


    
    let currencyCode = 'USD'; 
    if (countryInfo.currency && countryInfo.currency.match(/\((.*?)\)/)) {
      currencyCode = countryInfo.currency.match(/\((.*?)\)/)[1];
    }

    
    let exchangeRates = { usd: 'N/A', kzt: 'N/A' };
    try {
      const exchangeResponse = await fetch(`https://v6.exchangerate-api.com/v6/${process.env.EXCHANGERATE_API_KEY}/latest/${currencyCode}`);
      const exchangeData = await exchangeResponse.json();
      if (exchangeData.result === 'success') {
        exchangeRates = {
          usd: exchangeData.conversion_rates.USD || 'N/A',
          kzt: exchangeData.conversion_rates.KZT || 'N/A'
        };
      }
    } catch (error) {
      console.error('Exchange Rate API error:', error);
    }

    
    let newsArticles = [];
    try {
      const newsResponse = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(userInfo.country)}&searchIn=title&language=en&pageSize=5&apiKey=${process.env.NEWS_API_KEY}`);
      const newsData = await newsResponse.json();
      if (newsData.status === 'ok' && newsData.articles) {
        newsArticles = newsData.articles.map(article => ({
          title: article.title || 'N/A',
          image: article.urlToImage || '',
          description: article.description || 'N/A',
          url: article.url || '#'
        }));
      }
    } catch (error) {
      console.error('News API error:', error);
    }

    
    res.json({
      user: userInfo,
      country: countryInfo,
      exchange: { currencyCode, ...exchangeRates },
      news: newsArticles
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
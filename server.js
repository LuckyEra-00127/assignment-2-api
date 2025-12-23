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

    let countryInfo = {};
    try {
      const countryResponse = await fetch(`https://api.countrylayer.com/v2/all?access_key=${process.env.COUNTRYLAYER_KEY}`);
      const countryData = await countryResponse.json();
      if (Array.isArray(countryData)) {
        const matchedCountry = countryData.find(c => c.name.toLowerCase() === userInfo.country.toLowerCase());
        if (matchedCountry) {
          countryInfo = {
            name: matchedCountry.name || 'N/A',
            capital: matchedCountry.capital || 'N/A',
            languages: matchedCountry.languages ? matchedCountry.languages.map(lang => lang.name).join(', ') : 'N/A',
            currency: matchedCountry.currencies ? matchedCountry.currencies.map(curr => `${curr.name} (${curr.code})`).join(', ') : 'N/A',
            flag: matchedCountry.flag || 'N/A'
          };
        } else {
          countryInfo = { name: 'N/A', capital: 'N/A', languages: 'N/A', currency: 'N/A', flag: 'N/A' };
        }
      } else {
        countryInfo = { name: 'N/A', capital: 'N/A', languages: 'N/A', currency: 'N/A', flag: 'N/A' };
      }
    } catch (error) {
      console.error('Countrylayer API error:', error);
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
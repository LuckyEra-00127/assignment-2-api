document.getElementById('getUserBtn').addEventListener('click', async () => {
  const contentDiv = document.getElementById('content');
  contentDiv.innerHTML = '<p>Loading...</p>';

  try {
    const response = await fetch('/get-user');
    if (!response.ok) throw new Error('Failed to fetch data');
    const data = await response.json();

    let html = '';

    html += `
      <div class="card">
        <h2>User Profile</h2>
        <img src="${data.user.profilePicture}" alt="Profile Picture" class="profile-img">
        <p><strong>First Name:</strong> ${data.user.firstName}</p>
        <p><strong>Last Name:</strong> ${data.user.lastName}</p>
        <p><strong>Gender:</strong> ${data.user.gender}</p>
        <p><strong>Age:</strong> ${data.user.age}</p>
        <p><strong>Date of Birth:</strong> ${data.user.dob}</p>
        <p><strong>City:</strong> ${data.user.city}</p>
        <p><strong>Country:</strong> ${data.user.country}</p>
        <p><strong>Full Address:</strong> ${data.user.fullAddress}</p>
      </div>
    `;

    html += `
      <div class="card">
        <h2>Country Information</h2>
        <p><strong>Name:</strong> ${data.country.name}</p>
        <p><strong>Capital:</strong> ${data.country.capital}</p>
        <p><strong>Languages:</strong> ${data.country.languages}</p>
        <p><strong>Currency:</strong> ${data.country.currency}</p>
        <img src="${data.country.flag}" alt="National Flag" class="flag-img">
      </div>
    `;

    html += `
      <div class="card">
        <h2>Exchange Rates</h2>
        <p>1 ${data.exchange.currencyCode} = ${data.exchange.usd} USD</p>
        <p>1 ${data.exchange.currencyCode} = ${data.exchange.kzt} KZT</p>
      </div>
    `;

    html += '<div class="news-section"><h2>News Headlines</h2>';
    if (data.news.length === 0) {
      html += '<p>No news articles found.</p>';
    } else {
      data.news.forEach(article => {
        html += `
          <div class="news-card">
            <h3>${article.title}</h3>
            ${article.image ? `<img src="${article.image}" alt="News Image" class="news-img">` : ''}
            <p>${article.description}</p>
            <a href="${article.url}" target="_blank">Read Full Article</a>
          </div>
        `;
      });
    }
    html += '</div>';

    contentDiv.innerHTML = html;
  } catch (error) {
    contentDiv.innerHTML = `<p>Error: ${error.message}</p>`;
  }
});
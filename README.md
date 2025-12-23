# Assignment 2: API Integration

## Overview
This project integrates multiple APIs to fetch and display information about a random user, their country details, currency exchange rates, and related news headlines. All API calls are handled on the server-side using Node.js, and the data is displayed on a responsive frontend.

Setup Instructions
Clone the repository or unzip the project files.
Install dependencies: `npm install`
Create a `.env` file in the root directory and add your API keys (use `.env.example` as a template):
Sign up for free keys at:
Countrylayer: https://manage.countrylayer.com/signup/free
Exchange Rate API: https://www.exchangerate-api.com/
News API: https://newsapi.org/
Start the server: `npm start`
Open `http://localhost:3000` in your browser.
Click the "Get Random User" button to fetch and display the data.

## API Usage Details
- Random User API: Fetches a random user's personal and location data. Endpoint: `https://randomuser.me/api/`
- Countrylayer API: Retrieves country details by fetching all countries and filtering for the user's country (due to free plan limitations on /name endpoint). 
- Endpoint: `https://api.countrylayer.com/v2/all?access_key=KEY`. Extracts name, capital, languages, currencies, flag.
- Exchange Rate API: Fetches exchange rates for the user's currency against USD and KZT. Endpoint: `https://v6.exchangerate-api.com/v6/KEY/latest/{currencyCode}`.
- News API: Fetches news articles where the title contains the country name, limited to 5 English articles. Endpoint: `https://newsapi.org/v2/everything?q={country}&searchIn=title&language=en&pageSize=5&apiKey=KEY`. This ensures headlines contain the country name as required.

## Key Design Decisions
- Server-Side Processing: All API fetches, parsing, and data cleaning occur on the server to secure API keys and handle logic efficiently.
- Error Handling: Graceful handling of API errors or missing data by displaying 'N/A' or empty sections
- Frontend Display: Uses cards for structured, visually appealing presentation. Responsive design with CSS grid and media queries.
Project Structure: 
- server.js`: Core logic for API integrations and server setup.
- `public/`: Frontend files (HTML, CSS, JS).
No logic in HTML; all dynamic behavior in `app.js`.
- Dependencies: Express for serving, dotenv for environment variables, node-fetch for API calls.
- Improvements: Used /all endpoint for Countrylayer to accommodate free plan restrictions. Removed quotes from News API query for broader matching while using searchIn=title.

This setup ensures a clean, organized, and user-friendly application following best practices.
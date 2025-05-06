const express = require('express');
const { google } = require('googleapis');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// Google OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// Step 1: Redirect user to Google OAuth
app.get('/login', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email'],
  });
  res.redirect(authUrl);
});

// Step 2: Google redirects back to /oauth2callback
app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('Missing authorization code');

  try {
    // Get the tokens using the authorization code
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Initialize OAuth2 and get user information
    const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
    const userInfo = await oauth2.userinfo.get();

    // Redirect to success.html with user data as query parameters
    const userInfoUrl = `/success.html?name=${encodeURIComponent(userInfo.data.name)}&email=${encodeURIComponent(userInfo.data.email)}&picture=${encodeURIComponent(userInfo.data.picture)}`;
    
    res.redirect(userInfoUrl);
  } catch (err) {
    console.error('OAuth error:', err);
    res.status(500).send('Authentication failed: ' + err.message);
  }
});
// Start server
app.listen(port, () => {
  console.log(`Server running at http://dheerendra.tech`);
});


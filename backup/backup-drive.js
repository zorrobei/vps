/* eslint no-console: ['error', { allow: ['log']}] */
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

const backup = {
  type: 'application/x-xz',
  dir: '/backups',
  name: 'backup-' + getCurDate() + '.tar.xz',
  getPath: () => {
    return this.dir + '/' + this.name;
  }
};

// If modifying these scopes, delete your previously saved credentials at ~/.credentials/drive-backup.json
const SCOPES = [
  'https://www.googleapis.com/auth/drive.file'
];
const TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/';
const TOKEN_PATH = TOKEN_DIR + 'backup-drive.json';

// Load client secrets from a local file.
fs.readFile('client_secret.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }

  // Authorize a client with the loaded credentials, then call the Drive API.
  authorize(JSON.parse(content), uploadFile);
});

/** 
 * Convert current date to string.
 */
function getCurDate() {
  let curDate = new Date();

  curDate = curDate.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return curDate;
}

/**
 * Creat an OAuth2 client with the given credentials, and then execute the given callback function
 * 
 * @param {Object} credentials - The authorization client credentials.
 * @param {Function} callback - The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const clientSecret = credentials.installed.client_secret;
  const clientId = credentials.installed.client_id;
  const redirectUrl = credentials.installed.redirect_uris[0];
  const OAuth2 = google.auth.OAuth2;
  const oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client, backup);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then execute the given callback with the authorized OAuth2 client.
 * 
 * @param {google.auth.OAuth2} oauth2Client - The OAuth2 client to get token for.
 * @param {getEventsCallback} callback - The callback to call with the authorized OAuth2 client.
 */
function getNewToken(oauth2Client, callback) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });

  console.log('Authorize this app by visiting this url: ', authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrive access token', err);
        return;
      }

      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client, backup);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 * 
 * @param {Object} token - The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch(err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }

  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Upload file to google drive.
 * 
 * @param {google.auth.OAuth2} auth - An authorized OAuth2 client.
 * @param {Object} file - The file to upload to google drive.
 */
function uploadFile(auth, file) {
  const drive = google.drive('v3');

  drive.files.create({
    auth: auth,
    resource: {
      name: file.name,
      mimeType: file.type
    },
    media: {
      mimeType: file.type,
      body: fs.createReadStream(file.getPath())
    },
    fields: 'id'
  }, function(err, id) {
    if (err) {
      console.log('Error', err);
    } else {
      console.log('File Id: ', id);
    }
  });
}

/* eslint no-console: ['error', { allow: ['log']}] */
var fs = require('fs');
var readline = require('readline');
var { google } = require('googleapis');

var currentDate = getCurDate;
var backup = {
  type: 'application/x-bzip2',
  path: '/backups/backup-' + currentDate() + '.tar.bz2'
};

// If modifying these scopes, delete your previously saved credentials at ~/.credentials/drive-backup.json
var SCOPES = [
  'https://www.googleapis.com/auth/drive.file'
];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'backup-drive.json';

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
  var curDate = new Date();

  curDate = curDate.toJSON().slice(0, 10);
  return curDate;
}

/**
 * Creat an OAuth2 client with the given credentials, and then execute the given callback function
 * 
 * @param {Object} credentials - The authorization client credentials.
 * @param {Function} callback - The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var OAuth2 = google.auth.OAuth2;
  var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

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
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });

  console.log('Authorize this app by visiting this url: ', authUrl);

  var rl = readline.createInterface({
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
  var drive = google.drive('v3');

  drive.files.create({
    auth: auth,
    resource: {
      name: file,
      mimeType: file.type
    },
    media: {
      mimeType: file.type,
      body: fs.createReadStream(file.path)
    },
    fields: 'id'
  }, function(err, file) {
    if (err) {
      console.log('Error', err);
    } else {
      console.log('File Id: ', file.id);
    }
  });
}

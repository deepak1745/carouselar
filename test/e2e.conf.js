exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['specs/e2e/carouselar.js'],
  capabilities: {
    'browserName': 'chrome',
    'chromeOptions': {
      'args': [
        'no-sandbox',
        'no-default-browser-check',
        'no-first-run',
        'disable-default-apps'
      ]
    }
  }
};

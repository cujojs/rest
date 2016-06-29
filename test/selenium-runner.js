'use strict'

var childProcess = require('child_process')
var webdriver = require('selenium-webdriver')
var browserstack = require('browserstack-local')

var capabilities = {
  'browserName': process.env.BROWSER_NAME,
  'browserVersion': process.env.BROWSER_VERSION,
  'browserstack.user': process.env.BROWSERSTACK_USERNAME,
  'browserstack.key': process.env.BROWSERSTACK_ACCESS_KEY,
  'browserstack.localIdentifier': String(Math.random()),
  'project': 'rest.js',
  'build': process.env.TRAVIS_BUILD_NUMBER || ('manual - ' + Date.now())
}

var passed = false

var buster = launchBuster()
var local = new browserstack.Local()
local.start({
  key: capabilities['browserstack.key'],
  localIdentifier: capabilities['browserstack.localIdentifier'],
  forcelocal: 'true'
}, function () {
  console.log('Started BrowserStack')

  var driver = new webdriver.Builder()
    .usingServer('http://hub-cloud.browserstack.com/wd/hub')
    .withCapabilities(capabilities)
    .build()

  driver.get('http://localhost:8080')

  driver.wait(webdriver.until.elementLocated(webdriver.By.css('.stats')), 180e3)
    .getText().then(function (stats) {
      passed = stats.indexOf('Tests OK') === 0
      console.log(stats)
    })

  driver.quit().finally(function () {
    buster.exit()
    local.stop(function () {
      console.log('Stopped BrowserStack')
      setTimeout(function () {
        process.exit(passed ? 0 : 1)
      }, 1e3)
    })
  })
})

function launchBuster () {
  var buster = {}
  var argv = ['static', '-p', '8080', '-e', 'browser']

  childProcess.exec(
    'command -v buster',
    function (error, stdout /*, stderr */) {
      if (error) {
        console.log('Unknown error occurred when running wrapper script.')
      } else {
        var mod = stdout.split('\n')[0]
        var run = childProcess.spawn(mod, argv, { stdio: 'pipe' })
        buster.exit = function () {
          run.kill()
        }
      }
    }
  )

  return buster
}

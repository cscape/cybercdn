const express = require('express')
const crypto = require('crypto')
const pjs = require('./package.json')
const app = express()
const PORT = process.env.PORT || 8080

const sharedSecret = crypto.randomBytes(16)
const initializationVector = crypto.randomBytes(16)
const authTimeout = process.env.AUTH_TIMEOUT * 1000 || 5000
const authCodes = {}
const CENTRAL_DOMAIN = process.env.CENTRAL_DOMAIN
const DOMAINS_LIST = process.env.DOMAINS_LIST || `localhost:${PORT},127.0.0.1:${PORT}`

const genBeacon = (host) => {
  const cipher = crypto.createCipheriv('aes128', sharedSecret, initializationVector)
  let authCode = cipher.update(Date.now().toString(), 'utf8', 'hex')
  authCode += cipher.final('hex')
  return `http://${host}/beacon?auth=${authCode}`
}

app.use((req, res, next) => {
  if (req.hostname === CENTRAL_DOMAIN) {
    const hosts = DOMAINS_LIST.split(',')
    const host = hosts[Math.floor(Math.random() * hosts.length)]
    return res.redirect(genBeacon(host))
  } else next()
})

app.get('/', (req, res) => {
  res.send('This site is operated by Cyberscape. \nContact info@cyberscape.co for more information.')
})

app.get('/robots.txt', (req, res) => {
  res.send('User-agent: *\nDisallow: ')
})

// Do not use in production
// app.get('/devbeacon', (req, res) => {
//   res.send(genBeacon(req.hostname))
// })

app.get('/beacon', (req, res) => {
  const rawAuthCode = req.query.auth
  if (rawAuthCode == null) return res.status(404).send()
  let authCode
  try {
    const decipher = crypto.createDecipheriv('aes128', sharedSecret, initializationVector)
    authCode = decipher.update(rawAuthCode, 'hex', 'utf8')
    authCode += decipher.final('utf8')
  } catch (err) {
    console.log(err)
    return res.status(404).send()
  }
  if (authCodes[authCode] != null) return res.status(404).send()
  const timestamp = parseInt(authCode)
  const range = [Date.now() - authTimeout, Date.now()]
  if (timestamp >= range[0] && timestamp < range[1]) {
    authCodes[authCode] = true
    setTimeout(() => {
      delete authCodes[authCode]
    }, (timestamp + authTimeout) - range[1])
    return res.status(200).json({
      beacon: pjs.version,
      p: timestamp,
      d: Date.now(),
      offset: Date.now() - timestamp
    })
  } else {
    return res.status(404).send()
  }
})

app.use((req, res, next) => {
  return res.status(404).send()
})

const listener = app.listen(PORT, () => {
  console.log('Site listening on port ' + listener.address().port)
})

const https = require('https')
const express = require('express')
const app = express()
const PORT = process.env.PORT || 8080

app.use(function(req, res, next) {
  const proxy = https.request({
    hostname: 'cs-redirect.netlify.com',
    protocol: 'https:',
    path: "/",
    port: 443,
    method: 'GET'
  }, pres => pres.pipe(res))
  
  req.pipe(proxy)
  next()
})

app.use('/', (req, res) => {
  res.header("X-Hello-From", "Miami")
})

const listener = app.listen(PORT, () => {
  console.log('Site listening on port ' + listener.address().port)
})

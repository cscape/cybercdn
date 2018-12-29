const https = require('https')
const express = require('express')
const app = express()
const PORT = process.env.PORT || 8080

app.use((req, res) => {
  res.header("X-Hello-From", "Miami")
  res.redirect(301, "https://cyberscape.co/")
})

const listener = app.listen(PORT, () => {
  console.log('Site listening on port ' + listener.address().port)
})

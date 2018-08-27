const express = require('express')
const app = express()

app.get('/', (req, res) => {
  res.send('This site is operated by Cyberscape. \nContact info@cyberscape.co for more information.')
})

const listener = app.listen(process.env.PORT || 8080, () => {
  console.log('Site listening on port ' + listener.address().port)
})

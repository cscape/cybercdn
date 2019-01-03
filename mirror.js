const app = require('express')()
const PORT = process.env.PORT || 8080

app.use((req, res) => res.header('X-Hello-From', 'Miami')
  .redirect(301, 'https://cyberscape.co/')
)

const listener = app.listen(PORT, () => {
  console.log('Site listening on port ' + listener.address().port)
})

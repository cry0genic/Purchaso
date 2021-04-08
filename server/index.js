const express = require('express');
require('./db/mongoose');
// require routers

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
//app.use(routers)

app.listen(port, () => {
  console.log('Server is up & running on port ' + port);
});

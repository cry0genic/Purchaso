const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/user');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(userRouter);

app.listen(port, () => {
  console.log('Server is up & running on port ' + port);
});

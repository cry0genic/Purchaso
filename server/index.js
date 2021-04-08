const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/user');
const itemRouter = require('./routers/item');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(userRouter);
app.use(itemRouter);

app.listen(port, () => {
  console.log('Server is up & running on port ' + port);
});

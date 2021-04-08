const mongoose = require('mongoose');

mongoose.connect(
  'mongodb+srv://purchaso:purchaso@purchaso.jpmxz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  }
);

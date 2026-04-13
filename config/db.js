const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGOURL)
  .then(() => console.log("db connected"))
  .catch((err) => console.log(err));

module.exports = mongoose.connection;

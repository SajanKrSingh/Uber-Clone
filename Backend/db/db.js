const mongooose = require("mongoose");

function connectToDb() {
  mongooose
    .connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("Database connection successful"))
    .catch((err) => console.log(err));
}

module.exports = connectToDb;

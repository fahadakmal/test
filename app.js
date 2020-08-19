const path = require("path");
const express = require("express");
const app = express();
const mongoose = require("mongoose");

const session = require("express-session");
var MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
var store = new MongoDBStore({
  uri:
    "mongodb+srv://fahad:fahad7700546@cluster0-efc3t.mongodb.net/shop?retryWrites=true&w=majority",
  collection: "sessions",
});
const productControllers = require("./controllers/error");
const User = require("./models/user");
// app.engine('handlebars',expressHbs());
// app.set('view engine','hbs');
const csrfProtection = csrf();
app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

const bodyParser = require("body-parser");
const { use } = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: true,
    store: store,
  })
);
app.use(csrfProtection);
app.use(flash());
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isloggedIn;
  res.locals.csrfToken = req.csrfToken();

  next();
});
app.use("/admin", adminRoutes.routes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(productControllers.get404);

const PORT = process.env.PORT || 3000;
mongoose
  .connect(
    "mongodb+srv://fahad:fahad7700546@cluster0-efc3t.mongodb.net/shop?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then((result) => {
    console.log("connected");
    app
      .listen(PORT, () => console.log(`server is running on port ${PORT}`))
  })
  .catch((err) => {
    console.log(err);
  });

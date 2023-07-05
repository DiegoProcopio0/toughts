const express = require("express");
const exphbs = require("express-handlebars");
const session = require("express-session");
const Filestore = require("session-file-store")(session);
const flash = require("express-flash");

const app = express();

const conn = require("./db/conn");

// Models
const Tought = require("./models/Tought");
const User = require("./models/User");

// Routes
const toughtsRoutes = require("./routes/toughtRoutes");
const authRoutes = require("./routes/authRoutes");

// Controller
const ToughtsController = require("./controllers/ToughtsController");

// template engine
app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

// receber resposta do body
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.json());

//session middleware
app.use(
  session({
    name: "session",
    secret: "nosso_secret",
    resave: false,
    saveUninitialized: false,
    store: new Filestore({
      logFn: function () {},
      path: require("path").join(require("os").tmpdir(), "sessions"),
    }),
    cookie: {
      secure: false,
      maxAge: 3600000,
      expires: new Date(Date.now() + 3600000),
      httpOnly: true,
    },
  })
);

// flash messages
app.use(flash());

// public path
app.use(express.static("public"));

// set session to res
app.use((req, res, next) => {
  if (req.session.userid) {
    res.locals.session = req.session;
  }

  next();
});

// Routes
app.use("/toughts", toughtsRoutes);
app.use("/", authRoutes);

app.get("/", ToughtsController.showToughts);

conn
  .sync({ force: true })
  .then(() => {
    app.listen(3000);
  })
  .catch((error) => console.log(`Não foi possível conectar ${error}`));

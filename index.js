const express = require('express');
const functions = require('firebase-functions');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { requireAuth, checkUser } = require('./middleware/authMiddleware');
const bodyParser = require('body-parser');
// const exifParser = require('exif-parser');
const session = require('express-session');



const app = express();



// middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/css", express.static(path.join(__dirname, "node_modules/bootstrap/dist/css")))
app.use("/bootstrap", express.static(path.join(__dirname, "node_modules/bootstrap/dist/js")))
app.use("/jquery", express.static(path.join(__dirname, "node_modules/jquery/dist")))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));

// view engine
app.set('view engine', 'ejs');

// // Example CORS middleware (adjust origin to your hosted site)
// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', 'https://pixelate-app-de1e6.web.app');
//     res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
//     res.header('Access-Control-Allow-Headers', 'Content-Type');
//     next();
// });

// Example CORS configuration in Express
const corsOptions = {
  origin: 'https://pixelate-app-de1e6.web.app',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Allow cookies to be sent with the request
};

app.use(cors(corsOptions));


// app.use(cors());
app.use(checkUser);
app.use(authRoutes);
app.use(blogRoutes);



const PORT = process.env.PORT || 8080;

app.listen(PORT, () => { console.log(`App is listening on ${PORT}`)})
// exports.app = functions.https.onRequest(app);
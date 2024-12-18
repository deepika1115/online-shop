require('dotenv').config(); 

const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');


const errorController = require('./controllers/error');
const mongoConnect = require('./util/database').mongoConnect;
const session = require('express-session')
const mongoDbSession = require('connect-mongodb-session')(session)
const multer = require('multer')

const flash = require('connect-flash')

const mongoDbStore = new mongoDbSession({
    uri : process.env.MONGODB_URI,
    collection : 'sessions'
})

const User = require('./models/user')

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'images')
    },
    filename: function (req, file, cb) {
      const fileName = Date.now() + '-' + file.originalname;
      cb(null, fileName)
    }
  })

function fileFilter (req,file,cb) {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
        cb(null, true);
    }else{
        cb(null,false);
    }   
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({storage : storage, fileFilter : fileFilter}).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(session({secret : '123456789', resave : false, saveUninitialized : false, store : mongoDbStore}))

app.use(flash())


app.use((req,res,next) =>{
    if(req.session.user){
    User.findById(req.session.user._id).then(user=>{
        req.user = new User(user.name, user.email, user.password, user.cart, user._id);
        next();
    }).catch(err=>{
        console.log(err);
    })
    }else{
        next();
    }
})
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isAuthenticated;
    next();
  });

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);


app.use(errorController.get404);

app.use(errorController.get500)

mongoConnect(client => {
    const port = process.env.PORT || 3000
    app.listen(port);
})
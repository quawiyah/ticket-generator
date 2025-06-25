const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
const { resolve } = require('path');
const fileUpload = require('express-fileupload'); 
const methodOverride = require('method-override');
const apiUserRoute = require('./routes/apiUserRoute');
const userRoute = require('./routes/userRoute');
const apiAdminRoute = require('./routes/apiAdminRoute');
const adminRoute = require('./routes/adminRoute');
const session = require('express-session');
const flash = require('./middlewares/flash');
const checkApiAuth = require('./middlewares/checkApiAuth');
const checkAuth = require('./middlewares/checkAuth');

app.use(session({
    secret: "don't share this secret with anyone",
    resave: false,
    saveUninitialized: true,
}));
app.use(flash)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(fileUpload({
    useTempFiles: true,
    createParentPath: true,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
}))

app.use(methodOverride('_method'));

app.set('view engine', 'ejs');
app.set('views', resolve('views'));
app.use('/uploads', express.static('uploads'));
app.use('/api/user',apiUserRoute)
app.use('/user', userRoute)
app.use('/api/admin', checkApiAuth, apiAdminRoute);
app.use('/admin', checkAuth, adminRoute);

app.get('/login', (req, res) => {
  res.redirect('/user/login'); // or /user/login
});

app.use((req, res, next) => {
  const originalRender = res.render;
  res.render = function (view, options = {}, callback) {
    // Clear flash after rendering
    req.session.flash = null;
    return originalRender.call(this, view, options, callback);
  };
  next();
});

// Error handling middleware (optional but recommended)
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send('Something broke!');
// });

// app._router.stack.forEach((r) => {
//   if (r.route && r.route.path) {
//     console.log('Registered route:', r.route.path);
//   }
// });


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}\nhttp://localhost:${PORT}`);
})
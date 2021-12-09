const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");
app.use(cookieParser());

const urlDatabase = {
  b2xVn2: "http://lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// this code generates a random string up to 6 characters long
const generateRandomString = function() {
  return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 6);
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const users = {
  123: {
    id: '001',
    email: 'g@g.com',
    password: 'abcd'
  }
};

const findUserByEmail = (email) => {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/", (req, res) => {
  res.send("Hello!\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  const templateVars = {
    urls: urlDatabase,
    user: user,
    userId: userId,
  };
  console.log(templateVars);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render('login', templateVars);
});



app.post('/login', (req, res) => {
  // console.log('req.body', req.body);
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(403).send("email and password cannot be blank");
  }

  const user = findUserByEmail(email);
  console.log('user', user);
  
  if (!user) {
    return res.status(403).send("a user with that email does not exist");
  }

  if (user.password !== password) {
    return res.status(403).send('password does not match');
  }
  res.cookie('user_id', user.id);
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
   
  if (!email || !password) {
    return res.status(403).send('Email and Password cannot be blank');
  }
  const user = findUserByEmail(email);
  
  if (user) {
    return res.status(403).send("user already exists with that email");
  }
  const id = Math.floor(Math.random() * 2000) + 1;
  users[id] = {
    id: id,
    email: email,
    password: password
  };
  res.cookie('user_id', id);
  //console.log('userId');
  res.redirect('urls');
});

app.post("/urls/:id", (req,res) => {
  urlDatabase[req.params.id] = req.body.EditField;
  res.redirect('/urls');
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const idToDelete = req.params.shortURL;
  delete urlDatabase[idToDelete];
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  // this is the section that assigns a random string to shortURL, then saves the short/long key pairs to the database
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;

  res.redirect(`/urls/${shortURL}`);
});

// app.post("/login", (req, res) => {
//   res.cookie("user_id", req.body.user_id);
//   res.redirect("/urls");
// });
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});


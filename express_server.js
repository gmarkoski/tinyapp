const express = require("express");
const app = express();
const PORT = 8082;
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const { findUserByEmail } = require('./helpers');

app.set("view engine", "ejs");
app.use(
  cookieSession({
    name: "session",
    keys: ["cookie", "session"]
  }));


// this code generates a random string up to 6 characters long
const generateRandomString = function() {
  return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 6);
};
const bodyParser = require("body-parser");
const res = require("express/lib/response");
app.use(bodyParser.urlencoded({ extended: true }));

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher"
  }
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
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

// ***URL Stuff****

app.get("/urls", (req, res) => {
  const userId = req.session.id;
  const user = users[userId];
  const templateVars = {
    urls: urlDatabase,
    user: user,
  };
  console.log(templateVars);
  res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {                           //had to add in for urls_new to work
    user: users[req.session.id],
  };
  const userID = req.session.id;
  if (!userID) {                                   // if  not logged in, redirect them to login
    res.redirect("/login");
  } else {
    const templateVars = {
      user: users[req.session.id],           // had to add this back in to fix 'user not defined' error
      userID,
    };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.id;
  const user = users[userId];
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]["longURL"],
    user: user,
  };
  const urlBelongsToUser = urlDatabase[req.params.id] && urlDatabase[req.params.id].userID === req.session.id;
  if (urlBelongsToUser === true) {
    res.render("urls_show", templateVars);
  } else {
    res.status(403).send("must be logged in to view");
  }
  
});


app.post("/urls/:id", (req,res) => {
  

  const urlBelongsToUser = urlDatabase[req.params.id] && urlDatabase[req.params.id].userID === req.session.id;
  if (urlBelongsToUser === true) {
    
    res.redirect('/urls');
  } else {
    res.status(403).send("must be logged in to view");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const urlBelongsToUser = urlDatabase[req.params.id] && urlDatabase[req.params.id].userID === req.session.id;
  if (urlBelongsToUser === true) {
    const idToDelete = req.params.shortURL;
    delete urlDatabase[idToDelete];
    res.redirect("/urls");
  } else {
    res.status(403).send("must be logged in to view");
  };
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  // this is the section that assigns a random string to shortURL, then saves the short/long key pairs to the database
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.session.id;
  urlDatabase[shortURL] = {longURL: longURL, userID: userID};
  
  const urlBelongsToUser = urlDatabase[req.params.id] && urlDatabase[req.params.id].userID === req.session.id;
  if (urlBelongsToUser === true) {
    res.redirect('/urls');
  } else {
    res.status(403).send("must be logged in to view");
  }
});

app.get('/urls_new', (req, res) => {
  const userId = req.session.id;
  if (!userId) {
    return res.status(401).send("you are not authorized to be here");
  }

  const user = users[userId];

  if (!user) {
    return res.status(400).send("you have an old cookie. Please create an account or login");
  }

  const templateVars = {
    email: user.email,
  };

  res.render('urls_new', templateVars);
});


//***Register, Login, Logout***/

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.session.id],
  };
  res.render('login', templateVars);
});


app.post('/login', (req, res) => {
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

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("User email or password does not match.");
  }
  req.session.id = user.id;
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
   
  if (!email || !hashedPassword) {
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
    password: hashedPassword,
  };
  req.session.id = id;
  res.redirect('urls');
});


app.post("/logout", (req, res) => {
  req.session.id = null;
  res.redirect("/urls");
});



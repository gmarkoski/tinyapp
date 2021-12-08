const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");


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

// this code '/' requests the homepage
app.get("/", (req, res) => {
  res.send("Hello!\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
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
  const templateVars = { urls: urlDatabase };
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

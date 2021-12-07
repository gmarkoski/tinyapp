const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const generateRandomString = function() {
  return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 6);
};



app.get("/", (req, res) => {
  res.send("Hello!");
});

const bodyParser = require("body-parser");        //add body-parser
app.use(bodyParser.urlencoded({extended: true}));

app.get("/u/:shortURL", (req, res) => {      //redirect the shortURL to the longURL
  let longURL = urlDatabase[req.params.shortURL];
  console.log(req);
  res.redirect(longURL);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// app.post("/urls", (req, res) => {
//   console.log(req.body);                   // Log the POST request body to the console
//   res.send("Ok");         // Respond with 'Ok' (we will replace this) 
// });


app.post("/urls", (req, res) => {
  console.log(req.body);                   // Log the POST request body to the console
  res.send(generateRandomString());         // Respond with generateRandomString()
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console

  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;

  res.redirect(`/urls/${shortURL}`); // Respond with a randomly generated string, using the code we included above
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {shortURL: req.params.shortURL, longURL: req.params.longURL};
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {     //delete the shortURL
  const shortToDelete = req.params.shortURL;
  delete urlDatabase[shortToDelete];
  res.redirect("/urls");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.listen(PORT, () => {       //port active and listening
  console.log(`Example app listening on port ${PORT}!`);
});
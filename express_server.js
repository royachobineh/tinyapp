const express = require("express");
const app = express(); // creating a server using express
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser"); // body-parser allows data (buffer) to be readable
app.use(bodyParser.urlencoded({extended:true}));
const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.set("view engine", "ejs"); // setting the view engine as EJS

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}


// function to genereate a "unique" shortURL (6 characters)
function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req,res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// route to display a table of the URL Database (long and short URLS)
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"]
   };
  res.render("urls_index", templateVars);
});

// route to present the form to the user
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

// route to receive the form submission
app.post("/urls", (req, res) => {
  const newShortUrl = generateRandomString(); // generate a new short URL
  urlDatabase[newShortUrl] = req.body.longURL // add the key value pair to the URL Database
  res.redirect(`/urls/${newShortUrl}`); // redirect to the new URL page
});

// route to display long URL along with short URL (+ link to create new URL)
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
   };
  res.render("urls_show", templateVars);
});

// route to handle shortURL requests, clicking on the shortURL will lead to the longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// route to remove a URL and redirect to the /urls page
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL]; // delete the shortURL property in the database
  res.redirect("/urls");
});

// route to update a URL and redirect to the /urls page
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL; // update the longURL of the shortURL in the database
  res.redirect("/urls");
});

// route to handle a POST to /login and set cookies
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

//(GET-REGISTER)User Registeration from
app.get("/register", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render("register_index", templateVars);
});

// (POST-REGISTER)
app.post("/register", (req, res) => {
  if (req.body.email === '') {
    res.send("Error 404");
  }
  const userInfo = {
    id: generateRandomString(),
    email: req.body.email,
    password: req.body.password
  };
  users[userInfo.id] = userInfo;
  res.cookie("user_id", userInfo.id);
  res.redirect('/urls');
});

// route to handle a POST to /logout and clears the username cookie
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
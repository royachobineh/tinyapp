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

const createUser = function(id, email, password) {
  const user = {
    id,
    email,
    password
  };
  return user;
}

// function to genereate a "unique" shortURL (6 characters)
function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

// Check if the email or the passwords are empty strings.
const checkIfEmptyString = function(email, password) {
  if (email === "" || password === "") {
    return true;
  }
  return false;
}

// HELPER FUNCTION #4
// check to see if an email is already in the users database
const findUserByEmail = function(email) {
  for (const id in users) {
    if (users[id].email === email) {
      return id;
    }
  }
  return false;
}

// check to see if the password given matches the password (same email) in the database
const checkPassword = function(email, password) {
  for (const id in users) {
    if (users[id].email === email && users[id].password === password) {
      return true;
    }
  }
  return false;
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
    userObject: users[req.cookies["user_id"]]
   };
  res.render("urls_index", templateVars);
});

// route to present the form to the user
app.get("/urls/new", (req, res) => {
  const templateVars = {
    userObject: users[req.cookies["user_id"]]
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
    userObject: users[req.cookies["user_id"]]
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
  res.cookie("user_id", userInfo.id);
  res.redirect("/urls");
});

//(GET-REGISTER)User Registeration from
app.get("/register", (req, res) => {
  const templateVars = {
    userObject: users[req.cookies["user_id"]]
  };
  res.render("register_index", templateVars);
});

// (POST-REGISTER)
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  // if email or password is empty, send an error message
  if (checkIfEmptyString(email, password)) {
    return res.status(400).send("Email or Password cannot be empty");
  }
  // if someone registers with existing email, send an error message
  if (findUserByEmail(email)) {
    return res.status(400).send("Email already exists");
  }
  // use the helper function create a user object
  const user = createUser(id, email, password);
  // add the new user object to the users database
  users[id] = user;
  // set user_id cookie contraining the user's newly generated ID
  res.cookie("user_id", id);
  res.redirect("/urls");
});

// route to handle a POST to /logout and clears the username cookie
app.post("/logout", (req, res) => {
  res.cookie("user_id", userInfo.id);
  res.redirect("/urls");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
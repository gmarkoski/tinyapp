const findUserByEmail = (email, users) => {
  for (userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

const urlsForUser = (urlDatabase, userID) => {
  let filteredList = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === userID) {
      filteredList[shortURL] = urlDatabase[shortURL];
    }
  }
  return filteredList;
};



module.exports = { findUserByEmail, urlsForUser };
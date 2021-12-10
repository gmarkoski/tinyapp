const findUserByEmail = (email, users) => {
  for (let userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};


module.exports = { findUserByEmail };
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const validEmails = ["diogo@gmail.com"];
const invalidEmails = ["", "naoexiste", "email@errado", "user@invalido"];
const validPasswords = ["12345"];
const invalidPasswords = ["", "x", "abc"];

function getRandomValidCombo() {
  return {
    email: randomItem(validEmails),
    password: randomItem(validPasswords),
  };
}

function getRandomInvalidCombo() {
  const type = Math.random() < 0.5 ? "email" : "password";
  if (type === "email") {
    return {
      email: randomItem(invalidEmails),
      password: randomItem(validPasswords),
    };
  } else {
    return {
      email: randomItem(validEmails),
      password: randomItem(invalidPasswords),
    };
  }
}

const validCombos = validEmails.map((email) => ({
  email,
  password: validPasswords[0],
}));

const invalidCombos = [
  ...invalidEmails.map((email) => ({ email, password: validPasswords[0] })),
  ...invalidPasswords.map((password) => ({ email: validEmails[0], password })),
];

module.exports = {
  validEmails,
  invalidEmails,
  validPasswords,
  invalidPasswords,
  validCombos,
  invalidCombos,
  getRandomValidCombo,
  getRandomInvalidCombo,
};

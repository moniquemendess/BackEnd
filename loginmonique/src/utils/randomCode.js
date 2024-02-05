// random da un numero entre 0 y 1

const randomCode = () => {
  let code = Math.floor(Math.random() * (999999 - 100000) + 1000000); // coge el numero intero
  return code;
};

module.exports = randomCode;

//! Instalar las librarias de jsonwebtoken
//
// importar la libreria con una const y require
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

//! [PASO 01] creando una function de generar token, con dos paramentros (id,email)
//
const generateToken = (id, email) => {
  // Condicion If (Falta el id o email) lanza el error en la aplicación
  if (!id || !email) {
    throw new Error("Email or id are missing");
  }
  // Utilizamos sign para registranos y le añadimos la expiracion de 1d
  return jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

//! [PASO 02] creando una function de verificar el token, con un paramentro (token)
//
const verifyToken = (token) => {
  if (!token) {
    throw new Error("Token is missing");
  }
  // llamamos a la funcion de verificar el token --> esta funcion se encuentra en util
  return jwt.verify(token, process.env.JWT_SECRET);
};

//! [PASO 03] exports las dos function
module.exports = { generateToken, verifyToken };

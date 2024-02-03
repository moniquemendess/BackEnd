const { upload } = require("../../middleware/files.middleware");
const {
  registerLargo,
  register,
  registerWithRedirect,
  login,
  sendCode,
} = require("../controllers/User.controllers");

const express = require("express");
const UserRoutes = express.Router();

// primeiro aceder la ruta  / middleware uplouad(subir el archivo por la clave image)
UserRoutes.get("/register", upload.single("image"), registerWithRedirect);
UserRoutes.post("/registerUtil", upload.single("image"), register);
UserRoutes.post("/registerLargo", upload.single("image"), registerLargo);

UserRoutes.post("/login", login);

/// ------------------> rutas que pueden ser redirect
UserRoutes.get("/register/sendMail/:id", sendCode); // :id ---> es el nombre del param
module.exports = UserRoutes;

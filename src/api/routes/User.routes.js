const { upload } = require("../../middleware/files.middleware");
const { registerLargo } = require("../controllers/User.controller");
const express = require("express");
const UserRoutes = express.Router();

// primeiro aceder la ruta  / middleware(subir el archivo por la clave image)
UserRoutes.post("/registerLargo", upload.single("image"), registerLargo);
module.exports = UserRoutes;

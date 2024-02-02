// middleware
const { deleteImgCloudinary } = require("../../middleware/files.middleware");

// models
const User = require("../models/User.model");

// utils
const randomCode = require("../../utils/randomCode");

// librarias que vamos utilizar
const nodemailer = require("nodemailer");
const validator = require("validator");
const bcrypt = require("bcrypt");

//!-------------------- REGISTER LARGO  EN CODIGO -----------------------------------
// function async siempre tem 3 paramento request / responsive y next

const registerLargo = async (req, res, next) => {
  // lo primero que vamos hacer capturar la image que previamente hemos subido en el middleware
  let catchImg = req.file?.path; // el optional chaining es para que no rompa en caso de no
  // el path es la URL de cloudinary

  //! Capturar errores por async, utilizando try catch
  /** Hay que meter un try catch por cada sincronia que tengamos de actualización
   * para poder selecionar los errores por forma separada y individualizada
   *
   * la asincronomia de lectura no hace falta que tengan un try catch por cada una de ellas
   */
  // payload se ve o que es enviado por el body //
  try {
    await User.syncIndexes(); // Sincronizamos los index de los elementos unique
    let confirmationCode = randomCode();
    // vamos hacer una destruturing del body para sacar el email y nombre
    const { email, name } = req.body; // lo que enviamos  por la parte del body de la request

    //Vamos a buscar al usuario
    // FindOne verifica si coincide un usuario con el mismo nombre/email
    const UserExist = await User.findOne(
      { email: req.body.email },
      { name: req.body.name }
    );
    // caso si existe,
    if (!UserExist) {
      //! Lo registramos porque no hay coicidencia con un user interno
      const newUser = new User({ ...req.body, confirmationCode }); // nueva estancia siempre new

      // el User ha metido image??
      if (req.file) {
        newUser.image = req.file.patch;
        // si no, sube la imagem por defecto
      } else {
        newUser.image = "https://pic.onlinewebfonts.com/svg/img_181369.png";
      }

      // si hay una nueva asincronia de crear de crear o actualizar hay que meter otro try catch
      // es importe await porque es un metodo asincrono
      try {
        const userSave = await newUser.save();
        return res.status(200).json({ data: userSave });
      } catch (error) {
        return res.status(404).json(error.message);
      }
    } else {
      //! cuando ya exist un usuario con este email y ese name

      if (req.file) deleteImgCloudinary(catchImg); // como habido un error  la img previamente subida se borra de cloudinary
      return res.status(409).json("this user already exist");
    }
  } catch (error) {
    // siempre que hay error general tenemos que borrar la imagen  que ha subido  el middleware
    if (req.file) deleteImgCloudinary(catchImg);
    return next(error);
  }
};

module.exports = { registerLargo };

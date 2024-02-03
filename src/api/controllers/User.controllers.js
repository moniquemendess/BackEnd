//! --------------------------middleware------------------------------------
const { deleteImgCloudinary } = require("../../middleware/files.middleware");

//! ---------------------------- modelos ----------------------------------
const User = require("../models/User.model");

//! ---------------------------- utils ----------------------------------
const randomCode = require("../../utils/randomCode");
const sendEmail = require("../../utils/sendEmail");
const { generateToken } = require("../../utils/token");
//! ------------------------------librerias--------------------------------
const nodemailer = require("nodemailer");
const validator = require("validator");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();
const {
  setTestEmailSend,
  getTestEmailSend,
} = require("../../state/state.data");

//!-------------------- REGISTER LARGO  EN CODIGO -----------------------------------
// function async siempre tem 3 paramento request / responsive y next

const registerLargo = async (req, res, next) => {
  // lo primero que vamos hacer capturar la image que previamente hemos subido en el middleware
  let catchImg = req.file?.path; // el optional chaining es para que no rompa en caso de no
  // el path es la URL de cloudinary// variable de capturar la image

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
      // nueva estancia siempre new
      const newUser = new User({ ...req.body, confirmationCode }); // cuando creamos eso ya tenemos el _id del user

      // el User ha metido image??
      if (req.file) {
        newUser.image = req.file.patch; // image
      } else {
        newUser.image = "https://pic.onlinewebfonts.com/svg/img_181369.png"; //si no hay metido la image,sube la imagem por defecto
      }

      // si hay una nueva asincronia de crear de crear o actualizar hay que meter otro try catch

      // es importe await porque es un metodo asincrono
      try {
        const userSave = await newUser.save(); // save es un metodo que lo que hace es subir el modelo dentro del backend
        if (userSave) {
          //! Enviar el codigo con Nodemailer
          const emailEnv = process.env.EMAIL();
          const password = process.env.PASSWORD();
          // la libraria nodemailer nos dicen como hacer el transporte
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: emailEnv,
              pass: password,
            },
          });
          const mailOptions = {
            from: emailEnv,
            subject: confirmationCode,
            text: `tu codigo  es ${confirmationCode}, gracias por confiar en nosostros ${name}`,
          };
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
              return res.status(404).json({
                user: userSave,
                confirmationCode: "error, resend code",
              });
            }
            console.log("Email sent: " + info.response);
            return res.status(200).json({
              user: userSave,
              confirmationCode,
            });
          });
        }
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

//! -----------------------------------------------------------------------------
//? ----------------------------REGISTER CORTO EN CODIGO ------------------------
//! -----------------------------------------------------------------------------

const register = async (req, res, next) => {
  let catchImg = req.file?.path;
  try {
    await User.syncIndexes();
    let confirmationCode = randomCode();
    const { email, name } = req.body;

    const userExist = await User.findOne(
      { email: req.body.email },
      { name: req.body.name }
    );
    if (!userExist) {
      const newUser = new User({ ...req.body, confirmationCode });
      if (req.file) {
        newUser.image = req.file.path;
      } else {
        newUser.image = "https://pic.onlinewebfonts.com/svg/img_181369.png";
      }

      try {
        const userSave = await newUser.save();

        if (userSave) {
          sendEmail(email, name, confirmationCode);
          setTimeout(() => {
            if (getTestEmailSend()) {
              // el estado ya utilizado lo reinicializo a false
              sendEmail(false);
              return res.status(200).json({
                user: userSave,
                confirmationCode,
              });
            } else {
              setTestEmailSend(false);
              return res.status(404).json({
                user: userSave,
                confirmationCode: "error, resend code",
              });
            }
          }, 1100);
        }
      } catch (error) {
        return res.status(404).json(error.message);
      }
    } else {
      if (req.file) deleteImgCloudinary(catchImg);
      return res.status(409).json("this user already exist");
    }
  } catch (error) {
    if (req.file) deleteImgCloudinary(catchImg);
    return next(error);
  }
};

//! -----------------------------------------------------------------------------
//? ----------------------------REGISTER CON REDIRECT----------------------------
//! -----------------------------------------------------------------------------
const registerWithRedirect = async (req, res, next) => {
  let catchImg = req.file?.path;
  try {
    await User.syncIndexes();
    let confirmationCode = randomCode();
    const { email, name } = req.body;

    const userExist = await User.findOne({ email: email }, { name: name });
    if (!userExist) {
      const newUser = new User({ ...req.body, confirmationCode });
      if (req.file) {
        newUser.image = req.file.path;
      } else {
        newUser.image = "https://pic.onlinewebfonts.com/svg/img_181369.png";
      }

      try {
        const userSave = await newUser.save();
        const PORT = process.env.PORT;
        if (userSave) {
          return res.redirect(
            307,
            `http://localhost:${PORT}/api/v1/users/register/sendMail/${userSave._id}`
          );
        }
      } catch (error) {
        return res.status(404).json(error.message);
      }
    } else {
      if (req.file) deleteImgCloudinary(catchImg);
      return res.status(409).json("this user already exist");
    }
  } catch (error) {
    if (req.file) {
      deleteImgCloudinary(catchImg);
    }
    return next(error);
  }
};

//! -----------------------------------------------------------------------------
//? ------------------CONTRALADORES QUE PUEDEN SER REDIRECT --------------------
//! ----------------------------------------------------------------------------

//!!! esto quiere decir que o bien tienen entidad propia porque se llaman por si mismos por parte del cliente
//! o bien son llamados por redirect es decir son controladores de funciones accesorias

const sendCode = async (req, res, next) => {
  try {
    /// sacamos el param que hemos recibido por la ruta
    /// recuerda la ruta: http://localhost:${PORT}/api/v1/users/register/sendMail/${userSave._id}
    const { id } = req.params;

    /// VAMOS A BUSCAR EL USER POR ID para tener el email y el codigo de confirmacion
    const userDB = await User.findById(id);

    /// ------------------> envio el codigo
    const emailEnv = process.env.EMAIL;
    const password = process.env.PASSWORD;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailEnv,
        pass: password,
      },
    });

    const mailOptions = {
      from: emailEnv,
      to: userDB.email,
      subject: "Confirmation code",
      text: `tu codigo es ${userDB.confirmationCode}, gracias por confiar en nosotros ${userDB.name}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return res.status(404).json({
          user: userDB,
          confirmationCode: "error, resend code",
        });
      }
      console.log("Email sent: " + info.response);
      return res.status(200).json({
        user: userDB,
        confirmationCode: userDB.confirmationCode,
      });
    });
  } catch (error) {
    return next(error);
  }
};

//----------------------------------------------------------------------------------------------------
//! ---------------------------------LOGIN------------------------------------------------------------
//----------------------------------------------------------------------------------------------------
//! Function de login
const login = async (req, res, next) => {
  try {
    //! nos traemos
    const { email, password } = req.body;
    const userDB = await User.findOne({ email }); // buscar usuario con el email

    if (userDB) {
      // comparamos la contraseña del body con la del user de la DB
      if (bcrypt.compareSync(password, userDB.password)) {
        // si coinciden generamos el token
        const token = generateToken(userDB._id, email);
        // mandamos la respuesta con el token
        return res.status(200).json({
          user: userDB,
          token,
        });
      } else {
        return res.status(404).json("password dont match");
      }
    } else {
      // si no tenemos el usuario el la base de datos
      return res.status(404).json("User no register");
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  registerLargo,
  register,
  sendCode,
  registerWithRedirect,
  login,
};

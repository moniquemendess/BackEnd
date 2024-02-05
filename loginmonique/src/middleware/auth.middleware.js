//! AUTENTIFICACION DE USUARIOS Y USUARIOS-ADMINISTRADORES
//
//! [Paso 01] Importamos las function y las librarias

const User = require("../api/models/User.model");
const { verifyToken } = require("../utils/token");
const dotenv = require("dotenv");
dotenv.config();

//! [Paso 02] Crear la function de autentificación de user
// req: request(solicitación/requisición) // resp: responsive(respuesta) // next: proximo
//function assíncrona
const isAuth = async (req, res, next) => {
  //! [Paso 03] Quitamos el prefijo "Bearer" del token
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    //! [Paso 04] Verificamos si hay un token presente
    return next(new Error("Unauthorized")); // Si no hay token, lanzamos un error de "Unauthorized"
  }
  try {
    //! [Paso 05] Decodificamos el token para obtener el ID del usuario
    const decoded = verifyToken(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id); //![Paso 05] Buscamos el usuario en la base de datos por su ID

    next(); //! [Paso 06] Si todo está bien, continuamos.
  } catch (error) {
    //! [Paso 07] Si hay un error, lo manejamos y lo pasamos al siguiente middleware
    return next(error);
  }
};
//------------------------------------------------------------------------------------------------------------
//!  [Paso 07] Creamos la función de autenticación de administradores
const isAuthAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return next(new Error("Unauthorized"));
  }

  try {
    const decoded = verifyToken(token, process.env.JWT_SECRET);
    console.log(decoded);
    req.user = await User.findById(decoded.id);

    //! -----> La unica diferencia es que comprobamos si es administrador
    if (req.user?.rol !== "admin") {
      return next(new Error("Unauthorized, not admin"));
    }
    next(); // Si es un administrador, continuamos.
  } catch (error) {
    return next(error);
  }
};

//  Exportamos las funciones
module.exports = {
  isAuth,
  isAuthAdmin,
};

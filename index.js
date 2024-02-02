const express = require("express");
const dotenv = require("dotenv");
const { connect } = require("./src/utils/db");

// creamos el servidor web
const app = express();

// vamos a configurar dotenv para poder utilizar las variables d entorno del .env
dotenv.config();

//! conectamos con la base de datos
connect();

//! ---CONFIGURAR CLOUDINARY----

const { configCloudinary } = require("./src/middleware/files.middleware");

configCloudinary();

//! ---VARIABLES CONSTANTES ----> PORT
// el PORT siempre va em mayuscula (constante que no cambia)
const PORT = process.env.PORT;

//!--------- CORS
const cors = require("cors");
app.use(cors());

//!--------- LIMITACIONES DE CANTIDAD EN EL BACK END
// extended siempre FALSE (querystring)
//
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: false }));

//! -----------------> RUTAS
const UserRoutes = require("./src/api/routes/User.routes");
app.use("/api/v1/users/", UserRoutes);

//!--------- GENERAMOS UN ERROR DE CUANDO NO SEE ENCUENTRE LA RUTA
app.use("*", (req, res, next) => {
  const error = new Error("Route not found");
  error.status = 404;
  return next(error);
});

//!--------- CUANDO EL SERVIDOR CRACHEA METEMOS UN 500
app.use((error, req, res) => {
  return res
    .status(error.status || 500)
    .json(error.message || "unexpected error");
});

//! ------------------ ESCUCHAMOS EN EL PUERTO EL SERVIDOR WEB-----

// esto de aqui  nos revela con que tecnologia esta hecho nuestro back
app.disable("x-powered-by");
app.listen(PORT, () =>
  console.log(`Server listening on port 👌🔍 http://localhost:${PORT}`)
);

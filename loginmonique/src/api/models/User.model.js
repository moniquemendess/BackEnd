const bcrypt = require("bcrypt"); // para encryptar información
const validator = require("validator"); // validar información // contraseña y correo eletronico
const mongoose = require("mongoose"); //

// CADA INSTANCIA TERA SU MODELO DE DATO

// esquema de datos
const UserSchema = new mongoose.Schema(
  // vamos a tener la definicion de datos diferentes tipos de claves de obj
  {
    email: {
      type: String, // tipos siempre en mayscusla
      required: true, // quer decir se no me envia, no te dejo continuar
      trim: true, // quita el espacio de ambos lados
      unique: true, // es unico
      validate: [validator.isEmail, "Email not valid"], //caso de no ser un email valido,lanza el error'Email not valid'
    },
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      validate: [validator.isStrongPassword], //minLength: 8, minLowercase:1 ,minUppercase:1, minNumber:1, minSymbols:1
    },
    gender: {
      type: String,
      emun: ["hombre", "mujer", "outros"], //son valores permitidos
      required: true,
    },
    rol: {
      //
      type: String,
      emun: ["adm", "user", "superadmin"],
      default: "user", // user por defecto
    },
    confirmationCode: {
      // codigo de confirmacion
      type: Number,
      required: true,
    },
    check: {
      // saber se el usuario has puesto el codigo correctamente o no// eso se hace una unica vez
      type: Boolean,
      default: false,
    },
    image: {
      // porque no subimos la img y si la URL
      type: String,
    },
    // Cuando relacionamos un modelo con otro lo hacemos con populate y ref a otro modelo
  },
  {
    // timeTamps es la data y hora de la criacion o modificacion
    // nombre en createdAt / updateteAt en el site de cloud mongodb
    timestamps: true,
  }
);
// encryptar la contraseña
// function async , es correr la contraseña y pasear(hash)... haciendo vueltas de encryptar sobre el contraseña,
// maximo 10 vueltas
UserSchema.pre("save", async function (next) {
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next(); // es una forma de hablar con la api para continuar (express) // el next puede lanzar error al log o decir que continuemos
  } catch (error) {
    next("Error hashing password", error); // el next se comunica con el log
  }
});

//El nombre del modelo siempre en mayuscula (nombre de la constante)
// ponemos la definicion de datos UserSchema

const User = mongoose.model("User", UserSchema);

// exportacion sin llaves {} porque solo quiero exportar una function
module.exports = User;

// Con tudo eso ariba, hemos creado el modelo de datos

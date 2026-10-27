const bcrypt = require("bcrypt");

// Cambia esto por tu nueva contraseña
const passwordPlano = "Gota123.";

bcrypt.hash(passwordPlano, 10).then((hash) => {
  console.log("Copia este hash:");
  console.log(hash);
});
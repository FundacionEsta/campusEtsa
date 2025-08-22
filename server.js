const express = require("express");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

const usersFile = path.join(__dirname, "uj.json");
const passFile = path.join(__dirname, "ctr.json");

// Función para leer JSON
function readJSON(file) {
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

// Función para escribir JSON
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Registro
app.post("/register", (req, res) => {
  const { username, email, password } = req.body;
  const users = readJSON(usersFile);
  const passes = readJSON(passFile);

  if (users[username]) {
    return res.json({ message: "El usuario ya existe" });
  }

  // Guardar usuario y correo
  users[username] = { email };
  writeJSON(usersFile, users);

  // Cifrar contraseña con bcrypt
  const hashed = bcrypt.hashSync(password, 10);
  passes[username] = hashed;
  writeJSON(passFile, passes);

  res.json({ message: "Usuario registrado con éxito" });
});

// Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const users = readJSON(usersFile);
  const passes = readJSON(passFile);

  if (!users[username]) {
    return res.json({ message: "Usuario no encontrado" });
  }

  const valid = bcrypt.compareSync(password, passes[username]);
  if (!valid) {
    return res.json({ message: "Contraseña incorrecta" });
  }

  res.json({ message: `Bienvenido, ${username}` });
});

app.listen(3000, () => console.log("Servidor en http://localhost:3000"));

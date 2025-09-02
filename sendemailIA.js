async function enviarCorreo(nombreCompleto, correo) {
  try {
    const templateParams = {
      to_name: nombreCompleto,
      to_email: correo,
      course_name: "IA para no programadores"
    };

    const response = await emailjs.send(
      "service_4cgcj3m",
      "template_9arzj9v",
      templateParams
    );

    console.log("Correo enviado correctamente:", response.status, response.text);
    alert("¡Correo de confirmación enviado al usuario!");
  } catch (error) {
    console.error("Error al enviar el correo:", error);
  }
}

function isValidEmail(email) {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase());
}

async function enviarCorreo(nombreCompleto, correo) {
  if (!isValidEmail(correo)) {
    console.error("Error: La dirección de correo no es válida.");
    alert("Por favor, introduce una dirección de correo electrónico válida.");
    return; // Detiene la ejecución si el correo no es válido
  }

  try {
    const templateParams = {
      to_name: nombreCompleto,
      to_email: correo
    };
    // ... el resto de tu código
  } catch (error) {
    // ...
  }
}
async function   enviarCorreo(nombreCompleto, correo) {
  try {
    const templateParams = {
      to_name: nombreCompleto,
      to_email: correo,
       course_name: "IA  no programadores",
      message: `Hola ${nombreCompleto}, tu inscripción al curso ha sido exitosa. ¡Nos vemos pronto!`
    };

    const response = await emailjs.send(
      "service_4cgcj3m",    // tu ID de servicio
      "template_9arzj9v",   // tu template
      templateParams
    );

    console.log("Correo enviado correctamente:", response.status, response.text);
    alert("¡Correo de confirmación enviado al usuario!");

  } catch (error) {
    console.error("Error al enviar el correo:", error);
    
  }
}

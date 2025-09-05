// Obtener datos del usuario logeado



const SUPABASE_URL = "https://qlsuiwxlrsqgumjbuozk.supabase.co"; 
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsc3Vpd3hscnNxZ3VtamJ1b3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NDIzMDEsImV4cCI6MjA3MTQxODMwMX0.xSnFcsfXGt1SRUee87sprQepocXC7baag1Sc2uhOkQk"; 
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const loggedUser = localStorage.getItem("loggedUser");

// Referencias
const nombreUsuarioInput = document.getElementById("nombreUsuario");
const correoInput = document.getElementById("correo");
const nombreCompletoInput = document.getElementById("nombreCompleto");
const formInscripcion = document.getElementById("formInscripcion");

// Llenar automáticamente el nombre de usuario
if (loggedUser) {
  nombreUsuarioInput.value = loggedUser;
  nombreUsuarioInput.readOnly = true;
} else {
  alert("Debes iniciar sesión para inscribirte");
  window.location.href = "login.html";
}

// Guardar inscripción en Supabase
if (formInscripcion) {
  formInscripcion.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombreCompleto = nombreCompletoInput.value.trim();
  const nombreUsuario = nombreUsuarioInput.value.trim();
  const correo = correoInput.value.trim();

  if (!nombreCompleto || !nombreUsuario || !correo) {
    alert("Por favor completa todos los campos.");
    submitBtn.disabled = false;
    submitBtn.textContent = 'Inscribirme ahora';
    return;
  }
   try {
      // Step 1: Find the user's ID in the 'usuarios' table
      const { data: userData, error: userError } = await supabaseClient
        .from('usuarios')
        .select('id')
        .eq('usuario', nombreUsuario)
        .single();

      if (userError || !userData) {
        throw new Error("No se pudo encontrar el ID del usuario.");
      }

     

     const estudianteId = userData.id;
    // Guardar en Supabase
    const { data: inscripcionData, error:inscripcionError } = await supabaseClient
      .from("recreacion_con_proposito")
      .insert([
        {
          nombre_completo: nombreCompleto,
          nombre_usuario: nombreUsuario,
          correo: correo,
          estudiante_id: estudianteId,
          curso_nombre :"recreacion_con_proposito"
        }
      ]);

   if (inscripcionError) throw inscripcionError;

      alert("¡Inscripción guardada correctamente!");

      // Step 3: Send confirmation email (ONLY if the save was successful)
      await enviarCorreo(nombreCompleto, correo);// <- usar await y async

    // Redirigir después
    window.location.href = "recreacion.html";

  } catch (err) {
    console.error("Error:", err);
    alert("Ocurrió un error... o el usuario ya esta registrado");
     submitBtn.disabled = false;
      submitBtn.textContent = 'Inscribirme ahora';
  }
});
}
const submitBtn = document.querySelector("button[type='submit']");
submitBtn.disabled = true;

enviarCorreo(nombreCompleto, correo).finally(() => {
  submitBtn.disabled = false;
});

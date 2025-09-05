<?php
$host = "db.qlsuiwxlrsqgumjbuozk.supabase.co"; // el host lo encuentras en Project Settings → Database
$port = "5432";
$dbname = "postgres"; // normalmente "postgres"
$user = "postgres";   // usuario de la DB
$password = "ayuda8080Esta"; // está en Supabase → Project Settings → Database

try {
    $conexion = new PDO("pgsql:host=$host;port=$port;dbname=$dbname", $user, $password);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // echo "Conectado correctamente a Supabase!";
} catch (PDOException $e) {
    echo "Error de conexión: " . $e->getMessage();
}
?>

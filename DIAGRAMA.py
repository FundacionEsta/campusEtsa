from graphviz import Digraph

# Crear el diagrama
dot = Digraph(comment="Arquitectura Campus ETSA", format="png")

# Frontend
dot.node("FE", "Frontend (HTML, CSS, JS, Tailwind)", shape="box", style="filled", fillcolor="#ADD8E6")

# Backend
dot.node("BE", "Backend (Java Spring Boot o Node.js Express)", shape="box", style="filled", fillcolor="#90EE90")

# Base de datos
dot.node("DB", "Base de Datos (PostgreSQL/MySQL)", shape="cylinder", style="filled", fillcolor="#FFD580")

# Servicios externos
dot.node("SMTP", "Servicio de correo (SendGrid / SMTP Gmail)", shape="box", style="filled", fillcolor="#FFB6C1")
dot.node("Excel", "Módulo carga Excel (SheetJS / Apache POI)", shape="box", style="filled", fillcolor="#DDA0DD")

# Hosting
dot.node("GH", "GitHub Pages (Frontend)", shape="box", style="filled", fillcolor="#87CEFA")
dot.node("Cloud", "Render / Railway / Heroku (Backend)", shape="box", style="filled", fillcolor="#F0E68C")

# Relaciones
dot.edges([("FE", "BE"), ("BE", "DB")])
dot.edge("BE", "SMTP", label="Enviar correos")
dot.edge("BE", "Excel", label="Procesar horarios")
dot.edge("FE", "GH", label="Deploy")
dot.edge("BE", "Cloud", label="Deploy")
dot.edge("Cloud", "DB", label="Conexión segura")
dot.edge("GH", "FE", style="dotted")
dot.edge("FE", "Excel", label="Subida de archivos", style="dotted")

# Guardar y renderizar
output_path = '/mnt/data/arquitectura_campus_etsa'
dot.render(output_path, cleanup=True)

output_path + ".png"

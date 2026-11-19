-- SOLO BASE DE AUDITORÍA AISLADA. NO EJECUTAR SOBRE PRODUCCIÓN.
-- Requiere las seis migraciones y el catálogo inicial de etiquetas.
-- Es una muestra reproducible, no un script idempotente ni una migración PHP.
INSERT INTO noticias (titulo, contenido, estado, fecha_publicacion, imagen) VALUES
('AUDIT_PUBLICO_Noticia visible', 'Texto completo de prueba para verificar la lectura de noticias.', 'publicado', NOW() - INTERVAL '1 day', '/uploads/noticias/audit.webp'),
('AUDIT_BORRADOR_No publicar', 'Contenido reservado de prueba.', 'borrador', NOW(), NULL),
('AUDIT_FUTURO_No publicar', 'Contenido futuro de prueba.', 'publicado', NOW() + INTERVAL '30 days', NULL);

INSERT INTO comunicados (titulo, descripcion, tipo, estado, fecha_publicacion) VALUES
('AUDIT_COMUNICADO_Urgente', 'Texto de comunicado que debe mostrarse al ciudadano.', 'urgente', 'publicado', NOW());

INSERT INTO noticias_tags (noticia_id, tag_id)
SELECT n.id, t.id FROM noticias n CROSS JOIN tags t
WHERE n.titulo LIKE 'AUDIT_%' AND t.slug = 'institucional';

INSERT INTO administrativos (nombre, cargo, area) VALUES
('Persona de prueba A', 'Cargo de prueba', 'Administración'),
('Persona de prueba B', 'Cargo de prueba', 'Administración');

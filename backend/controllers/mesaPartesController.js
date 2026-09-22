const db = require('../config/db');
const path = require('path');
const nodemailer = require('nodemailer');
const logger = require('../config/logger');
const { createNotification } = require('../utils/notifier');
const { logActivity } = require('../utils/activityLogger');

// ── Configurar transporte de correo (Gmail) ─────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── Helper: Enviar correo de CONFIRMACIÓN ───────────────────────────────
const enviarCorreoConfirmacion = async ({ correo, nombres_completos, asunto, codigo_seguimiento }) => {
  if (!correo) return;
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: correo,
      subject: `✅ Trámite Registrado: ${codigo_seguimiento} — Mesa de Partes I.E. Bandera del Perú`,
      html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #1e3a8a, #1e40af); padding: 40px 32px; text-align: center;">
              <h1 style="color: white; font-size: 24px; margin: 0; font-weight: 900; letter-spacing: -0.5px;">I.E. Emblemática Bandera del Perú</h1>
              <p style="color: #93c5fd; margin-top: 8px; font-size: 14px;">Mesa de Partes Virtual</p>
          </div>
          <div style="padding: 40px 32px; background: #fff;">
              <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px 24px; margin-bottom: 32px;">
                  <p style="color: #15803d; font-weight: 900; font-size: 16px; margin: 0 0 4px;">¡Su trámite ha sido registrado exitosamente!</p>
                  <p style="color: #16a34a; font-size: 13px; margin: 0;">Le notificaremos por este medio ante cualquier actualización de estado.</p>
              </div>
              <p style="color: #374151; font-size: 15px;">Estimado/a <strong>${nombres_completos}</strong>,</p>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">Su solicitud ha sido recibida con éxito en nuestra Mesa de Partes Virtual. A continuación encontrará el detalle de su expediente:</p>
              <table style="width: 100%; border-collapse: collapse; margin: 24px 0; border-radius: 12px; overflow: hidden;">
                  <tr>
                      <td style="background: #f8fafc; padding: 14px 20px; font-size: 12px; color: #6b7280; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; width: 40%;">Código de Seguimiento</td>
                      <td style="background: #f8fafc; padding: 14px 20px; font-size: 15px; color: #1e3a8a; font-weight: 900;">${codigo_seguimiento}</td>
                  </tr>
                  <tr>
                      <td style="padding: 14px 20px; font-size: 12px; color: #6b7280; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-top: 1px solid #f1f5f9;">Asunto</td>
                      <td style="padding: 14px 20px; font-size: 14px; color: #374151; font-weight: 600; border-top: 1px solid #f1f5f9;">${asunto}</td>
                  </tr>
                  <tr>
                      <td style="background: #f8fafc; padding: 14px 20px; font-size: 12px; color: #6b7280; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-top: 1px solid #f1f5f9;">Estado Actual</td>
                      <td style="background: #f8fafc; padding: 14px 20px; border-top: 1px solid #f1f5f9;"><span style="background: #fef3c7; color: #92400e; font-size: 12px; font-weight: 800; padding: 4px 12px; border-radius: 999px; text-transform: uppercase;">Pendiente</span></td>
                  </tr>
              </table>
              <p style="color: #9ca3af; font-size: 12px; line-height: 1.6;">⏰ Puede acudir a nuestra mesa de partes virtual en el horario de atención (Lun–Vie 8:00 AM – 2:00 PM) para más consultas, o usar su código de seguimiento en la página web.</p>
          </div>
          <div style="background: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">I.E. Emblemática Bandera del Perú — Mesa de Partes Virtual</p>
              <p style="color: #cbd5e1; font-size: 11px; margin: 4px 0 0;">Este correo es generado automáticamente, por favor no responda a este mensaje.</p>
          </div>
      </div>
      `,
    });
    logger.info(`📧 Correo de confirmación enviado a: ${correo}`);
  } catch (err) {
    logger.warn('⚠️ No se pudo enviar correo de confirmación', { message: err.message });
  }
};

// ── Helper: Enviar correo de RESOLUCIÓN ─────────────────────────────────
const enviarCorreoResolucion = async ({ correo, nombres_completos, asunto, codigo_seguimiento, estado }) => {
  if (!correo) return;
  const estadoLabel = { pendiente: 'Pendiente', en_proceso: 'En Proceso', resuelto: 'Resuelto' }[estado] || estado;
  const estadoColor = { pendiente: '#92400e', en_proceso: '#1e40af', resuelto: '#15803d' }[estado] || '#374151';
  const estadoBg    = { pendiente: '#fef3c7', en_proceso: '#dbeafe', resuelto: '#dcfce7' }[estado]   || '#f3f4f6';
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: correo,
      subject: `📋 Actualización de Estado: ${codigo_seguimiento} — Mesa de Partes I.E. Bandera del Perú`,
      html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #1e3a8a, #1e40af); padding: 40px 32px; text-align: center;">
              <h1 style="color: white; font-size: 24px; margin: 0; font-weight: 900;">I.E. Emblemática Bandera del Perú</h1>
              <p style="color: #93c5fd; margin-top: 8px; font-size: 14px;">Actualización de Estado de Expediente</p>
          </div>
          <div style="padding: 40px 32px; background: #fff;">
              <p style="color: #374151; font-size: 15px;">Estimado/a <strong>${nombres_completos}</strong>,</p>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">Le informamos que el estado de su expediente ha sido actualizado por el equipo de secretaría de nuestra institución.</p>
              <table style="width: 100%; border-collapse: collapse; margin: 24px 0; border-radius: 12px; overflow: hidden;">
                  <tr>
                      <td style="background: #f8fafc; padding: 14px 20px; font-size: 12px; color: #6b7280; font-weight: 700; text-transform: uppercase; width: 40%;">Código</td>
                      <td style="background: #f8fafc; padding: 14px 20px; font-size: 15px; color: #1e3a8a; font-weight: 900;">${codigo_seguimiento}</td>
                  </tr>
                  <tr>
                      <td style="padding: 14px 20px; font-size: 12px; color: #6b7280; font-weight: 700; text-transform: uppercase; border-top: 1px solid #f1f5f9;">Asunto</td>
                      <td style="padding: 14px 20px; font-size: 14px; color: #374151; border-top: 1px solid #f1f5f9;">${asunto}</td>
                  </tr>
                  <tr>
                      <td style="background: #f8fafc; padding: 14px 20px; font-size: 12px; color: #6b7280; font-weight: 700; text-transform: uppercase; border-top: 1px solid #f1f5f9;">Nuevo Estado</td>
                      <td style="background: #f8fafc; padding: 14px 20px; border-top: 1px solid #f1f5f9;"><span style="background: ${estadoBg}; color: ${estadoColor}; font-size: 12px; font-weight: 800; padding: 4px 14px; border-radius: 999px; text-transform: uppercase;">${estadoLabel}</span></td>
                  </tr>
              </table>
              ${estado === 'resuelto' ? `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px 24px;margin-bottom:24px;"><p style="color:#15803d;font-weight:900;margin:0 0 4px;">✅ ¡Su trámite ha sido resuelto!</p><p style="color:#16a34a;font-size:13px;margin:0;">Por favor acérquese a nuestra secretaría general con su DNI para recoger el resultado o la documentación correspondiente.</p></div>` : ''}
          </div>
          <div style="background: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">I.E. Emblemática Bandera del Perú — Mesa de Partes Virtual</p>
          </div>
      </div>
      `,
    });
    logger.info(`📧 Correo de resolución enviado a: ${correo}`);
  } catch (err) {
    logger.warn('⚠️ No se pudo enviar correo de resolución', { message: err.message });
  }
};

// ── 1. Listar todos los trámites (admin) ─────────────────────────────────
const listarTramites = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM mesa_partes ORDER BY fecha_registro DESC');
    res.json(rows);
  } catch (err) {
    logger.error('Error en listarTramites', { message: err.message });
    res.status(500).json({ error: 'Error al obtener trámites' });
  }
};

// ── 2. Enviar un nuevo trámite (público) ────────────────────────────────
const enviarTramite = async (req, res) => {
  const { asunto, nombres_completos, dni, direccion, telefono, correo, fundamentacion } = req.body;

  if (!asunto || !nombres_completos || !dni || !direccion || !telefono || !fundamentacion) {
    return res.status(400).json({ error: 'Los campos marcados son obligatorios' });
  }

  const archivo_adjunto = req.file ? req.file.url_public : null;
  const codigo_seguimiento = `EXP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

  try {
    const { insertId } = await db.query(
      `INSERT INTO mesa_partes
        (codigo_seguimiento, asunto, nombres_completos, dni, direccion, telefono, correo, fundamentacion, archivo_adjunto)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [
        codigo_seguimiento, asunto, nombres_completos, dni,
        direccion, telefono, correo || null, fundamentacion, archivo_adjunto,
      ]
    );

    enviarCorreoConfirmacion({ correo, nombres_completos, asunto, codigo_seguimiento });

    // Notificación para administradores del CMS
    createNotification({
      type: 'mesa_partes',
      title: 'Nuevo trámite registrado',
      message: `${nombres_completos} ingresó el expediente ${codigo_seguimiento}: "${asunto}"`,
      link: '/admin/mesa-partes',
    });

    res.status(201).json({
      mensaje: 'Trámite registrado exitosamente.',
      codigo_seguimiento,
      id: insertId,
    });
  } catch (err) {
    logger.error('Error SQL en enviarTramite', { message: err.message });
    res.status(500).json({ error: 'Error al registrar el trámite' });
  }
};

// ── 2.5 Consultar estado del trámite (público) ──────────────────────────
const consultarTramite = async (req, res) => {
  const { codigo, dni } = req.query;
  if (!codigo || !dni) {
    return res.status(400).json({ error: 'Debe proporcionar el código de expediente y su DNI.' });
  }
  try {
    const { rows } = await db.query(
      `SELECT asunto, estado, fecha_registro, nombres_completos
       FROM mesa_partes WHERE codigo_seguimiento = $1 AND dni = $2`,
      [codigo, dni]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No se encontró ningún trámite con esos datos.' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al consultar trámite' });
  }
};

// ── 3. Actualizar estado de un trámite (admin) ──────────────────────────
const actualizarEstado = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  const estadosValidos = ['pendiente', 'en_proceso', 'resuelto'];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }
  try {
    await db.query('UPDATE mesa_partes SET estado = $1 WHERE id = $2', [estado, id]);

    const { rows } = await db.query(
      'SELECT correo, nombres_completos, asunto, codigo_seguimiento FROM mesa_partes WHERE id = $1',
      [id]
    );
    if (rows.length > 0) {
      enviarCorreoResolucion({ ...rows[0], estado });
    }

    if (req.usuario) {
      logActivity({
        userId: req.usuario.id,
        username: req.usuario.username,
        action: 'editar',
        entityType: 'mesa_partes',
        entityId: id,
        entityTitle: rows[0]?.codigo_seguimiento || `Trámite #${id}`,
        details: `Estado cambiado a ${estado}`,
      });
    }

    res.json({ mensaje: 'Estado actualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
};

// ── 4. Eliminar un trámite ──────────────────────────────────────────────
const eliminarTramite = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows: prevRows } = await db.query(
      'SELECT codigo_seguimiento FROM mesa_partes WHERE id = $1',
      [id]
    );

    await db.query('DELETE FROM mesa_partes WHERE id = $1', [id]);

    if (req.usuario) {
      logActivity({
        userId: req.usuario.id,
        username: req.usuario.username,
        action: 'eliminar',
        entityType: 'mesa_partes',
        entityId: id,
        entityTitle: prevRows[0]?.codigo_seguimiento || `Trámite #${id}`,
      });
    }

    res.json({ mensaje: 'Trámite eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar trámite' });
  }
};

module.exports = { listarTramites, enviarTramite, consultarTramite, actualizarEstado, eliminarTramite };

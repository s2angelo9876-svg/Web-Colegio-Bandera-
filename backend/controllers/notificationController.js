const db = require('../config/db');

/**
 * GET /api/notifications
 * Devuelve las últimas notificaciones (por defecto 20).
 */
exports.getNotifications = async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);

  try {
    const { rows } = await db.query(
      `SELECT id, type, title, message, link, is_read, created_at
       FROM admin_notifications
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );

    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
};

/**
 * GET /api/notifications/unread-count
 * Devuelve el conteo de notificaciones no leídas.
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT COUNT(*)::int AS count
       FROM admin_notifications
       WHERE is_read = FALSE`
    );

    res.json({ count: rows[0]?.count || 0 });
  } catch (err) {
    res.status(500).json({ error: 'Error al contar notificaciones no leídas' });
  }
};

/**
 * PUT /api/notifications/:id/read
 * Marca una notificación específica como leída.
 */
exports.markAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    const { rowCount } = await db.query(
      `UPDATE admin_notifications
       SET is_read = TRUE
       WHERE id = $1`,
      [id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }

    res.json({ message: 'Notificación marcada como leída' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar notificación' });
  }
};

/**
 * PUT /api/notifications/read-all
 * Marca todas las notificaciones pendientes como leídas.
 */
exports.markAllAsRead = async (req, res) => {
  try {
    await db.query(
      `UPDATE admin_notifications
       SET is_read = TRUE
       WHERE is_read = FALSE`
    );

    res.json({ message: 'Todas las notificaciones fueron marcadas como leídas' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar notificaciones' });
  }
};

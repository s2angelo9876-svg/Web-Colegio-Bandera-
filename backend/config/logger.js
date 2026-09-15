const NODE_ENV = process.env.NODE_ENV || 'development';

const levels = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = levels[process.env.LOG_LEVEL] ?? (NODE_ENV === 'production' ? levels.info : levels.debug);

function ts() {
  return new Date().toISOString();
}

function fmt(level, msg, meta) {
  const base = { ts: ts(), level, msg };
  if (meta && Object.keys(meta).length) Object.assign(base, meta);
  return NODE_ENV === 'production' ? JSON.stringify(base) : `[${ts()}] ${level.toUpperCase()}  ${msg}${meta ? ' ' + JSON.stringify(meta) : ''}`;
}

function log(level, msg, meta = {}) {
  if (levels[level] > currentLevel) return;
  const line = fmt(level, msg, meta);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

module.exports = {
  error: (msg, meta) => log('error', msg, meta),
  warn:  (msg, meta) => log('warn', msg, meta),
  info:  (msg, meta) => log('info', msg, meta),
  debug: (msg, meta) => log('debug', msg, meta),
};

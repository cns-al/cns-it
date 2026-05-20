class Logger {
  static info(...args) {
    if (process.env.DEBUG === 'true') {
      console.log('[INFO]', ...args);
    }
  }

  static debug(...args) {
    if (process.env.DEBUG === 'true') {
      console.log('[DEBUG]', ...args);
    }
  }

  static error(...args) {
    console.error('[ERROR]', ...args);
  }

  static warn(...args) {
    console.warn('[WARN]', ...args);
  }
}

export default Logger;

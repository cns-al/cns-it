class Logger {
  static timestamp() {
    return new Date().toISOString();
  }

  static info(...args) {
    if (process.env.DEBUG === 'true') {
      console.log(`[${this.timestamp()}] [INFO]`, ...args);
    }
  }

  static debug(...args) {
    if (process.env.DEBUG === 'true') {
      console.log(`[${this.timestamp()}] [DEBUG]`, ...args);
    }
  }

  static error(...args) {
    console.error(`[${this.timestamp()}] [ERROR]`, ...args);
  }

  static warn(...args) {
    console.warn(`[${this.timestamp()}] [WARN]`, ...args);
  }
}

export default Logger;

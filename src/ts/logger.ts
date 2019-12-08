export default class Logger {
  static debug(msg) {
    console.log('DEBUG ' + new Date().toISOString() + ' ' + msg)
  }
}

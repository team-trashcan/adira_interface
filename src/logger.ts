export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
}

export default class Logger {
  private logLevel: string;

  public constructor(logLevel: string) {
    this.logLevel = logLevel;
  }

  protected timestamp() {
    const now = new Date();
    return `[${now.getHours()}:${now.getMinutes}:${now.getSeconds()}]`;
  }

  public async log(...args: unknown[]) {
    console.log(this.timestamp(), args);
  }

  public async debug(...args: unknown[]) {
    if (this.logLevel === LogLevel.DEBUG) {
      console.log(this.timestamp(), args);
    }
  }
}

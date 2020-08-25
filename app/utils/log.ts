import { LogLevel } from '../types/log';

const LOG_LEVEL: LogLevel = String(process.env.LOG_LEVEL || 'ERROR');

export const logLevels: Record<LogLevel, LogLevel> = {
  SYSTEM: 'SYSTEM',
  ERROR: 'ERROR',
  WARNING: 'WARNING',
  DEBUG: 'DEBUG',
};

export const log = (log: any, level: LogLevel = logLevels.ERROR) => {
  const levelKey = Object.values(logLevels).indexOf(LOG_LEVEL);
  const validKeys = Object.values(logLevels).splice(0, levelKey + 1);
  if (validKeys.indexOf(level) !== -1) {
    console.log(
      `+++ refugee-camp-backend${
        level === logLevels.SYSTEM ? '' : ` ${level}`
      } +++`
    );
    console.log(log);
  }
};

'use strict';

function getFakeLogger() {
  let logs = [];
  function getLogFunction(level) {
    return (message, value) => {
      logs.push({
        level,
        message,
        value,
      });
    };
  }

  return {
    info: getLogFunction('info'),
    warn: getLogFunction('warn'),
    error: getLogFunction('error'),
    debug: getLogFunction('debug'),
    getLogs: () => logs,
    clearLogs: () => logs = [],
  };
}

function messageExists(logger, message) {
  const logs = logger.getLogs();
  const length = logs.length;
  for (let i = 0; i < length; i++) {
    if (logs[i].message === message) {
      return true;
    }
  }
  return false;
}

function getLogsAtLevel(logger, level) {
  const levelLogs = [];
  const logs = logger.getLogs();
  const length = logs.length;
  for (let i = 0; i < length; i++) {
    if (logs[i].level === level) {
      levelLogs.push(logs[i]);
    }
  }
  return levelLogs;
}

module.exports = {
  getFakeLogger,
  getLogsAtLevel,
  messageExists,
};

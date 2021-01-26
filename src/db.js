const Database = require("@replit/database");

const db = new Database();

const listDatabaseValues = (cb) => {
  db.list().then((keys) => {
    keys.forEach((key) => {
      db.get(key).then((value) => {
        cb(`store[${key}]: ${value}`);
      });
    });
  });
};

const getDatabaseValue = async (key) => {
  const value = await db.get(key);
  return value;
};

const setDatabaseValue = (key, newValue, cb) => {
  db.get(key).then((prevValue) => {
    db.set(key, newValue).then((updatedValue) => {
      cb(`store[${key}] changed from ${prevValue} to ${updatedValue}`);
    });
  });
};

const deleteDatabaseValue = (key, cb) => {
  db.get(key).then((prevValue) => {
    db.delete(key).then(() => {
      cb(`store[${key}]: ${prevValue} has been deleted`);
    });
  });
};

const initialDatabaseStore = {
  ready: true,
};

const initialiseDatabase = (cb) => {
  getDatabaseValue("ready", (isReady) => {
    if (isReady) {
      cb("Gonna clear out the trash...");
      db.empty();
      return;
    }
    Object.keys(initialDatabaseStore).forEach((key) => {
      db.set(key, initialDatabaseStore[key]).then(() => {
        cb(`Setting store[${key}] = ${initialDatabaseStore[key]}.`);
      });
    });
  });
};

exports.listDatabaseValues = listDatabaseValues;
exports.getDatabaseValue = getDatabaseValue;
exports.setDatabaseValue = setDatabaseValue;
exports.deleteDatabaseValue = deleteDatabaseValue;
exports.initialiseDatabase = initialiseDatabase;

import { DB, USER, PASSWORD, HOST, dialect as _dialect, logging as _logging, pool as _pool, dialectOptions as _dialectOptions, timezone, production } from "../config/db.config.js";
import Sequelize from "sequelize";
import logsModel from "./logs.model.js";
import dronesModel from "./drones.model.js";
import medicationsModel from "./medications.model.js";

const sequelize = new Sequelize(
    DB,
    USER,
    PASSWORD,
    {
        host: HOST,
        dialect: _dialect,
        logging: _logging,
        operatorsAliases: 0,
        pool: {
            max: _pool.max,
            min: _pool.min,
            acquire: _pool.acquire,
            idle: _pool.idle
        },
        dialectOptions: {
            // useUTC: _dialectOptions.useUTC, 
            dateStrings: _dialectOptions.dateStrings,
            typeCast: _dialectOptions.typeCast
        },
        timezone: timezone
    }
);
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// * Binding models
db.logs = logsModel(sequelize, Sequelize);
db.drones = dronesModel(sequelize, Sequelize);
db.medications = medicationsModel(sequelize, Sequelize);

// Associations
//    - Medications Associations
db.drones.hasMany(db.medications, { foreignKey: 'drone_serial', sourceKey: 'serial_number' });
db.medications.belongsTo(db.drones, { foreignKey: 'drone_serial', targetKey: 'serial_number' });

export default db;

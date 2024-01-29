import dronesModel from "./drones.model.js";

export default (sequelize, Sequelize) => {

	const drones = dronesModel(sequelize, Sequelize);

	const medications = sequelize.define("medication", {
		id: {
			type: Sequelize.BIGINT,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true
		},
		unique_id: {
			type: Sequelize.STRING(40),
			allowNull: false,
			unique: true
		},
		drone_serial: {
			type: Sequelize.STRING(100),
			allowNull: false,
			references: {
				model: drones,
				key: "serial_number"
			}
		},
		name: {
			type: Sequelize.STRING(500),
			allowNull: false,
		},
		weight: {
			type: Sequelize.INTEGER,
			allowNull: false,
		},
		code: {
			type: Sequelize.STRING(200),
			allowNull: false,
		},
		image: {
			type: Sequelize.STRING(500),
			allowNull: false,
		},
		status: {
			type: Sequelize.INTEGER(1),
			allowNull: false,
		}
	}, {
		tableName: 'medications_tbl'
	});
	return medications;
};
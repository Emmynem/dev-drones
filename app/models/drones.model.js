export default (sequelize, Sequelize) => {

	const drones = sequelize.define("drone", {
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
		serial_number: {
			type: Sequelize.STRING(100),
			allowNull: false,
			unique: true
		},
		model: {
			type: Sequelize.STRING(50),
			allowNull: false,
		},
		weight: {
			type: Sequelize.INTEGER,
			allowNull: false,
		},
		battery: {
			type: Sequelize.INTEGER,
			allowNull: false,
		},
		state: {
			type: Sequelize.STRING(20),
			allowNull: false,
		},
		status: {
			type: Sequelize.INTEGER(1),
			allowNull: false,
		}
	}, {
		tableName: 'drones_tbl'
	});
	return drones;
};
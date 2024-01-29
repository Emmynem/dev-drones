import { validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, CreationSuccessResponse, BadRequestError, logger } from '../common/index.js';
import { default_delete_status, default_status, tag_user, random_uuid, generate_serial_number, drone_states } from '../config/config.js';
import db from "../models/index.js";
import { addLog } from './logs.controller.js';

const DRONES = db.drones;
const MEDICATIONS = db.medications;

export function getDrones(req, res) {
	DRONES.findAndCountAll({
		attributes: { exclude: ['id'] },
		order: [
			['createdAt', 'DESC']
		]
	}).then(drones => {
		if (!drones || drones.count === 0) {
			SuccessResponse(res, { unique_id: tag_user, text: "Drones Not found" }, []);
		} else {
			SuccessResponse(res, { unique_id: tag_user, text: "Drones loaded" }, drones);
		}
	}).catch(err => {
		ServerError(res, { unique_id: tag_user, text: err.message }, null);
	});
};

export function getDrone(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_user, text: "Validation Error Occured" }, errors.array())
	} else {
		DRONES.findOne({
			attributes: { exclude: ['id'] },
			where: {
				...payload,
			}
		}).then(drone => {
			if (!drone) {
				NotFoundError(res, { unique_id: tag_user, text: "Drone not found" }, null);
			} else {
				SuccessResponse(res, { unique_id: tag_user, text: "Drone loaded" }, drone);
			}
		}).catch(err => {
			ServerError(res, { unique_id: tag_user, text: err.message }, null);
		});
	}
};

export function getDroneMedications(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_user, text: "Validation Error Occured" }, errors.array())
	} else {
		DRONES.findOne({
			attributes: { exclude: ['id'] },
			where: {
				...payload,
			}
		}).then(drone => {
			if (!drone) {
				NotFoundError(res, { unique_id: tag_user, text: "Drone not found" }, null);
			} else {
				MEDICATIONS.findAndCountAll({
					attributes: { exclude: ['id'] },
					where: {
						drone_serial: drone.serial_number
					},
					order: [
						['createdAt', 'DESC']
					]
				}).then(medications => {
					if (!medications || medications.count === 0) {
						SuccessResponse(res, { unique_id: tag_user, text: `${drone.serial_number} Drone Medications Not found` }, []);
					} else {
						SuccessResponse(res, { unique_id: tag_user, text: `${drone.serial_number} Drone Medications loaded` }, { medications, drone });
					}
				}).catch(err => {
					ServerError(res, { unique_id: tag_user, text: err.message }, null);
				});
			}
		}).catch(err => {
			ServerError(res, { unique_id: tag_user, text: err.message }, null);
		});
	}
};

export function checkDroneBattery(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_user, text: "Validation Error Occured" }, errors.array())
	} else {
		DRONES.findOne({
			attributes: ['battery'],
			where: {
				...payload,
			}
		}).then(drone => {
			if (!drone) {
				NotFoundError(res, { unique_id: tag_user, text: "Drone not found" }, null);
			} else {
				const log_data = {
					action: `[${payload.unique_id}] Drone battery level - ${drone.battery}%`
				};
				addLog(req, res, log_data);
				SuccessResponse(res, { unique_id: tag_user, text: "Drone battery percentage loaded" }, drone);
			}
		}).catch(err => {
			ServerError(res, { unique_id: tag_user, text: err.message }, null);
		});
	}
};

export function checkLoadingDrones(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_user, text: "Validation Error Occured" }, errors.array())
	} else {
		DRONES.findAndCountAll({
			attributes: { exclude: ['id'] },
			where: {
				state: drone_states.loading,
			}
		}).then(drones => {
			if (!drones || drones.count === 0) {
				NotFoundError(res, { unique_id: tag_user, text: "Loading Drones unavailable" }, []);
			} else {
				SuccessResponse(res, { unique_id: tag_user, text: "Loading Drones loaded" }, drones);
			}
		}).catch(err => {
			ServerError(res, { unique_id: tag_user, text: err.message }, null);
		});
	}
};

export async function addDrone(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_user, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const drones = await db.sequelize.transaction((t) => {
				return DRONES.create({
					unique_id: uuidv4(),
					serial_number: generate_serial_number(),
					model: payload.model,
					weight: parseInt(payload.weight),
					battery: parseInt(payload.battery),
					state: drone_states.idle,
					status: default_status
				}, { transaction: t });
			});

			if (drones) {
				const log_data = {
					action: "Created new drone!"
				};
				addLog(req, res, log_data);
				CreationSuccessResponse(res, { unique_id: tag_user, text: "Drone created successfully!" });
			}
		} catch (err) {
			ServerError(res, { unique_id: tag_user, text: err.message }, null);
		}
	}
};

export async function updateDroneDetails(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_user, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const drone = await db.sequelize.transaction((t) => {
				return DRONES.update({
					model: payload.model,
					weight: parseInt(payload.weight),
					battery: parseInt(payload.battery),
					state: payload.state,
				}, {
					where: {
						unique_id: payload.unique_id,
						status: default_status
					}
				}, { transaction: t });
			});

			if (drone > 0) {
				const log_data = {
					action: `Updated drone details! [${payload.unique_id}]`
				};
				addLog(req, res, log_data);
				OtherSuccessResponse(res, { unique_id: tag_user, text: "Drone was updated successfully!" });
			} else {
				BadRequestError(res, { unique_id: tag_user, text: "Error updating drone!" }, null);
			}
		} catch (err) {
			ServerError(res, { unique_id: tag_user, text: err.message }, null);
		}
	}
};

export async function updateDroneModel(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_user, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const drone = await db.sequelize.transaction((t) => {
				return DRONES.update({
					...payload
				}, {
					where: {
						unique_id: payload.unique_id,
						status: default_status
					}
				}, { transaction: t });
			});

			if (drone > 0) {
				const log_data = {
					action: `Updated drone model! [${payload.unique_id}]`
				};
				addLog(req, res, log_data);
				OtherSuccessResponse(res, { unique_id: tag_user, text: "Drone model updated successfully!" });
			} else {
				BadRequestError(res, { unique_id: tag_user, text: "Error updating drone model!" }, null);
			}
		} catch (err) {
			ServerError(res, { unique_id: tag_user, text: err.message }, null);
		}
	}
};

export async function updateDroneWeight(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_user, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const drone = await db.sequelize.transaction((t) => {
				return DRONES.update({
					weight: parseInt(payload.weight)
				}, {
					where: {
						unique_id: payload.unique_id,
						status: default_status
					}
				}, { transaction: t });
			});

			if (drone > 0) {
				const log_data = {
					action: `Updated drone weight! [${payload.unique_id}]`
				};
				addLog(req, res, log_data);
				OtherSuccessResponse(res, { unique_id: tag_user, text: "Drone weight updated successfully!" });
			} else {
				BadRequestError(res, { unique_id: tag_user, text: "Error updating drone weight!" }, null);
			}
		} catch (err) {
			ServerError(res, { unique_id: tag_user, text: err.message }, null);
		}
	}
};

export async function updateDroneBattery(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_user, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const drone = await db.sequelize.transaction((t) => {
				return DRONES.update({
					battery: parseInt(payload.battery)
				}, {
					where: {
						unique_id: payload.unique_id,
						status: default_status
					}
				}, { transaction: t });
			});

			if (drone > 0) {
				const log_data = {
					action: `Updated drone battery! [${payload.unique_id}]`
				};
				addLog(req, res, log_data);
				OtherSuccessResponse(res, { unique_id: tag_user, text: "Drone battery updated successfully!" });
			} else {
				BadRequestError(res, { unique_id: tag_user, text: "Error updating drone battery!" }, null);
			}
		} catch (err) {
			ServerError(res, { unique_id: tag_user, text: err.message }, null);
		}
	}
};

export async function updateDroneState(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_user, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			DRONES.findOne({
				attributes: { exclude: ['id'] },
				where: {
					unique_id: payload.unique_id,
				}
			}).then(async drone => {
				if (!drone) {
					NotFoundError(res, { unique_id: tag_user, text: "Drone not found" }, null);
				} else {
					if (payload.state.toUpperCase() === drone_states.delivered) {
						const medications = await db.sequelize.transaction((t) => {
							return MEDICATIONS.destroy({
								where: {
									drone_serial: drone.serial_number,
									status: default_status
								}
							}, { transaction: t });
						});
						const log_data = {
							action: `Cleared medications in drone [${drone.serial_number}]`
						};
						addLog(req, res, log_data);
					}

					const drone_update = await db.sequelize.transaction((t) => {
						return DRONES.update({
							state: payload.state.toUpperCase() === drone_states.delivered ? drone_states.returning : (payload.state.toUpperCase() === drone_states.loaded ? drone_states.delivering : payload.state.toUpperCase())
						}, {
							where: {
								unique_id: payload.unique_id,
								status: default_status
							}
						}, { transaction: t });
					});
		
					if (drone_update > 0) {
						const log_data = {
							action: `Updated drone state! [${payload.unique_id}]`
						};
						addLog(req, res, log_data);
						OtherSuccessResponse(res, { unique_id: tag_user, text: "Drone state updated successfully!" });
					} else {
						BadRequestError(res, { unique_id: tag_user, text: "Error updating drone state!" }, null);
					}
				}
			}).catch(err => {
				ServerError(res, { unique_id: tag_user, text: err.message }, null);
			});
		} catch (err) {
			ServerError(res, { unique_id: tag_user, text: err.message }, null);
		}
	}
};

export async function deleteDrone(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_user, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			DRONES.findOne({
				attributes: { exclude: ['id'] },
				where: {
					...payload,
				}
			}).then(async drone => {
				if (!drone) {
					NotFoundError(res, { unique_id: tag_user, text: "Drone not found" }, null);
				} else {
					const drone_delete = await db.sequelize.transaction((t) => {
						return DRONES.destroy({
							where: {
								unique_id: payload.unique_id,
								status: default_status
							}
						}, { transaction: t });
					});

					const medications = await db.sequelize.transaction((t) => {
						return MEDICATIONS.destroy({
							where: {
								drone_serial: drone.serial_number,
								status: default_status
							}
						}, { transaction: t });
					});
		
					if (drone_delete > 0) {
						const log_data = {
							action: `Deleted drone ${medications > 0 ? "and medications" : ""} [${payload.unique_id}]!`
						};
						addLog(req, res, log_data);
						OtherSuccessResponse(res, { unique_id: tag_user, text: "Drone was deleted successfully!" });
					} else {
						BadRequestError(res, { unique_id: tag_user, text: "Error deleting drone!" }, null);
					}
				}
			}).catch(err => {
				ServerError(res, { unique_id: tag_user, text: err.message }, null);
			});
		} catch (err) {
			ServerError(res, { unique_id: tag_user, text: err.message }, null);
		}
	}
};

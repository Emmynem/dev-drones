import { validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, CreationSuccessResponse, BadRequestError, logger } from '../common/index.js';
import { default_delete_status, default_status, tag_user, random_uuid, strip_medication_code, strip_medication_name, drone_states } from '../config/config.js';
import db from "../models/index.js";
import { addLog } from './logs.controller.js';

const DRONES = db.drones;
const MEDICATIONS = db.medications;

export function getMedications(req, res) {
	MEDICATIONS.findAndCountAll({
		attributes: { exclude: ['id'] },
		order: [
			['createdAt', 'DESC']
		],
		include: [
			{
				model: DRONES,
				attributes: ['unique_id', 'serial_number', 'model', 'weight', 'battery', 'state']
			}
		]
	}).then(medications => {
		if (!medications || medications.count === 0) {
			SuccessResponse(res, { unique_id: tag_user, text: "Medications Not found" }, []);
		} else {
			SuccessResponse(res, { unique_id: tag_user, text: "Medications loaded" }, medications);
		}
	}).catch(err => {
		ServerError(res, { unique_id: tag_user, text: err.message }, null);
	});
};

export function getMedication(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_user, text: "Validation Error Occured" }, errors.array())
	} else {
		MEDICATIONS.findOne({
			attributes: { exclude: ['id'] },
			where: {
				...payload,
			},
			include: [
				{
					model: DRONES,
					attributes: ['unique_id', 'serial_number', 'model', 'weight', 'battery', 'state']
				}
			]
		}).then(medication => {
			if (!medication) {
				NotFoundError(res, { unique_id: tag_user, text: "Medication not found" }, null);
			} else {
				SuccessResponse(res, { unique_id: tag_user, text: "Medication loaded" }, medication);
			}
		}).catch(err => {
			ServerError(res, { unique_id: tag_user, text: err.message }, null);
		});
	}
};

export async function addMedication(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_user, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			DRONES.findOne({
				attributes: { exclude: ['id'] },
				where: {
					serial_number: payload.drone_serial,
				}
			}).then(async drone => {
				if (!drone) {
					NotFoundError(res, { unique_id: tag_user, text: "Drone not found" }, null);
				} else {
					if (drone.battery < 25) {
						const drone_update = await db.sequelize.transaction((t) => {
							return DRONES.update({
								state: drone_states.loaded
							}, {
								where: {
									serial_number: payload.drone_serial,
									status: default_status
								}
							}, { transaction: t });
						});

						BadRequestError(res, { unique_id: tag_user, text: `Drone already ${drone_states.loaded}` }, null);
					} else {
						if (drone.state.toUpperCase() === drone_states.idle || drone.state.toUpperCase() === drone_states.loading) {
							const medications = await db.sequelize.transaction((t) => {
								return MEDICATIONS.create({
									unique_id: uuidv4(),
									drone_serial: payload.drone_serial,
									name: strip_medication_name(payload.name),
									weight: parseInt(payload.weight),
									code: strip_medication_code(payload.code),
									image: payload.image,
									status: default_status
								}, { transaction: t });
							});
	
							if (drone.state.toUpperCase() === drone_states.idle) {
								const drone_update = await db.sequelize.transaction((t) => {
									return DRONES.update({
										state: drone_states.loading
									}, {
										where: {
											serial_number: payload.drone_serial,
											status: default_status
										}
									}, { transaction: t });
								});
							} 
				
							if (medications) {
								const log_data = {
									action: `Added medication to [${payload.drone_serial}] drone!`
								};
								addLog(req, res, log_data);
								CreationSuccessResponse(res, { unique_id: tag_user, text: "Medication added successfully!" });
							}
							
						} else {
							BadRequestError(res, { unique_id: tag_user, text: `Drone already ${drone.state.toUpperCase()}` }, null);
						}
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

export async function removeMedication(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_user, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const medication_delete = await db.sequelize.transaction((t) => {
				return MEDICATIONS.destroy({
					where: {
						unique_id: payload.unique_id,
						status: default_status
					}
				}, { transaction: t });
			});

			if (medication_delete > 0) {
				const log_data = {
					action: `Removed medication [${payload.unique_id}]!`
				};
				addLog(req, res, log_data);
				OtherSuccessResponse(res, { unique_id: tag_user, text: "Medication was removed successfully!" });
			} else {
				BadRequestError(res, { unique_id: tag_user, text: "Error removing medication!" }, null);
			}
		} catch (err) {
			ServerError(res, { unique_id: tag_user, text: err.message }, null);
		}
	}
};
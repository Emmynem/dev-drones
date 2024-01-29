import { check } from 'express-validator';
import db from "../models/index.js";
import { default_status, max_drone_weight } from '../config/config.js';

const MEDICATIONS = db.medications;
const DRONES = db.drones;
const sequelize = db.sequelize;

export const medications_rules = {
	forFindingMedication: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return MEDICATIONS.findOne({
					where: {
						unique_id,
						status: default_status
					}
				}).then(data => {
					if (!data) return Promise.reject('Medication not found!');
				});
			})
	],
	forFindingViaSerialNumber: [
		check('serial_number', "Serial Number is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(serial_number => {
				return DRONES.findOne({ where: { serial_number: serial_number, status: default_status } }).then(data => {
					if (!data) return Promise.reject('Drone not found!');
				});
			}),
	],
	forAdding: [
		check('drone_serial', "Drone Serial is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(drone_serial => {
				return DRONES.findOne({ where: { serial_number: drone_serial, status: default_status } }).then(data => {
					if (!data) return Promise.reject('Drone not found!');
				});
			}),
		check('name', "Name is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 500 })
			.withMessage("Invalid length (3 - 500) characters"),
		check('weight', "Weight is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isInt()
			.custom(weight => {
				if (weight < 1) return false;
				else if (weight > max_drone_weight) return false;
				else return true;
			})
			.withMessage(`Weight invalid (1 - ${max_drone_weight}gr)`)
			.bail()
			.custom(async (weight, { req }) => {
				const drone_details = await DRONES.findOne({
					where: {
						serial_number: req.query.drone_serial || req.body.drone_serial || '',
					},
					raw: true
				});

				const drone_medication_details = await MEDICATIONS.findAll({
					attributes: ['drone_serial', [sequelize.fn('sum', sequelize.col('weight')), 'total_weight'],],
					where: {
						drone_serial: req.query.drone_serial || req.body.drone_serial || '',
					},
					raw: true
				});

				const drone_weight = drone_details.weight;
				const total_weight = parseInt(drone_medication_details[0].total_weight);

				if ((total_weight + weight) > parseInt(drone_weight)) {
					return Promise.reject(`Drone max capacity reached`);
				}
			}),
		check('code', "Code is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 100 })
			.withMessage("Invalid length (3 - 100) characters"),
		check('image', "Image is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isURL()
			.withMessage("Value must me a specified url path to an image"),
	]
};  
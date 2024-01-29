import { check } from 'express-validator';
import db from "../models/index.js";
import { default_status, max_drone_weight, max_drones, validate_drone_model, validate_drone_state } from '../config/config.js';

const DRONES = db.drones;

export const drones_rules = {
    forFindingDrone: [
        check('unique_id', "Unique Id is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom((unique_id, { req }) => {
                return DRONES.findOne({
                    where: {
                        unique_id,
                        status: default_status
                    }
                }).then(data => {
                    if (!data) return Promise.reject('Drone not found!');
                });
            })
    ],
    forAdding: [
        check('model', "Model is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom(async (model, {req}) => {
                const drone_count = await DRONES.count();
                if (drone_count >= max_drones) return Promise.reject('Max drones reached!');
            })
            .bail()
            .custom((model, { req }) => !!validate_drone_model(model))
            .withMessage("Invalid model"),
        check('weight', "Weight is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isInt()
            .custom(weight => {
                if (weight < 1) return false;
                else if (weight > max_drone_weight) return false;
                else return true;
            })
            .withMessage(`Weight invalid (1 - ${max_drone_weight}gr)`),
        check('battery', "Battery is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isInt()
            .custom(battery => {
                if (battery > 100) return false;
                else return true;
            })
            .withMessage(`Battery invalid (0 - 100)%`),
    ],
    forUpdatingModel: [
        check('model', "Model is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom((model, { req }) => !!validate_drone_model(model))
            .withMessage("Invalid model"),
    ],
    forUpdatingWeight: [
        check('weight', "Weight is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isInt()
            .custom(weight => {
                if (weight < 1) return false;
                else if (weight > max_drone_weight) return false;
                else return true;
            })
            .withMessage(`Weight invalid (1 - ${max_drone_weight}gr)`),
    ],
    forUpdatingBattery: [
        check('battery', "Battery is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .isInt()
            .custom(battery => {
                if (battery > 100) return false;
                else return true;
            })
            .withMessage(`Battery invalid (0 - 100)%`),
    ],
    forUpdatingState: [
        check('state', "State is required")
            .exists({ checkNull: true, checkFalsy: true })
            .bail()
            .custom((state, { req }) => !!validate_drone_state(state))
            .withMessage("Invalid state")
    ]
};  
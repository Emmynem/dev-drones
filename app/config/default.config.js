import { v4 as uuidv4 } from 'uuid';
import db from "../models/index.js";
import { logger } from '../common/index.js';
import { default_status, default_drone, default_medication, root_user, drone_states } from './config.js';

const DRONES = db.drones;
const MEDICATIONS = db.medications;

export async function createDefaults() {

    // Creating default drone
    // const drone_unique_id = uuidv4();

    const drone_details = {
        ...default_drone,
        status: default_status
    };

    const drone_count = await DRONES.count();

    if (drone_count <= 0) {
        try {
            await db.sequelize.transaction((t) => {
                const drone = DRONES.create(drone_details, { transaction: t });
                return drone;
            })
            logger.info('Added drone defaults');
        } catch (error) {
            logger.error('Error adding drone defaults');
        }
    }

    // End of creating default drone

    // Creating default medication
    // const medication_unique_id = uuidv4();

    const medication_details = {
        ...default_medication,
        status: default_status
    };

    const medication_count = await MEDICATIONS.count();

    if (medication_count <= 0) {
        try {
            await db.sequelize.transaction((t) => {
                const medication = MEDICATIONS.create(medication_details, { transaction: t });
                return medication;
            })
            logger.info('Added medication defaults');
        } catch (error) {
            logger.error('Error adding medication defaults');
        }
    }

    // End of creating default medication

};

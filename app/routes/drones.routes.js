import { drones_rules } from "../rules/drones.rules.js";
import { medications_rules } from "../rules/medications.rules.js";
import { 
	addDrone, checkDroneBattery, checkLoadingDrones, deleteDrone, getDrone, getDroneMedications, 
	getDrones, updateDroneBattery, updateDroneDetails, updateDroneModel, updateDroneState, updateDroneWeight
} from "../controllers/drones.controller.js";

export default function (app) {
	app.get("/drones", getDrones);
	app.get("/drones/loading", checkLoadingDrones);
	app.get("/drone/medications", [drones_rules.forFindingDrone], getDroneMedications);
	app.get("/drone/medications/via/serial", [medications_rules.forFindingViaSerialNumber], getDroneMedications);
	app.get("/drone", [drones_rules.forFindingDrone], getDrone);
	app.get("/drone/battery", [drones_rules.forFindingDrone], checkDroneBattery);

	app.post("/drone/add", [drones_rules.forAdding], addDrone);

	app.put("/drone/update/details", [drones_rules.forFindingDrone, drones_rules.forAdding], updateDroneDetails);
	app.put("/drone/update/battery", [drones_rules.forFindingDrone, drones_rules.forUpdatingBattery], updateDroneBattery);
	app.put("/drone/update/model", [drones_rules.forFindingDrone, drones_rules.forUpdatingModel], updateDroneModel);
	app.put("/drone/update/state", [drones_rules.forFindingDrone, drones_rules.forUpdatingState], updateDroneState);
	app.put("/drone/update/weight", [drones_rules.forFindingDrone, drones_rules.forUpdatingWeight], updateDroneWeight);

	app.delete("/drone", [drones_rules.forFindingDrone], deleteDrone);
};

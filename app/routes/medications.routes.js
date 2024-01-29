import { drones_rules } from "../rules/drones.rules.js";
import { medications_rules } from "../rules/medications.rules.js";
import {
	addMedication, getMedication, getMedications, removeMedication
} from "../controllers/medications.controller.js";

export default function (app) {
	app.get("/medications", getMedications);
	app.get("/medication", [medications_rules.forFindingMedication], getMedication);
	
	app.post("/medication/add", [medications_rules.forAdding], addMedication);

	app.delete("/medication", [medications_rules.forFindingMedication], removeMedication);
};

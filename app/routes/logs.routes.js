import { log_rules } from "../rules/logs.rules.js";
import { getLog, getLogs, removeLog } from "../controllers/logs.controller.js";

export default function (app) {
    app.get("/logs", getLogs);
    app.get("/log", [log_rules.forFindingLog], getLog);
    
    app.delete("/log", [log_rules.forFindingLog], removeLog);
};

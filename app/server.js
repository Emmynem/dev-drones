import express, { json, urlencoded } from "express";
import cors from "cors";
import helmet from "helmet";
import { SuccessResponse } from './common/index.js';
import logger from "./common/logger.js";
import morganMiddleware from "./middleware/morgan.js";
import db from "./models/index.js";
import { createDefaults } from './config/default.config.js';
import logsRoutes from './routes/logs.routes.js';
import dronesRoutes from './routes/drones.routes.js';
import medicationsRoutes from './routes/medications.routes.js';

const app = express();

//options for cors midddleware
const options = cors.CorsOptions = {
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        "Access-Control-Allow-Headers",
    ],
    methods: 'GET,PUT,POST,DELETE',
};

app.use(json({ limit:    '100mb' }));
app.use(urlencoded({ extended: true, limit: '100mb' }));
app.use(helmet());
app.use(morganMiddleware);

// add cors
app.use(cors(options));

// simple route
app.get("/", (request, response) => {
    SuccessResponse(response, "DEV Drones server activated.");
})

// Sequelize initialization
db.sequelize.sync({ force: true }).then(() => {
    logger.info("Server running at http://localhost:810");
    logger.info("DB Connected 🚀");
    // creating defaults
    createDefaults();
});

// Binding routes
logsRoutes(app);
dronesRoutes(app);
medicationsRoutes(app);

// change timezone for app
process.env.TZ = "Africa/Lagos";

export default app;


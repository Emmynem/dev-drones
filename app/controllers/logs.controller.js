import { validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, BadRequestError, logger } from '../common/index.js';
import { tag_user, default_status } from '../config/config.js';
import db from "../models/index.js";

const LOGS = db.logs;

export function getLogs (req, res) {
    LOGS.findAndCountAll({
        attributes: { exclude: ['id'] },
        order: [
            ['createdAt', 'DESC']
        ],
    }).then(logs => {
        if (!logs || logs.length == 0) {
            SuccessResponse(res, { unique_id: tag_user, text: "Logs Not found" }, []);
        } else {
            SuccessResponse(res, { unique_id: tag_user, text: "Logs loaded" }, logs);
        }
    }).catch(err => {
        ServerError(res, { unique_id: tag_user, text: err.message }, null);
    });
};

export async function getLog (req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_user, text: "Validation Error Occured" }, errors.array())
    }
    else {
        try {
            LOGS.findOne({
                attributes: { exclude: ['id'] },
                where: {
                    ...payload
                },
            }).then(log => {
                if (!log) {
                    NotFoundError(res, { unique_id: tag_user, text: "Log not found" }, null);
                } else {
                    SuccessResponse(res, { unique_id: tag_user, text: "Log loaded" }, log);
                }
            })
        } catch (err) {
            ServerError(res, { unique_id: tag_user, text: err.message }, null);
        }
    }
};

export async function addLog(req, res, data) {

    let msg;
    let param;

    if (data.action === "" || data.action === undefined) {
        msg = "Action is required";
        param = "action";
        logger.warn({ unique_id: tag_user, text: `Logs | Validation Error Occured - ${param} : ${msg}` });
    } else if (data.action.length > 200) {
        msg = "Action max length reached";
        param = "action";
        logger.warn({ unique_id: tag_user, text: `Logs | Validation Error Occured - ${param} : ${msg}` });
    } else {
        try {
            await db.sequelize.transaction((t) => {
                const log = LOGS.create({
                    ...data,
                    unique_id: uuidv4(),
                    status: default_status
                }, { transaction: t });
                return log;
            });
            logger.info({ unique_id: tag_user, text: `Log - ${data.action}` });
        } catch (err) {
            logger.error({ unique_id: tag_user, text: err.message });
        }
    }
};

export async function removeLog(req, res) {
    const errors = validationResult(req);
    const payload = matchedData(req);

    if (!errors.isEmpty()) {
        ValidationError(res, { unique_id: tag_user, text: "Validation Error Occured" }, errors.array())
    }
    else {
        try {
            const log = await db.sequelize.transaction((t) => {
                return LOGS.destroy({
                    where: {
                        unique_id: payload.unique_id,
                        status: default_status
                    }
                }, { transaction: t });
            });

            if (log > 0) {
                OtherSuccessResponse(res, { unique_id: tag_user, text: "Log deleted!" });
            } else {
                BadRequestError(res, { unique_id: tag_user, text: "Log not found!" }, null);
            }
        } catch (err) {
            ServerError(res, { unique_id: tag_user, text: err.message }, null);
        }
    }
};
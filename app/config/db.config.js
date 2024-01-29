import dotenv from 'dotenv';

dotenv.config();

const { DB_USER, DB_PASSWORD } = process.env;
export const HOST = "localhost";
export const USER = DB_USER;
export const PASSWORD = DB_PASSWORD;
export const DB = "dev_drones";
export const dialect = "mysql";
export const logging = 0;
export const pool = {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
};
export const dialectOptions = {
    useUTC: false, //for reading from database
    dateStrings: true,
    typeCast: true
};
export const timezone = '+01:00';
export const production = false;
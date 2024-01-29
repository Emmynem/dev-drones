import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

// Password options
export const password_options = {
    minLength: 8,
    maxLength: 30,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1
};

// App Defaults 

export const tag_user = "User";

export const today_str = () => {
    const d = new Date();
    const date_str = d.getFullYear() + "-" + ((d.getUTCMonth() + 1) < 10 ? "0" + (d.getUTCMonth() + 1) : (d.getUTCMonth() + 1)) + "-" + (d.getDate() < 10 ? "0" + d.getDate() : d.getDate());
    return date_str;
};

export const random_uuid = (length) => {
    if (length === undefined || length === null || length === 0) {
        let values = crypto.randomBytes(20).toString('hex');
        return values;
    }
    else {
        let values = crypto.randomBytes(length).toString('hex');
        return values;
    }
};

export const random_numbers = (length) => {
    if (length === undefined || length === null || length === 0) {
        return 0;
    }
    else {
        let rand_number = "";
        for (let index = 0; index < length; index++) {
            rand_number += Math.floor(Math.random() * 10);
        }
        return rand_number;
    }
};

export const generate_serial_number = () => {
    return "DEVD" + random_numbers(12);
};

export const validate_drone_model = (obj) => {
    const model = obj.toUpperCase();
    if (model !== drone_models.cruiserweight.toUpperCase() && model !== drone_models.heavyweight.toUpperCase() && model !== drone_models.lightweight.toUpperCase() && model !== drone_models.middleweight.toUpperCase()) return false;
    return true;
};

export const validate_drone_state = (obj) => {
    const state = obj.toUpperCase();
    if (state !== drone_states.delivered.toUpperCase() && state !== drone_states.delivering.toUpperCase() && state !== drone_states.idle.toUpperCase() && state !== drone_states.loaded.toUpperCase() && state !== drone_states.loading.toUpperCase() && state !== drone_states.returning.toUpperCase()) return false;
    return true;
};

export const strip_medication_name = (text) => {
    //Make alphanumeric (removes all other characters)
    let string = text.replace(/[^a-zA-Z0-9_\s-]/g, "");
    //Clean up multiple dashes or whitespaces
    string = string.replace(/[\s]+/g, " ");
    //Convert whitespaces and underscore to dash
    // string = string.replace(/[\s_]/g, "-");
    return string;
};

export const strip_medication_code = (text) => {
    //Upper case everything
    let string = text.toUpperCase();
    //Make alphanumeric (removes all other characters)
    string = string.replace(/[^a-zA-Z0-9_\s-]/g, "");
    //Clean up multiple dashes or whitespaces
    string = string.replace(/[\s-]+/g, " ");
    //Convert whitespaces and underscore to dash
    string = string.replace(/[\s_]/g, "_");
    return string;
};

export const strip_text = (text) => {
    //Lower case everything
    let string = text.toLowerCase();
    //Make alphanumeric (removes all other characters)
    string = string.replace(/[^a-z0-9_\s-]/g, "");
    //Clean up multiple dashes or whitespaces
    string = string.replace(/[\s-]+/g, " ");
    //Convert whitespaces and underscore to dash
    string = string.replace(/[\s_]/g, "-");
    return string;
};

export const validate_future_date = (date) => {
    const d = new Date(date);
    const today = new Date();
    if (d == "Invalid Date") return false;
    if (today.getTime() > d.getTime()) return false;
    return true;
};

export const root_user = {
    name: "Root",
    email: "root@devdrones.com"
};

export const default_drone = {
    unique_id: "d6499060-ca13-4bca-b2d0-a6eef27de76a",
    serial_number: generate_serial_number(),
    // serial_number: "DEVD960740122328",
    model: "Middleweight",
    weight: 200,
    battery: 100,
    state: "IDLE"
};

export const default_medication = {
    unique_id: "b786a5cd-c4e4-4dff-91b1-97363415543d",
    drone_serial: default_drone.serial_number,
    name: "Panadol Extra",
    weight: 30,
    code: "P500",
    image: "https://link.image"
};

export const drone_models = {
    lightweight: "Lightweight",
    middleweight: "Middleweight",
    cruiserweight: "Cruiserweight",
    heavyweight: "Heavyweight"
};

export const drone_states = {
    idle: "IDLE",
    loading: "LOADING",
    loaded: "LOADED",
    delivering: "DELIVERING",
    delivered: "DELIVERED",
    returning: "RETURNING"
};

export const max_drones = 10;
export const max_drone_weight = 500;
export const default_status = 1;
export const default_delete_status = 0;
export const default_pending_status = 2;

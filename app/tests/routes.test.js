import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import app from '../server.js';
import db from "../models/index.js";
import { createDefaults } from "../config/default.config.js";
import { default_status, default_drone, default_medication, drone_states, drone_models } from "../config/config.js";

const droneComplete = {
	unique_id: uuidv4(),
	...default_drone,
	status: default_status
};

const medicationComplete = {
	unique_id: uuidv4(),
	...default_medication,
	status: default_status
};

beforeAll(async () => {
	await db.sequelize.sync({ force: true }).then(() => {
		// creating defaults
		createDefaults();
	});
}); 

afterAll(async () => await db.sequelize.drop());

describe('Drones API', () => {
	it('should show all drones', async () => {
		const res = await request(app).get('/drones')
		expect(res.statusCode).toEqual(200)
		expect(res.body).toHaveProperty('data')
	}),
	it('should show a drone', async () => {
		const res = await request(app).get(`/drone?unique_id=${default_drone.unique_id}`)
		expect(res.statusCode).toEqual(200)
		expect(res.body).toHaveProperty('data')
	}),
	it('should show drone battery', async () => {
		const res = await request(app).get(`/drone/battery?unique_id=${default_drone.unique_id}`)
		expect(res.statusCode).toEqual(200)
		expect(res.body).toHaveProperty('data')
	}),
	it('should create a new drone', async () => {
		const res = await request(app)
			.post('/drone/add')
			.send(droneComplete)
		expect(res.statusCode).toEqual(201)
		expect(res.body).toHaveProperty('message')
		expect(res.body.message).toBe("Drone created successfully!")
	}),
	it('should update a drone details', async () => {
		const res = await request(app)
		.put(`/drone/update/details?unique_id=${default_drone.unique_id}`)
		.send({ ...droneComplete, battery: 79})
		expect(res.statusCode).toEqual(204)
	}),
	it('should update a drone battery', async () => {
		const res = await request(app)
		.put(`/drone/update/battery?unique_id=${default_drone.unique_id}`)
		.send({battery: 50})
		expect(res.statusCode).toEqual(204)
	}),
	it('should update a drone weight', async () => {
		const res = await request(app)
		.put(`/drone/update/weight?unique_id=${default_drone.unique_id}`)
		.send({weight: 400})
		expect(res.statusCode).toEqual(204)
	}),
	it('should update a drone state', async () => {
		const res = await request(app)
		.put(`/drone/update/state?unique_id=${default_drone.unique_id}`)
		.send({state: drone_states.loading})
		expect(res.statusCode).toEqual(204)
	}),
	it('should update a drone model', async () => {
		const res = await request(app)
		.put(`/drone/update/model?unique_id=${default_drone.unique_id}`)
		.send({model: drone_models.heavyweight})
		expect(res.statusCode).toEqual(204)
	})
})

describe('Medications API', () => {
	it('should show all medications', async () => {
		const res = await request(app).get('/medications')
		expect(res.statusCode).toEqual(200)
		expect(res.body).toHaveProperty('data')
	}),
	it('should show a medication', async () => {
		const res = await request(app).get(`/medication?unique_id=${default_medication.unique_id}`)
		expect(res.statusCode).toEqual(200)
		expect(res.body).toHaveProperty('data')
	}),
	it('should add a new medication to drone', async () => {
		const res = await request(app)
			.post('/medication/add')
			.send(medicationComplete)
		expect(res.statusCode).toEqual(201)
		expect(res.body).toHaveProperty('message')
		expect(res.body.message).toBe("Medication added successfully!")
	}),
	it('should remove a medication from drone', async () => {
		const res = await request(app)
			.del(`/medication?unique_id=${default_medication.unique_id}`)
		expect(res.statusCode).toEqual(204)
	}),
	// Putting this here so we run all tests on medications before we delete the drone
	it('should delete a drone', async () => {
		const res = await request(app)
			.del(`/drone?unique_id=${default_drone.unique_id}`)
		expect(res.statusCode).toEqual(204)
	})

})

describe('Logs API', () => {
	it('should show all logs', async () => {
		const res = await request(app).get('/logs')
		expect(res.statusCode).toEqual(200)
		expect(res.body).toHaveProperty('data')
	})
})
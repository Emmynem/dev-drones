
<!-- My own README.md -->
## Drones

Application by Nwoye Emmanuel - [Github](https://github.com/Emmynem)

---

### Requirements

The following are required to successfully run this project on your system:
- Download Node JS application
- Download MySQL

#### Creating our Sample Database
I installed and configured the MySQL database. So, I have a username and password to log in to the MySQL database on the local machine. 

`P.S: You can change the configuration in the env file for your own login details.`

- Run the following command in the command prompt and replace the USERNAME with your database username.

```
mysql -u USERNAME -p
```
- After running the above command, MySQL asks for the password. So, enter the password and press the Enter key.
- Create a new database named `dev_drones` and check whether the database was created or not.
```
mysql> CREATE DATABASE dev_drones;
mysql> SHOW DATABASES;

+--------------------+
| Database           |
+--------------------+
| dev_drones         |
| information_schema |
| mysql              |
| performance_schema |
| sys                |
+--------------------+
5 rows in set (0.00 sec)
```

### Installation

Using MySQL as my DB of choice, you'll have to download the package and install [here.](https://dev.mysql.com/downloads/installer/)

In the root directory run the following code in your command line

### Installation

```
npm install
```

### Development
```
npm run dev
```

### Production
```
npm run prod
```

### Tests
```
npm test
```

### End of my README.md

## Drones

[[_TOC_]]

---

:scroll: **START**


### Introduction

There is a major new technology that is destined to be a disruptive force in the field of transportation: **the drone**. Just as the mobile phone allowed developing countries to leapfrog older technologies for personal communication, the drone has the potential to leapfrog traditional transportation infrastructure.

Useful drone functions include delivery of small items that are (urgently) needed in locations with difficult access.

---

### Task description

We have a fleet of **10 drones**. A drone is capable of carrying devices, other than cameras, and capable of delivering small loads. For our use case **the load is medications**.

A **Drone** has:
- serial number (100 characters max);
- model (Lightweight, Middleweight, Cruiserweight, Heavyweight);
- weight limit (500gr max);
- battery capacity (percentage);
- state (IDLE, LOADING, LOADED, DELIVERING, DELIVERED, RETURNING).

Each **Medication** has: 
- name (allowed only letters, numbers, ‘-‘, ‘_’);
- weight;
- code (allowed only upper case letters, underscore and numbers);
- image (picture of the medication case).

Develop a service via REST API that allows clients to communicate with the drones (i.e. **dispatch controller**). The specific communicaiton with the drone is outside the scope of this task. 

The service should allow:
- registering a drone;
- loading a drone with medication items;
- checking loaded medication items for a given drone; 
- checking available drones for loading;
- check drone battery level for a given drone;

> Feel free to make assumptions for the design approach. 

---

### Requirements

While implementing your solution **please take care of the following requirements**: 

#### Functional requirements

- Prevent the drone from being loaded with more weight that it can carry;
- Prevent the drone from being in LOADING state if the battery level is **below 25%**;
- Introduce a periodic task to check drones battery levels and create history/audit event log for this;
- There is no need for UI.

---

#### Non-functional requirements

- The project must be buildable and runnable;
- The project must have Unit tests;
- The project must have a README file with build/run/test instructions (use a DB that can be run locally, e.g. in-memory, via container);
- Any data required by the application to run (e.g. reference tables, dummy data) must be preloaded in the database;
- Input/output data must be in JSON format;
- Use a framework of your choice, but popular, up-to-date, and long-term support versions are recommended.

---

:scroll: **END** 
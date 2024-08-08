# User Management Microservice

## Overview

This microservice is built with Nest.js to manage user data. It supports CRUD operations, user blocking/unblocking, and search functionality with caching for frequently accessed data. It also ensures that blocked users do not appear in search results.

## Features

- **CRUD Operations**: Create, Read, Update, and Delete users.
- **Search Functionality**: Search users by username and/or age range.
- **User Blocking**: Block and unblock users, ensuring blocked users are not visible in search results.
- **Caching**: Frequently accessed data is cached using Redis.

## Technologies Used

- **Nest.js**: A progressive Node.js framework for building efficient and scalable server-side applications.
- **MongoDB**: A NoSQL database used for storing user data.
- **Redis**: An in-memory data structure store used for caching.
- **Docker**: Containerization of the application and its dependencies.

## Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** (version 18.x or later)
- **npm** (Node Package Manager)
- **Docker** 

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Marzooq13579/user_management_microservice_plena.git
cd user_management_microservice_plena
```

### 2. Create a new .env file with .env.example file contents in it

### 3. Run DOCKER File

```bash
#run docker containers
$ docker-compose up

#start the nest.js server
$ npm run start:dev
```

This command will start the MongoDB and Redis containers, as well as the Nest.js application.

### 4. Access the Application

Server will run at `http://localhost:3000`.

### 5. Swagger UI will be accessible at `http://localhost:3000/api` in your web browser

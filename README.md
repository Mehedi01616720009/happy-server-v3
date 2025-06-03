# Happy-Server: A RESTful API for ERP Software

## Description

Happy-Server is a RESTful API designed to manage tasks for productivity applications. It supports CRUD operations, user authentication, and integration with third-party services like Cloudinary for media managment.

## Table of Contents

-   [Description](#description)
-   [Features](#features)
-   [Technologies Used](#technologies-used)
-   [Installation](#installation)
-   [Usage](#usage)
-   [API Documentation](#api-documentation)
-   [Error Handling](#error-handling)
-   [Contributing](#contributing)
-   [License](#license)

## Features

-   User authentication and authorization (JWT-based).
-   CRUD operations for managing tasks.
-   Data validation using ZOD.
-   Media storage with Cloudinary.

## Technologies Used

-   Node.js
-   Express.js
-   MongoDB
-   Mongoose
-   ZOD (data validation)
-   JWT (authentication)
-   Cloudinary (media storage)

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/Mehedi01616720009/happy-server.git
    ```

2. Navigate to the project directory:

    ```bash
    cd happy-server
    ```

3. Install dependencies:

    ```bash
    npm install
    ```

4. Set up environment variables:

    - Create a .env file in the root directory.
    - Add the following keys:

    ```bash
    NODE_ENV=
    PORT=
    DATABASE_URL=
    COMPANY_NAME=

    ACCESS_TOKEN_SECRET=
    REFRESH_TOKEN_SECRET=
    ACCESS_TOKEN_EXP=
    REFRESH_TOKEN_EXP=

    BCRYPT_SALT_ROUNDS=
    PROFILE_IMG=
    SUPER_ADMIN_PASSWORD=
    SUPER_ADMIN_LIMIT=

    MAIL_HOSTNAME=
    MAIL_PORT=
    MAIL_USER=
    MAIL_PASSWORD=

    CLOUDINARY_CLOUD_NAME=
    CLOUDINARY_API_KEY=
    CLOUDINARY_API_SECRET=

    FRONTEND_BASE_URL=
    ```

5. Start the server:

    ```bash
    npm start
    ```

---

## Usage

-   **Purpose:** Provide instructions for interacting with the API.

````markdown
## Usage

Once the server is running, you can interact with the API using tools like Postman or cURL. Below are some sample endpoints:

### Endpoints

-   **Base URL**: `http://localhost:3000`

#### Authentication

-   `POST /auth/login`: Logs in a user.
-   `POST /auth/register`: Registers a new user.

#### Tasks

-   `GET /tasks`: Fetch all tasks.
-   `POST /tasks`: Create a new task.
-   `PUT /tasks/:id`: Update a task.
-   `DELETE /tasks/:id`: Delete a task.

### Example Request

```bash
curl -X POST http://localhost:3000/auth/login \
-H "Content-Type: application/json" \
-d '{"email": "user@example.com", "password": "password123"}'
```
````

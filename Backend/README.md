# Backend API Documentation

## `/users/register` Endpoint

### **Description**

Registers a new user by creating a user account with the provided information.

---

### **HTTP Method**

`POST`

---

### **Request Body**

The request body should be in JSON format and include the following fields:

- **`fullname`** _(object)_:
  - **`firstname`** _(string, required)_: User's first name (minimum 3 characters).
  - **`lastname`** _(string, optional)_: User's last name (minimum 3 characters).
- **`email`** _(string, required)_: User's email address (must be a valid email).
- **`password`** _(string, required)_: User's password (minimum 6 characters).

#### **Example Request**

```json
{
  "fullname": {
    "firstname": "John",
    "lastname": "Doe"
  },
  "email": "john.doe@example.com",
  "password": "securepassword"
}
```

---

### **Example Response**

A successful request returns the following response:

#### **Response Structure**

- **`user`** _(object)_:
  - **`fullname`** _(object)_:
    - **`firstname`** _(string)_: User's first name.
    - **`lastname`** _(string)_: User's last name.
  - **`email`** _(string)_: User's email address.
  - **`password`** _(string)_: User's password.
- **`token`** _(string)_: JWT token for authentication.

#### **Example Response**

```json
{
  "user": {
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com",
    "password": "securepassword"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### **Notes**

- Ensure that all required fields are included in the request body.
- The **`email`** must be valid and unique.
- The **`password`** must have at least 6 characters.
- Store the **`token`** securely on the client side for authentication purposes.

## `/users/login` Endpoint

### **Description**

Authenticates a user using their email and password, returning a JWT token upon successful login.

---

### **HTTP Method**

`POST`

---

### **Endpoint**

`/users/login`

---

### **Request Body**

The request body should be in JSON format and include the following fields:

- **`email`** _(string, required)_: User's email address (must be a valid email).
- **`password`** _(string, required)_: User's password (minimum 6 characters).

#### **Example Request**

```json
{
  "email": "john.doe@example.com",
  "password": "securepassword"
}
```

---

### **Example Response**

A successful request returns the following response:

#### **Response Structure**

- **`user`** _(object)_:
  - **`fullname`** _(object)_:
    - **`firstname`** _(string)_: User's first name.
    - **`lastname`** _(string)_: User's last name.
  - **`email`** _(string)_: User's email address.
  - **`password`** _(string)_: User's password.
- **`token`** _(string)_: JWT token for authentication.

#### **Example Response**

```json
{
  "user": {
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com",
    "password": "securepassword"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### **Notes**

- Ensure that the **`email`** and **`password`** fields are included and valid.
- The **`password`** must have at least 6 characters.
- Store the **`token`** securely for user authentication in future requests.

## `/users/profile` Endpoint

### Description

Retrieves the profile information of the currently authenticated user.

### HTTP Method

`GET`

### Authentication

Requires a valid JWT token in the Authorization header:  
`Authorization: Bearer <token>`

### Example Response

```json
{
  "user": {
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com"
  }
}
```

---

## `/users/logout` Endpoint

### Description

Logs out the current user and blacklists the token provided in the cookie or headers.

### HTTP Method

`GET`

### Authentication

Requires a valid JWT token in the Authorization header or cookie.

### Example Response

```json
{
  "message": "Logout successful."
}
```

---

## /captains/register Endpoint

**Description:**  
Registers a new captain by creating a captain account with the provided information.

**HTTP Method:**  
POST

**Request Body:**  
The request body should be in JSON format and include the following fields:

- `fullname` (object):
  - `firstname` (string, required): Captain's first name (minimum 3 characters).
  - `lastname` (string, optional): Captain's last name (minimum 3 characters).
- `email` (string, required): Captain's email address (must be a valid email).
- `password` (string, required): Captain's password (minimum 6 characters).
- `vehicle` (object):
  - `color` (string, required): Vehicle color (minimum 3 characters).
  - `plate` (string, required): Vehicle plate number (minimum 3 characters).
  - `capacity` (number, required): Vehicle passenger capacity (minimum 1).
  - `vehicleType` (string, required): Type of vehicle (must be 'car', 'motorcycle', or 'auto').

**Example Response:**

```json
{
  "captain": {
    "fullname": {
      "firstname": "string",
      "lastname": "string"
    },
    "email": "string",
    "password": "string",
    "vehicle": {
      "color": "string",
      "plate": "string",
      "capacity": "number",
      "vehicleType": "string"
    }
  },
  "token": "JWT Token"
}
```

---

## /captains/login Endpoint

**Description:**  
Authenticates a captain using their email and password, returning a JWT token upon successful login.

**HTTP Method:**  
POST

**Endpoint:**  
`/captains/login`

**Request Body:**  
The request body should be in JSON format and include the following fields:

- `email` (string, required): Captain's email address (must be a valid email).
- `password` (string, required): Captain's password (minimum 6 characters).

**Example Response:**

```json
{
  "captain": {
    "fullname": {
      "firstname": "string",
      "lastname": "string"
    },
    "email": "string",
    "password": "string",
    "vehicle": {
      "color": "string",
      "plate": "string",
      "capacity": "number",
      "vehicleType": "string"
    }
  },
  "token": "JWT Token"
}
```

---

## /captains/profile Endpoint

**Description:**  
Retrieves the profile information of the currently authenticated captain.

**HTTP Method:**  
GET

**Authentication:**  
Requires a valid JWT token in the Authorization header: `Authorization: Bearer <token>`

**Example Response:**

```json
{
  "captain": {
    "fullname": {
      "firstname": "string",
      "lastname": "string"
    },
    "email": "string",
    "vehicle": {
      "color": "string",
      "plate": "string",
      "capacity": "number",
      "vehicleType": "string"
    }
  }
}
```

## `/captains/logout` Endpoint

### Description

Logs out the current captain and blacklists the provided token in the cookie or headers.

---

### HTTP Method

**GET**

---

### Authentication

A valid JWT token is required in either the Authorization header or the cookie.

- **Authorization Header:**

---

### Example Response

```json
{
  "message": "Logout successfully."
}
```

# API Documentation

This document provides documentation for the available API endpoints.

## Inventory API

### Create Inventory

-   **URL:** `/inventories`
-   **Method:** `POST`
-   **Description:** Create a new inventory record.
-   **Authentication:** Required. User must have the `packingMan` role.
-   **Headers:**
    -   `Authorization`: `Bearer <token>`
-   **Request Body:**
    ```json
    {
        "packingman": "string",
        "dsr": "string",
        "warehouse": "string",
        "product": "string",
        "outQuantity": "number"
    }
    ```
-   **Success Response:**
    -   **Code:** 200 OK
    -   **Content:**
        ```json
        {
            "success": true,
            "message": "Inventory created successfully",
            "data": {
                "_id": "60d5f2b4a6d2f1a2b8c0e1a6",
                "packingman": "60d5f2b4a6d2f1a2b8c0e1a1",
                "dsr": "60d5f2b4a6d2f1a2b8c0e1a2",
                "warehouse": "60d5f2b4a6d2f1a2b8c0e1a3",
                "product": "60d5f2b4a6d2f1a2b8c0e1a4",
                "outQuantity": 10
            }
        }
        ```
-   **Error Response:**
    -   **Code:** 401 Unauthorized
    -   **Content:**
        ```json
        {
            "success": false,
            "message": "You are not authorized!"
        }
        ```

### Create Alt Inventory

-   **URL:** `/inventories/alt`
-   **Method:** `POST`
-   **Description:** Create a new alternative inventory record.
-   **Authentication:** Required. User must have the `packingMan` role.
-   **Headers:**
    -   `Authorization`: `Bearer <token>`
-   **Request Body:**
    ```json
    {
        "packingman": "string",
        "dsr": "string",
        "warehouse": "string",
        "product": "string",
        "outQuantity": "number"
    }
    ```
-   **Success Response:**
    -   **Code:** 200 OK
    -   **Content:**
        ```json
        {
            "success": true,
            "message": "Alt Inventory created successfully",
            "data": {
                "_id": "60d5f2b4a6d2f1a2b8c0e1a7",
                "packingman": "60d5f2b4a6d2f1a2b8c0e1a1",
                "dsr": "60d5f2b4a6d2f1a2b8c0e1a2",
                "warehouse": "60d5f2b4a6d2f1a2b8c0e1a3",
                "product": "60d5f2b4a6d2f1a2b8c0e1a4",
                "outQuantity": 20
            }
        }
        ```
-   **Error Response:**
    -   **Code:** 401 Unauthorized
    -   **Content:**
        ```json
        {
            "success": false,
            "message": "You are not authorized!"
        }
        ```

## Product API

### Get Products Grouped by SR and Status Dispatched

-   **URL:** `/products/group-by-sr-status-dispatched`
-   **Method:** `GET`
-   **Description:** Retrieves products grouped by SR and ordered date, filtered by dispatched status.
-   **Authentication:** Required. User must have the `packingMan` role.
-   **Headers:**
    -   `Authorization`: `Bearer <token>`
-   **Success Response:**
    -   **Code:** 200 OK
    -   **Content:**
        ```json
        {
            "success": true,
            "message": "Products retrieved successfully",
            "data": [
                {
                    "_id": "60d5f2b4a6d2f1a2b8c0e1a2",
                    "name": "Product Name",
                    "bnName": "Product Bangla Name",
                    "packageType": "Box",
                    "quantityPerPackage": 24,
                    "image": "https://example.com/image/image.jpg",
                    "orderedQuantity": 10,
                    "packedQuantity": 8,
                    "soldQuantity": 5,
                    "stock": 100
                }
                // more...
            ]
        }
        ```
-   **Error Response:**
    -   **Code:** 401 Unauthorized
    -   **Content:**
        ```json
        {
            "success": false,
            "message": "You are not authorized!"
        }
        ```

## DSR API

### Assign Data to DSR

-   **URL:** `/dsr/:id/assign-data`
-   **Method:** `PUT`
-   **Description:** Assigns data to a specific DSR.
-   **Authentication:** Required. User must have `superAdmin` or `admin` role.
-   **Headers:**
    -   `Authorization`: `Bearer <token>`
-   **URL Params:**
    -   `id=[string]` (DSR ID)
-   **Request Body:**
    ```json
    {
        "upazilas": ["60d5f2b4a6d2f1a2b8c0e1a3", "60d5f2b4a6d2f1a2b8c0e1a4"], // optional
        "sr": ["60d5f2b4a6d2f1a2b8c0e1a5"] // optional
    }
    ```
-   **Success Response:**
    -   **Code:** 200 OK
    -   **Content:**
        ```json
        {
            "success": true,
            "message": "Data assigned to DSR successfully",
            "data": {
                "dsr": "60d5f2b4a6d2f1a2b8c0e1a1",
                "upazilas": [
                    "60d5f2b4a6d2f1a2b8c0e1a3",
                    "60d5f2b4a6d2f1a2b8c0e1a4"
                ],
                "sr": ["60d5f2b4a6d2f1a2b8c0e1a5"]
            }
        }
        ```
-   **Error Response:**
    -   **Code:** 401 Unauthorized
    -   **Content:**
        ```json
        {
            "success": false,
            "message": "You are not authorized!"
        }
        ```
    -   **Code:** 404 Not Found
    -   **Content:**
        ```json
        {
            "success": false,
            "message": "DSR not found"
        }
        ```

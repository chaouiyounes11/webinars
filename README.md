# Webinar Management System

## Introduction

Welcome to the Webinar Management System! This system allows you to efficiently manage
webinars, create new ones, update details, and delete as needed. Below are the guidelines
and endpoints for using this system.

## Authorization

To access the API, include the following authorization header in your requests:

```json
{
  "key": "Authorization",
  "value": "Basic b3JnYW5pemVAZ21haWwuY29tOnBhc3N3b3Jk"
}
```

In the Authorization section use this credentials

- email: organizer@gmail.com
- password: password

Create a webinar by making a POST request to the following endpoint:

**Endpoint:** `http://localhost:3000/webinars`

**Request Type:** `POST`

**Body:**

```json
{
  "title": "Nest Webinar",
  "seats": 100,
  "startDate": "2024-05-12T00:00:00.000Z",
  "endDate": "2024-05-12T00:00:00.000Z"
}
```

## Rules:

- Webinars must be scheduled at least 3 days in advance.
- Use organizer credentials for authentication.

## Update Webinar Title

Update the title of a webinar by making a POST request to the following endpoint:

**Endpoint:** `http://localhost:3000/webinars/:id/title`

**Request Type:** `POST`

**Body:**

```json
{
  "title": "New title"
}
```

## Update Webinar Seats

Update the number of seats for a webinar by making a POST request to the following
endpoint:

**Endpoint:** `http://localhost:3000/webinars/:id/seats`

**Request Type:** `POST`

**Body:**

```json
{
  "seats": 200
}
```

## Rules:

- Use organizer credentials for authentication.
- Webinar seats must be between 0 and 1000.
- The new seat count must be higher than the initial value.

## Update webinar dates

Update the start and end dates of a webinar by making a POST request to the following
endpoint:

**Endpoint:** `http://localhost:3000/webinars/:id/dates`

**Request Type:** `POST`

**Body:**

```json
{
  "startDate": "2024-05-12T00:00:00.000Z",
  "endDate": "2024-05-12T00:00:00.000Z"
}
```

## Rules:

- Use organizer credentials for authentication.
- Webinars must be scheduled at least 3 days in advance.
-

## Delete webinar

Delete a webinar by making a DELETE request to the following
endpoint:

**Endpoint:** `http://localhost:3000/webinars/:id`

**Request Type:** `DELETE`

## Rules:

- Use organizer credentials for authentication.


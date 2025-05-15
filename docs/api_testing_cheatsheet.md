# SoundTribe API Testing Cheatsheet

Last updated: [Current Date]

This document contains useful curl commands for testing the SoundTribe API during development.
Please update this document as new endpoints are added or existing ones are modified.

## Table of Contents

- Authentication
- Genre Management
- Artist Profile Management
- Event/Gig Posting Management
- Application Management
- Helpful Tips

## Authentication

# Create Admin (Development only - remove before production)

curl -X POST http://localhost:3000/api/auth/create-admin \
 -H "Content-Type: application/json" \
 -d '{"email": "admin@example.com", "password": "adminpassword123", "adminSecret": "your_admin_secret_here"}'

# Login (Admin or User)

curl -X POST http://localhost:3000/api/auth/login \
 -H "Content-Type: application/json" \
 -d '{"email": "admin@example.com", "password": "adminpassword123"}'

# Get Current User (Protected Route)

curl -X GET http://localhost:3000/api/auth/me \
 -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"

## Genre Management (Admin only)

# Create Genre

curl -X POST http://localhost:3000/api/genres \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN_HERE" \
 -d '{"name": "Rock", "description": "Rock music genre"}'

# Get All Genres

curl -X GET http://localhost:3000/api/genres

# Update Genre

curl -X PUT http://localhost:3000/api/genres/GENRE_ID_HERE \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN_HERE" \
 -d '{"name": "Updated Rock", "description": "Updated description"}'

# Delete Genre

curl -X DELETE http://localhost:3000/api/genres/GENRE_ID_HERE \
 -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN_HERE"

## Artist Profile Management

# Create Artist Profile

curl -X POST http://localhost:3000/api/artists \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
 -d '{"name": "Artist Name", "genre": "GENRE_ID_HERE", "bio": "Artist bio"}'

# Get All Artist Profiles

curl -X GET http://localhost:3000/api/artists

# Get Specific Artist Profile

curl -X GET http://localhost:3000/api/artists/ARTIST_ID_HERE

# Update Artist Profile

curl -X PUT http://localhost:3000/api/artists/ARTIST_ID_HERE \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
 -d '{"name": "Updated Name", "bio": "Updated bio"}'

# Delete Artist Profile

curl -X DELETE http://localhost:3000/api/artists/ARTIST_ID_HERE \
 -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"

## Event/Gig Posting Management

# Create Event Posting

curl -X POST http://localhost:3000/api/events \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
 -d '{"title": "Guitarist Needed", "description": "Looking for a guitarist", "genre": "GENRE_ID_HERE"}'

# Get All Event Postings

curl -X GET http://localhost:3000/api/events

# Get Specific Event Posting

curl -X GET http://localhost:3000/api/events/EVENT_ID_HERE

# Update Event Posting

curl -X PUT http://localhost:3000/api/events/EVENT_ID_HERE \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
 -d '{"title": "Updated Title", "description": "Updated description"}'

# Delete Event Posting

curl -X DELETE http://localhost:3000/api/events/EVENT_ID_HERE \
 -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"

## Application Management

# Submit Application

curl -X POST http://localhost:3000/api/applications \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
 -d '{"event": "EVENT_ID_HERE", "artist": "ARTIST_ID_HERE", "message": "I'm interested in this gig"}'

# Get All Applications (Admin only)

curl -X GET http://localhost:3000/api/applications \
 -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN_HERE"

# Get Specific Application

curl -X GET http://localhost:3000/api/applications/APPLICATION_ID_HERE \
 -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"

# Update Application Status (Admin only)

curl -X PUT http://localhost:3000/api/applications/APPLICATION_ID_HERE \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN_HERE" \
 -d '{"status": "accepted"}'

# Delete Application

curl -X DELETE http://localhost:3000/api/applications/APPLICATION_ID_HERE \
 -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"

## Helpful Tips

1. Always replace YOUR_JWT_TOKEN_HERE with the actual token received after login.
2. For admin operations, make sure to use the admin JWT token.
3. Replace placeholder IDs (like GENRE_ID_HERE, ARTIST_ID_HERE, etc.) with actual IDs from the database.
4. Check the response status codes and body for success/error messages.
5. Use jq for pretty-printing JSON responses:
   curl ... | jq '.'
6. For file uploads (e.g., artist portfolio), use the -F flag:
   curl -X POST http://localhost:3000/api/artists/ARTIST_ID_HERE/portfolio \
    -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
    -F "image=@/path/to/image.jpg"

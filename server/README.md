
# PostgreSQL API Server

This is the backend server for the Infrastructure Dashboard that connects to your PostgreSQL database.

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Create a `.env` file:
```bash
cp .env.example .env
```

3. Edit the `.env` file with your database credentials (optional - you can also use the frontend form)

4. Start the server:
```bash
npm run dev
```

The server will run on http://localhost:3001

## API Endpoints

- `POST /api/test-connection` - Test database connection
- `POST /api/connect` - Connect to database
- `GET /api/tables` - Get list of tables
- `GET /api/tables/:tableName/data` - Get table data
- `PUT /api/tables/:tableName/records/:recordId` - Update a record
- `GET /api/health` - Health check

## Frontend Configuration

Make sure your frontend is configured to use this API server by updating the API endpoints in the database service.

# Customer Support Ticketing CRM

A clean, minimal, Notion/Linear-style Customer Support Ticketing CRM built with a React frontend and a FastAPI backend. It features a SQLite database, robust search filters, status trackers, and automatic local storage fallback with UI indicators when the API is offline.

---

## Tech Stack

- **Frontend**: React (v19), Vite, Tailwind CSS (v4), Axios, React Router (v6)
- **Backend**: FastAPI, SQLite3, Pydantic, Uvicorn, Python-dotenv
- **Testing**: Pytest, HTTPX, Pytest-asyncio

---

## Folder Structure Overview

```
customer-support-crm/
├── README.md                  ← Project documentation
├── .gitignore                 ← Root gitignore configuration
├── frontend/                  ← Frontend React application
│   ├── .env                   ← Local env config
│   ├── .env.example           ← Template env config
│   ├── package.json           ← Node dependencies
│   ├── src/
│   │   ├── api/tickets.js     ← Axios client definition
│   │   ├── components/        ← Reusable layout & badges
│   │   ├── hooks/             ← useTickets context and localStorage fallback
│   │   ├── pages/             ← TicketList, Detail, and Create pages
│   │   ├── utils/             ← Relative and static date helpers
│   │   ├── App.jsx            ← Router mappings
│   │   ├── main.jsx           ← App bootstrapper
│   │   └── index.css          ← Tailwind CSS v4 source file
│   └── vite.config.js         ← Vite React & Tailwind configurations
└── backend/                   ← Backend FastAPI application
    ├── .env                   ← Local backend variables
    ├── .env.example           ← Template env variables
    ├── database.py            ← SQLite tables generation & connection hook
    ├── main.py                ← FastAPI entry point & CORS
    ├── models.py              ← Pydantic validation schemas
    ├── routes/
    │   └── tickets.py         ← CRM endpoint routers
    ├── requirements.txt       ← Backend dependencies
    ├── requirements-test.txt  ← Test suite dependencies
    ├── test_api.py            ← 10 integration test cases
    └── run_tests.sh           ← Test execution helper
```

---

## Environment Variables Configuration

Ensure the following configuration files are set up locally:

### 1. Frontend (`frontend/.env`)
Create a file at `frontend/.env` with the backend API URL:
```env
VITE_API_URL=http://localhost:5000
```
*(A template is provided at `frontend/.env.example`)*

### 2. Backend (`backend/.env`)
Create a file at `backend/.env` defining the database path and port:
```env
DATABASE_URL=./crm.db
PORT=5000
```
*(A template is provided at `backend/.env.example`)*

---

## Local Setup & Run Instructions

To run this application locally, you will need to start both the backend server and the frontend client.

### Backend Setup
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the FastAPI development server:
   ```bash
   python main.py
   ```
The backend API documentation is available at [http://localhost:5000/docs](http://localhost:5000/docs).

### Frontend Setup
1. Navigate to the `frontend/` directory:
   ```bash
   cd ../frontend
   ```
2. Install Node packages:
   ```bash
   npm install
   ```
3. Start the Vite React client:
   ```bash
   npm run dev
   ```
The CRM client will boot up at [http://localhost:5173/](http://localhost:5173/).

---

## Running Integration Tests

We have implemented ten API verification tests covering ticket creation, search query filters, CORS middleware headers, and 404 boundaries.

To run tests:
1. Ensure the FastAPI server is running (`python main.py` on port 5000).
2. Open a new terminal inside the `backend/` folder and run:
   ```bash
   pytest test_api.py -v
   ```
   *(Alternatively, execute the automated runner: `sh run_tests.sh` or `./run_tests.sh`)*

Link :  https://vercel-project-vert-xi.vercel.app/

Overview
--------
The Project Management Dashboard is a React-based application designed to help you quickly organize employees, assign them to dedicated projects, and track specific tasks using a dynamic Drag-and-Drop Kanban Board.

Key Features:
- Employee Roster: Add, edit, or delete team members (with unique validations).
- Project Tracking: Create projects, define start and end dates, and assign specific team members.
- Task Management: Create tasks linked to specific projects and assign workers.
- Kanban Dashboard: A full visual board allowing you to quickly drag and drop tasks between columns (Need to Do, In Progress, Need for Test, Completed, Re-open).
- Local API Backend: State is managed via a local `json-server` REST API database, mimicking a real production backend.

Setup Instructions
------------------
To run this application locally, you'll need Node.js installed on your computer.

1. Clone or download this repository.
2. Open your terminal and navigate to the project directory:
   cd path/to/project-management-dashboard
3. Install all necessary dependencies:
   npm install
4. Start both the Vite Frontend and the JSON Local Server at the same time:
   npm run dev

Once running, the terminal will provide a local URL (typically http://localhost:5173 or 5174) for the user interface, while your underlying database API will run quietly on http://localhost:3001. All your data changes will be automatically recorded in the `db.json` file.


# Project Management Dashboard - Run Instructions

This project consists of two main parts that need to be running together:
1. The Frontend UI (built with Vite + React)
2. The Database API (simulated locally using `json-server`)

Here is how you can start them up.

---

## Setup 1: Running them separated (One by One)
If you prefer seeing the logs clearly separated, you can run the frontend and backend in two distinct terminal windows.

### Step 1: Start the Local Database API
1. Open a brand new terminal.
2. Navigate into the `project-management-dashboard` folder.
3. Run the following command to start the data server exactly on port 3001:
   npx json-server --watch db.json --port 3001
4. DO NOT close this terminal. Let it run in the background.

### Step 2: Start the React Frontend Application
1. Open a **second** new terminal window.
2. Navigate into your project folder.
3. Start the interface using standard Vite by typing:
   npx vite
4. The frontend will now start up (typically on `http://localhost:5173`) and will automatically connect to your running database backend!

---

## Setup 2: Running everything together (All at once)
We previously installed a helper package called `concurrently` into the project so you don't actually have to open two terminals if you don't want to.

To boot up both the **Database API** and the **Frontend UI** simultaneously from a single command, just open one terminal and run:

npm run dev

(This executes the script saved inside `package.json` which spins up both processes!)

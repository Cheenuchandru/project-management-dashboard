import React, { useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FolderKanban, CheckSquare } from 'lucide-react';

import Dashboard from './views/Dashboard';
import Projects from './views/Projects';
import Employees from './views/Employees';
import Tasks from './views/Tasks';


function App() {
  let location = useLocation();
    useEffect(() => {
    console.log("app loaded mounted");
  }, [])

  const navLinkStyle = (path) => {
    let isActive = false;
    if(location.pathname === path) {
      isActive = true;
    }
    return `btn btn-secondary ${isActive ? 'active-link' : ''}`;
  };

  return (
    <div className="app-container">
      <aside className="app-sidebar">
        <div>
          <h2 style={{ color: 'black', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px' }}>
            <div style={{ background: 'blue', padding: '5px', borderRadius: '4px', display: 'flex' }}>
              <FolderKanban size={20} color="white" />
            </div>
            Menu
          </h2>
        </div>
        <nav>
          <Link to="/" className={navLinkStyle('/')}>
            <LayoutDashboard size={18} /> 
            Dashboard
          </Link>
          <Link to="/projects" className={navLinkStyle('/projects')}>
            <FolderKanban size={18} /> 
            Projects
          </Link>
          <Link to="/tasks" className={navLinkStyle('/tasks')}>
            <CheckSquare size={18} /> 
            Tasks
          </Link>
          <Link to="/employees" className={navLinkStyle('/employees')}>
            <Users size={18} /> 
            Employees
          </Link>
        </nav>
      </aside>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/employees" element={<Employees />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

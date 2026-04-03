import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Select from '../components/Select';
import { Calendar } from 'lucide-react';

const COLUMNS = ['Need to Do', 'In Progress', 'Need for Test', 'Completed', 'Re-open'];
// css column
const cssCol = (col) => col.replace(/ /g, '-');

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:3001/tasks').then(res => res.json()),
      fetch('http://localhost:3001/projects').then(res => res.json()),
      fetch('http://localhost:3001/employees').then(res => res.json())
    ]).then(([tasksData, projectsData, employeesData]) => {
      setTasks(tasksData);
      setProjects(projectsData);
      setEmployees(employeesData);
      setLoading(false);
    });
  }, []);
  
  const [selectedProjectId, setSelectedProjectId] = useState('');
  
  let projectOptions = [];
  projects.forEach(p => {
      projectOptions.push({value: p.id, label: p.title});
  });

  let filteredTasks = tasks;
  if(selectedProjectId !== '') {
      filteredTasks = tasks.filter(t => t.projectId === selectedProjectId);
  }

  let groupedTasks = {};
  for(let col of COLUMNS) {
      groupedTasks[col] = filteredTasks.filter(t => t.column === col);
  }

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId !== destination.droppableId) {
      let newCol = destination.droppableId;
      fetch(`http://localhost:3001/tasks/${draggableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ column: newCol })
      }).then(() => {
        let newTasks = [...tasks];
        for(let i = 0; i < newTasks.length; i++) {
          if(newTasks[i].id === draggableId) {
            newTasks[i] = { ...newTasks[i], column: newCol };
            break;
          }
        }
        setTasks(newTasks);
      });
    }
  };

  const getAssigneeProfile = (empId) => {
      return employees.find(e => e.id === empId);
  }

  if (loading) return <div style={{ padding: '20px' }}>Loading Dashboard...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%'}}>
      <div className="flex-between" style={{ marginBottom: '20px' }}>
        <div>
          <h1>Overview Dashboard</h1>
          <p style={{ color: 'gray' }}>Drag and drop tasks across columns to update their status.</p>
        </div>
        <div className="dashboard-controls" style={{ width: '200px'}}>
          <Select 
            value={selectedProjectId} 
            onChange={(e) => setSelectedProjectId(e.target.value)}
            options={projectOptions}
            defaultOption="All Projects"
          />
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
          <div className="kanban-board">
            {COLUMNS.map(col => (
              <div key={col} className="kanban-column">
                <div className="kanban-column-header glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span>{col}</span>
                  </div>
                </div>

                <Droppable droppableId={col}>
                  {(provided, snapshot) => (
                    <div 
                      className={`kanban-column-body ${snapshot.isDraggingOver ? 'is-dragging-over' : ''}`}
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {groupedTasks[col].map((task, index) => {
                        let assignee = getAssigneeProfile(task.assignedEmployee);
                        return (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                className={`task-card`}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  ...provided.draggableProps.style,
                                  opacity: snapshot.isDragging ? 0.8 : 1,
                                  boxShadow: snapshot.isDragging ? '0 5px 15px rgba(0,0,0,0.2)' : undefined,
                                }}
                              >
                                {task.referenceImage && (
                                  <div style={{ width: '100%', height: '140px', overflow: 'hidden', marginBottom: '10px' }}>
                                    <img src={task.referenceImage} alt="Ref" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  </div>
                                )}
                                <h4 style={{ margin: 0, fontSize: '16px' }}>{task.title}</h4>
                                
                                {!selectedProjectId && (
                                  <div style={{ fontSize: '12px', color: 'blue', marginTop: '5px' }}>
                                    {projects.find(p => p.id === task.projectId)?.title}
                                  </div>
                                )}

                                <div className="flex-between" style={{ marginTop: '15px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'gray', fontSize: '12px' }}>
                                    <Calendar size={14} /> 
                                    <span>{new Date(task.eta).toLocaleDateString()}</span>
                                  </div>
                                  
                                  {assignee && (
                                    <div title={assignee.name} style={{ width: '30px', height: '30px', borderRadius: '50%', overflow: 'hidden', border: '1px solid #ccc' }}>
                                      <img src={assignee.profileImage} alt={assignee.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}  
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
      </DragDropContext>
    </div>
  );
}

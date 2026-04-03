import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Modal from '../components/Modal';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Plus } from 'lucide-react';

export default function Tasks() {
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const schema = yup.object().shape({
    title: yup.string().required('Title is required'),
    description: yup.string().required('Description is required'),
    projectId: yup.string().required('Project linking is required'),
    assignedEmployee: yup.string().required('Employee assignment is required'),
    eta: yup.date().required('ETA is required').typeError('Invalid date'),
    referenceImage: yup.string().url('Must be a valid URL').required('Image reference required')
  });

  const { register, handleSubmit, reset, watch, formState: { errors }, setValue } = useForm({
    resolver: yupResolver(schema)
  });

  const selectedProjId = watch('projectId');

  // get employees for project
  let activeProj = projects.find(p => p.id === selectedProjId);
  let employeeOptions = [];
  if (activeProj) {
      for(let empId of activeProj.assignedEmployees) {
          let e = employees.find(x => x.id === empId);
          if(e) {
              employeeOptions.push({ value: empId, label: e.name });
          }
      }
  }

  useEffect(() => {
    // Re-verify that the chosen employee exists in newly selected project's allowed roster
    if (activeProj && activeProj.assignedEmployees && !activeProj.assignedEmployees.includes(watch('assignedEmployee'))) {
      setValue('assignedEmployee', '');
    }
  }, [selectedProjId, activeProj, watch, setValue]);

  const openModal = (tsk = null) => {
    if (tsk) {
      setEditingId(tsk.id);
      setValue('title', tsk.title);
      setValue('description', tsk.description);
      setValue('projectId', tsk.projectId);
      setValue('assignedEmployee', tsk.assignedEmployee);
      setValue('eta', tsk.eta.split('T')[0]);
      setValue('referenceImage', tsk.referenceImage || '');
    } else {
      setEditingId(null);
      reset({ title: '', description: '', projectId: projects[0]?.id || '', assignedEmployee: '', eta: '', referenceImage: '' });
    }
    setIsModalOpen(true);
  };

  const onSubmit = (data) => {
    console.log("submitting task", data)
    let formattedData = {
      ...data,
      eta: data.eta.toISOString().split('T')[0],
      column: editingId ? tasks.find(t=>t.id === editingId).column : 'Need to Do'
    };
    if (editingId) {
        fetch(`http://localhost:3001/tasks/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...formattedData })
        }).then(res => res.json()).then(updated => {
          let newTasks = [...tasks];
          for (let i = 0; i < newTasks.length; i++) {
            if (newTasks[i].id === editingId) { newTasks[i] = updated; break; }
          }
          setTasks(newTasks);
          setIsModalOpen(false);
        });
    }
    else {
        let nid = Math.random().toString();
        let newTaskData = { id: nid, ...formattedData };
        fetch('http://localhost:3001/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTaskData)
        }).then(res => res.json()).then(added => {
          setTasks([...tasks, added]);
          setIsModalOpen(false);
        });
    }
  };

  const handleDelete = (id) => {
    if(window.confirm('Delete this task?')) {
      fetch(`http://localhost:3001/tasks/${id}`, {
        method: 'DELETE'
      }).then(() => {
        let newTasks = [];
        for(let i = 0; i < tasks.length; i++){
          if(tasks[i].id !== id) newTasks.push(tasks[i]);
        }
        setTasks(newTasks);
      });
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading Tasks...</div>;

  const projectOptions = projects.map(p => ({ value: p.id, label: p.title }));

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '20px' }}>
        <div>
          <h1>Task Management</h1>
          <p style={{ color: 'gray' }}>Create tasks linked to a specific project. Only employees in that project can be assigned.</p>
        </div>
        <Button onClick={() => openModal()} icon={<Plus size={16} />}>Create Task</Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {tasks.map(tsk => {
          let proj = projects.find(p => p.id === tsk.projectId);
          let emp = employees.find(e => e.id === tsk.assignedEmployee);
          return (
            <div key={tsk.id} className="basic-panel task-list-item">
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 5px 0' }}>{tsk.title}</h3>
                <p style={{ margin: '0 0 10px 0', color: 'gray', fontSize: '14px' }}>{tsk.description}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', fontSize: '12px', color: 'black' }}>
                  <span style={{ background: '#eee', padding: '4px 10px', borderRadius: '12px' }}>{proj?.title}</span>
                  <span style={{ color: 'blue', whiteSpace: 'nowrap' }}>ETA: {tsk.eta}</span>
                  <span style={{ whiteSpace: 'nowrap' }}>Status: <strong>{tsk.column}</strong></span>
                </div>
              </div>
              {emp && (
                <div style={{ textAlign: 'center' }}>
                  <img src={emp.profileImage} alt={emp.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div style={{ fontSize: '12px', marginTop: '5px', color: 'gray' }}>{emp.name}</div>
                </div>
              )}
              <div className="task-actions">
                <button onClick={() => openModal(tsk)} className="btn btn-secondary">Edit</button>
                <button onClick={() => handleDelete(tsk.id)} className="btn btn-danger">Delete</button>
              </div>
            </div>
          )
        })}
        {tasks.length === 0 && <div style={{textAlign: 'center', padding: '50px', color: 'gray'}}>No tasks available.</div>}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Task" : "Create Task"}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input label="Task Title" {...register('title')} error={errors.title?.message} />
          
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows="2" {...register('description')}></textarea>
            {errors.description && <span className="form-error">{errors.description.message}</span>}
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ flex: 1 }}>
              <Select label="Project" {...register('projectId')} options={projectOptions} error={errors.projectId?.message} />
            </div>
            <div style={{ flex: 1 }}>
              <Select label="Assign Employee" disabled={!selectedProjId} {...register('assignedEmployee')} options={employeeOptions} error={errors.assignedEmployee?.message} defaultOption="Select worker..." />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ flex: 1 }}>
              <Input type="date" label="ETA" {...register('eta')} error={errors.eta?.message} />
            </div>
          </div>

          <Input label="Reference Image URL" {...register('referenceImage')} error={errors.referenceImage?.message} />

          <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            {/* <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button> */}
            <Button type="submit">Save Task</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

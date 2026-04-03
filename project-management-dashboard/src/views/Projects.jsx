import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:3001/projects').then(res => res.json()),
      fetch('http://localhost:3001/employees').then(res => res.json())
    ]).then(([projData, empData]) => {
      setProjects(projData);
      setEmployees(empData);
      setLoading(false);
    });
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // const [loading, setLoading] = useState(false); // remove later

  const schema = yup.object().shape({
    title: yup.string().required('Title is required'),
    description: yup.string().required('Description is required'),
    logo: yup.string().url('Must be a valid URL').required('Logo URL is required'),
    startDate: yup.date().required('Start date is required').typeError('Invalid date'),
    endDate: yup.date().required('End date is required').typeError('Invalid date'),
    assignedEmployees: yup.array().min(1, 'Assign at least one employee').required()
  });

  const { register, handleSubmit, reset, control, formState: { errors }, setValue } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { assignedEmployees: [] }
  });

  const openModal = (proj = null) => {
    if (proj) {
      setEditingId(proj.id);
      setValue('title', proj.title);
      setValue('description', proj.description);
      setValue('logo', proj.logo);
      setValue('startDate', proj.startDate);
      setValue('endDate', proj.endDate);
      setValue('assignedEmployees', proj.assignedEmployees);
    } else {
      setEditingId(null);
      reset({ title: '', description: '', logo: '', startDate: '', endDate: '', assignedEmployees: [] });
    }
    setIsModalOpen(true);
  };

  const onSubmit = (data) => {
    let formattedData = {};
    formattedData.title = data.title;
    formattedData.description = data.description;
    formattedData.logo = data.logo;
    formattedData.startDate = data.startDate.toISOString().slice(0, 16);
    formattedData.endDate = data.endDate.toISOString().slice(0, 16);
    formattedData.assignedEmployees = data.assignedEmployees;

    if (editingId) {
        let updateData = { id: editingId, ...formattedData };
        fetch(`http://localhost:3001/projects/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        }).then(res => res.json()).then(updated => {
          let newProj = [...projects];
          for (let i = 0; i < newProj.length; i++) {
            if (newProj[i].id === editingId) { newProj[i] = updated; break; }
          }
          setProjects(newProj);
          setIsModalOpen(false);
        });
    }
    else {
        let newId = Math.random().toString(36).substring(7); // uuid alternative
        let newProjData = { id: newId, ...formattedData };
        fetch('http://localhost:3001/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProjData)
        }).then(res => res.json()).then(added => {
          setProjects([...projects, added]);
          setIsModalOpen(false);
        });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this project?")) {
        fetch(`http://localhost:3001/projects/${id}`, {
          method: 'DELETE'
        }).then(() => {
          let newProj = [];
          for (let i = 0; i < projects.length; i++) {
            if (projects[i].id !== id) newProj.push(projects[i]);
          }
          setProjects(newProj);
        });
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading Projects...</div>;

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '20px' }}>
        <div>
          <h1>Projects</h1>
          <p style={{ color: 'gray' }}>Manage your active workspaces.</p>
        </div>
        <Button onClick={() => openModal()} >New Project</Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {projects.map((proj, i) => (
          <div key={proj.id} className="basic-panel" style={{ padding: '20px', display: 'flex', gap: '20px', border: '1px solid #ccc', background: 'white', borderRadius: '8px' }}>
            <p></p>
            <div style={{ flex: 1 }}>
              <div className="flex-between" style={{ alignItems: 'flex-start' }}>
                <h3 style={{ margin: '0 0 10px 0' }}>{proj.title}</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => openModal(proj)} className="btn btn-secondary">Edit</button>
                  <button onClick={() => handleDelete(proj.id)} className="btn btn-danger">Delete</button>
                </div>
              </div>
              <p style={{ color: '#666', marginBottom: '15px' }}>{proj.description}</p>
              
              <div style={{ display: 'flex', gap: '30px', fontSize: '14px' }}>
                <div style={{ color: '#666' }}>
                   Start: {new Date(proj.startDate).toLocaleString()} <br/>
                   End: {new Date(proj.endDate).toLocaleString()}
                </div>
                <div>
                  <span style={{ color: '#666' }}>Team: </span>
                  <div style={{ display: 'flex', marginTop: '5px' }}>
                    {proj.assignedEmployees.map((empId, idx) => {
                      let e = employees.find(x => x.id === empId);
                      if (!e) return null;
                      return <img key={empId} src={e.profileImage} title={e.name} alt={e.name} style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1px solid white', marginLeft: idx > 0 ? '-10px' : '0' }} />
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {projects.length === 0 && <div style={{textAlign: 'center', padding: '50px'}}>No projects defined.</div>}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Project" : "Create Project"}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input label="Project Title" {...register('title')} error={errors.title?.message} />
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows="3" {...register('description')}></textarea>
            {errors.description && <span className="form-error">{errors.description.message}</span>}
          </div>
          <Input label="Project Logo URL" {...register('logo')} error={errors.logo?.message} />
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ flex: 1 }}><Input type="datetime-local" label="Start Date" {...register('startDate')} error={errors.startDate?.message} /></div>
            <div style={{ flex: 1 }}><Input type="datetime-local" label="End Date" {...register('endDate')} error={errors.endDate?.message} /></div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Assign Employees to Project</label>
            <Controller
              name="assignedEmployees"
              control={control}
              render={({ field }) => (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '15px', background: '#f9f9f9', border: '1px solid #ddd', borderRadius: '4px' }}>
                  {employees.map(emp => (
                    <label key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        value={emp.id}
                        checked={field.value.includes(emp.id)}
                        onChange={(e) => {
                          let val = e.target.value;
                          field.onChange(e.target.checked ? [...field.value, val] : field.value.filter(v => v !== val));
                        }}
                      />
                      {emp.name}
                    </label>
                  ))}
                </div>
              )}
            />
            {errors.assignedEmployees && <span className="form-error">{errors.assignedEmployees.message}</span>}
          </div>

          <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
            {/* <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button> */}
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

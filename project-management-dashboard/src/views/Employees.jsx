import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/employees')
      .then(res => res.json())
      .then(data => {
        setEmployees(data);
        setLoading(false);
      });
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // let testVar = "hello"; // for testing

  const schema = yup.object().shape({
    name: yup.string().required('Name is required'),
    position: yup.string().required('Position is required'),
    email: yup.string().email('Invalid email format').required('Email is required')
      .test('unique-email', 'Email is already taken', function(value) {
        if (!value) return true;
        let dup = employees.find(e => e.email === value && e.id !== editingId);
        if(dup) {
            return false;
        }
        return true;
      }),
    profileImage: yup.string().url('Must be a valid URL').required('Profile image is required')
  });

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm({
    resolver: yupResolver(schema)
  });

  const openModal = (emp = null) => {
    if (emp) {
      setEditingId(emp.id);
      setValue('name', emp.name);
      setValue('position', emp.position);
      setValue('email', emp.email);
      setValue('profileImage', emp.profileImage);
    } else {
      setEditingId(null);
      reset({ name: '', position: '', email: '', profileImage: '' });
    }
    setIsModalOpen(true);
  };

  const onSubmit = (data) => {
    if (editingId) {
      fetch(`http://localhost:3001/employees/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json()).then(updated => {
        let newEmp = [...employees];
        for(let i=0; i<newEmp.length; i++) {
          if (newEmp[i].id === editingId) { newEmp[i] = updated; break; }
        }
        setEmployees(newEmp);
        setIsModalOpen(false);
      });
    } else {
      let newId = uuidv4();
      let newEmpData = { id: newId, ...data };
      fetch('http://localhost:3001/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmpData)
      }).then(res => res.json()).then(added => {
        setEmployees([...employees, added]);
        setIsModalOpen(false);
      });
    }
  };

  const handleDelete = (id) => {
    let confirmDelete = window.confirm("Are you sure you want to delete this employee?");
    if (confirmDelete) {
      fetch(`http://localhost:3001/employees/${id}`, {
        method: 'DELETE'
      }).then(() => {
        let newEmp = [];
        for(let i=0; i<employees.length; i++) {
          if(employees[i].id !== id) newEmp.push(employees[i]);
        }
        setEmployees(newEmp);
      });
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading Employees...</div>;

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '20px' }}>
        <div>
          <h1>Employees</h1>
          <p style={{ color: 'grey' }}>Manage your team members and roles. All fields are mandatory and emails must be unique.</p>
        </div>
        <Button onClick={() => openModal()} icon={<Plus size={16} />}>Add Employee</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {employees.map(emp => (
          <div key={emp.id} className="basic-panel" style={{ padding: '15px', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid #ccc', borderRadius: '8px', background: 'white' }}>
            <img src={emp.profileImage} alt={emp.name} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0 }}>{emp.name}</h3>
              <p style={{ margin: '5px 0', color: 'gray', fontSize: '14px' }}>{emp.position}</p>
              <p style={{ margin: 0, fontSize: '12px', opacity: 0.7 }}>{emp.email}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button onClick={() => openModal(emp)} className="btn btn-secondary" style={{ padding: '5px' }}>Edit</button>
              <button onClick={() => handleDelete(emp.id)} className="btn btn-danger" style={{ padding: '5px' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Employee" : "Add New Employee"}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input label="Full Name" {...register('name')} error={errors.name?.message} placeholder="e.g. John Doe" />
          <Input label="Position" {...register('position')} error={errors.position?.message} placeholder="e.g. Senior Developer" />
          <Input label="Official Email" type="email" {...register('email')} error={errors.email?.message} placeholder="john@powersoft.com" />
          <Input label="Profile Image URL" {...register('profileImage')} error={errors.profileImage?.message} placeholder="https://..." />
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            {/* <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button> */}
            <Button type="submit">Save Employee</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

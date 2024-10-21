// src/components/CreateTask.tsx
import React, { useState, useContext } from 'react';
import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { FirebaseError } from 'firebase/app';
import { Task } from '../types';

const CreateTask: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<'Low' | 'Normal' | 'Urgent'>('Normal');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false); // Added loading state
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
  
    if (!currentUser) {
      setError('You must be logged in to create a task.');
      setLoading(false);
      return;
    }
  
    if (title.trim() === '' || description.trim() === '') {
      setError('Title and Description are required.');
      setLoading(false);
      return;
    }
  
    try {
      const taskData: Task = {
        title,
        description,
        priority,
        createdAt: Timestamp.fromDate(new Date()), // Ensure Task interface uses Timestamp
        userId: currentUser.uid,
      };
      
      await addDoc(collection(db, 'tasks'), taskData);
      // Redirect to TaskBoard or another page after successful creation
      navigate('/dashboard');
    } catch (err: unknown) {
      console.error('Error adding task:', err);
      if (err instanceof FirebaseError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create task. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleCreateTask}
        className="bg-white p-6 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl mb-4 text-center">Create New Task</h2>
        {error && (
          <div className="mb-4 text-red-500 text-sm">
            {error}
          </div>
        )}
        <div className="mb-4">
          <label className="block text-gray-700">Title</label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border rounded mt-1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task Title"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Description</label>
          <textarea
            required
            className="w-full px-3 py-2 border rounded mt-1"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Task Description"
            rows={4}
          ></textarea>
        </div>
        <div className="mb-6">
          <label className="block text-gray-700">Priority</label>
          <select
            className="w-full px-3 py-2 border rounded mt-1"
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'Low' | 'Normal' | 'Urgent')}
          >
            <option value="Low">Low</option>
            <option value="Normal">Normal</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
          disabled={loading} // Disable button when loading
        >
          {loading ? 'Creating Task...' : 'Create Task'}
        </button>
      </form>
    </div>
  );
};

export default CreateTask;

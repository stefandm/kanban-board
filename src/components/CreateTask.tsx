// src/components/CreateTask.tsx
import React, { useState, useContext, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, Timestamp, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Contact } from '../types';
import { FirebaseError } from 'firebase/app';


const CreateTask: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<'Low' | 'Normal' | 'Urgent'>('Normal');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchContacts = async () => {
      if (currentUser) {
        try {
          const contactsRef = collection(db, 'contacts');
          const q = query(contactsRef, where('userId', '==', currentUser.uid));
          const querySnapshot = await getDocs(q);
          const contactsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...(doc.data() as Contact),
          }));
          setContacts(contactsData);
        } catch (err) {
          console.error('Error fetching contacts:', err);
        }
      }
    };

    fetchContacts();
  }, [currentUser]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
  
    if (!currentUser) {
      setError('You must be logged in to create a task.');
      return;
    }
  
    if (title.trim() === '' || description.trim() === '' || assignedTo.trim() === '') {
      setError('Title, Description, and Assigned To are required.');
      return;
    }
  
    try {
      await addDoc(collection(db, 'tasks'), {
        title,
        description,
        priority,
        assignedTo,
        createdAt: Timestamp.fromDate(new Date()),
        userId: currentUser.uid,
      });
      // Redirect to TaskBoard or another page after successful creation
      navigate('/dashboard');
    } catch (err: unknown) {  // Replace 'any' with 'unknown'
      console.error('Error adding task:', err);
  
      // Type checking using type guards
      if (err instanceof FirebaseError) {
        setError(err.message);  // Firebase-specific error message
      } else if (err instanceof Error) {
        setError(err.message);  // General JavaScript error message
      } else {
        setError('Failed to create task. Please try again.');
      }
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
        <div className="mb-4">
          <label className="block text-gray-700">Assigned To</label>
          <select
            required
            className="w-full px-3 py-2 border rounded mt-1"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
          >
            <option value="">Select a contact</option>
            {contacts.map(contact => (
              <option key={contact.id} value={contact.id}>
                {contact.name} ({contact.email})
              </option>
            ))}
          </select>
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
        >
          Create Task
        </button>
      </form>
    </div>
  );
};

export default CreateTask;

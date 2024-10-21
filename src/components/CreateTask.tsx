// src/components/CreateTask.tsx
import React, { useState, useContext, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection,
  addDoc,
  Timestamp,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Contact } from '../types';
import { FirebaseError } from 'firebase/app';

const CreateTask: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<'Low' | 'Normal' | 'Urgent'>('Normal');
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [category, setCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<string>('');
  const [subtaskInput, setSubtaskInput] = useState<string>(''); // Input for new subtask
  const [subtasks, setSubtasks] = useState<string[]>([]); // List of subtasks
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
          const contactsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Contact),
          }));
          setContacts(contactsData);
        } catch (err) {
          console.error('Error fetching contacts:', err);
        }
      }
    };

    const fetchCategories = async () => {
      if (currentUser) {
        try {
          const tasksRef = collection(db, 'tasks');
          const q = query(tasksRef, where('userId', '==', currentUser.uid));
          const querySnapshot = await getDocs(q);
          const categoriesSet = new Set<string>();
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.category) {
              categoriesSet.add(data.category);
            }
          });
          setCategories(Array.from(categoriesSet));
        } catch (err) {
          console.error('Error fetching categories:', err);
        }
      }
    };

    fetchContacts();
    fetchCategories();
  }, [currentUser]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentUser) {
      setError('You must be logged in to create a task.');
      return;
    }

    if (
      title.trim() === '' ||
      description.trim() === '' ||
      assignedTo.length === 0 ||
      category.trim() === '' ||
      dueDate.trim() === ''
    ) {
      setError(
        'Title, Description, Assigned To, Category, and Due Date are required.'
      );
      return;
    }

    try {
      await addDoc(collection(db, 'tasks'), {
        title,
        description,
        priority,
        assignedTo,
        category,
        dueDate: Timestamp.fromDate(new Date(dueDate)),
        createdAt: Timestamp.fromDate(new Date()),
        userId: currentUser.uid,
        subtasks, // Include subtasks array
        status: 'To do',
      });
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
    }
  };

  const handleAssignedToChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const selectedContacts: string[] = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedContacts.push(options[i].value);
      }
    }
    setAssignedTo(selectedContacts);
  };

  const handleAddSubtask = () => {
    if (subtaskInput.trim() !== '') {
      setSubtasks([...subtasks, subtaskInput.trim()]);
      setSubtaskInput('');
    }
  };

  const handleRemoveSubtask = (index: number) => {
    const newSubtasks = subtasks.filter((_, idx) => idx !== index);
    setSubtasks(newSubtasks);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleCreateTask}
        className="bg-white p-6 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl mb-4 text-center">Create New Task</h2>
        {error && (
          <div className="mb-4 text-red-500 text-sm">{error}</div>
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
            multiple
            required
            className="w-full px-3 py-2 border rounded mt-1"
            value={assignedTo}
            onChange={handleAssignedToChange}
          >
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.name} ({contact.email})
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Hold down the Ctrl (Windows) or Command (Mac) key to select
            multiple contacts.
          </p>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Category</label>
          <input
            list="category-list"
            required
            className="w-full px-3 py-2 border rounded mt-1"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Enter or select a category"
          />
          <datalist id="category-list">
            {categories.map((cat, index) => (
              <option key={index} value={cat} />
            ))}
          </datalist>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Due Date</label>
          <input
            type="date"
            required
            className="w-full px-3 py-2 border rounded mt-1"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Subtasks</label>
          <div className="flex">
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-l mt-1"
              value={subtaskInput}
              onChange={(e) => setSubtaskInput(e.target.value)}
              placeholder="Enter a subtask"
            />
            <button
              type="button"
              onClick={handleAddSubtask}
              className="bg-blue-500 text-white px-4 py-2 rounded-r mt-1 hover:bg-blue-600"
            >
              Add
            </button>
          </div>
          {subtasks.length > 0 && (
            <ul className="mt-2">
              {subtasks.map((subtask, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between bg-gray-200 p-2 rounded mt-1"
                >
                  <span>{subtask}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mb-6">
          <label className="block text-gray-700">Priority</label>
          <select
            className="w-full px-3 py-2 border rounded mt-1"
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value as 'Low' | 'Normal' | 'Urgent')
            }
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

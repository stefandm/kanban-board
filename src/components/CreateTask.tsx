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
import {
  FaPlusCircle,
  FaUser,
  FaCalendarAlt,
  FaListAlt,
  FaTag,
  FaTasks,
  FaExclamationCircle,
  FaTrashAlt,
  FaEraser,
} from 'react-icons/fa';
import Select from 'react-select';

const CreateTask: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<'Low' | 'Normal' | 'Urgent'>('Normal');
  const [assignedTo, setAssignedTo] = useState<Contact[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [category, setCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<string>('');
  const [subtaskInput, setSubtaskInput] = useState<string>('');
  const [subtask, setSubtask] = useState<string[]>([]);
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
        assignedTo: assignedTo.map((contact) => contact.id),
        category,
        dueDate: Timestamp.fromDate(new Date(dueDate)),
        createdAt: Timestamp.fromDate(new Date()),
        userId: currentUser.uid,
        subtask,
        status: 'To do',
      });
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

  const handleAddSubtask = () => {
    if (subtaskInput.trim() !== '') {
      setSubtask([...subtask, subtaskInput.trim()]);
      setSubtaskInput('');
    }
  };

  const handleRemoveSubtask = (index: number) => {
    const newSubtasks = subtask.filter((_, idx) => idx !== index);
    setSubtask(newSubtasks);
  };

  const handleClearFields = () => {
    setTitle('');
    setDescription('');
    setPriority('Normal');
    setAssignedTo([]);
    setCategory('');
    setDueDate('');
    setSubtask([]);
    setSubtaskInput('');
    setError('');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-purple-100 p-4">
      <form
        onSubmit={handleCreateTask}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg"
      >
        <h2 className="text-3xl md:text-4xl mb-6 text-center font-bold text-blue-700 flex items-center justify-center">
          <FaPlusCircle className="mr-3 text-blue-700 text-4xl" /> Create New Task
        </h2>
        {error && <div className="mb-6 text-red-500 text-md">{error}</div>}
        {/* Title */}
        <div className="mb-6">
          <label className="block text-gray-700 text-lg font-medium mb-2">Title</label>
          <div className="relative">
            <FaTasks className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              required
              className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task Title"
            />
          </div>
        </div>
        {/* Description */}
        <div className="mb-6">
          <label className="block text-gray-700 text-lg font-medium mb-2">Description</label>
          <div className="relative">
            <FaListAlt className="absolute left-3 top-3 text-gray-400" />
            <textarea
              required
              className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task Description"
              rows={4}
            ></textarea>
          </div>
        </div>
        {/* Assigned To */}
        <div className="mb-6">
          <label className="block text-gray-700 text-lg font-medium mb-2">Assigned To</label>
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <div className="pl-12">
              <Select
                isMulti
                options={contacts.map((contact) => ({
                  value: contact.id,
                  label: `${contact.name} (${contact.email})`,
                }))}
                className="react-select-container"
                classNamePrefix="react-select"
                value={assignedTo.map((contact) => ({
                  value: contact.id,
                  label: `${contact.name} (${contact.email})`,
                }))}
                onChange={(selectedOptions) => {
                  setAssignedTo(
                    selectedOptions.map((option) => {
                      const contact = contacts.find((c) => c.id === option.value);
                      return contact!;
                    })
                  );
                }}
                placeholder="Select Contacts"
              />
            </div>
          </div>
        </div>
        {/* Category */}
        <div className="mb-6">
          <label className="block text-gray-700 text-lg font-medium mb-2">Category</label>
          <div className="relative">
            <FaTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              list="category-list"
              required
              className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        </div>
        {/* Due Date */}
        <div className="mb-6">
          <label className="block text-gray-700 text-lg font-medium mb-2">Due Date</label>
          <div className="relative">
            <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              required
              className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>
        {/* Subtasks */}
        <div className="mb-6">
          <label className="block text-gray-700 text-lg font-medium mb-2">Subtasks</label>
          <div className="flex">
            <div className="relative w-full">
              <FaTasks className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="w-full pl-12 pr-4 py-3 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                placeholder="Enter a subtask"
              />
            </div>
            <button
              type="button"
              onClick={handleAddSubtask}
              className="bg-blue-600 text-white px-4 py-3 rounded-r-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Add
            </button>
          </div>
          {subtask.length > 0 && (
            <ul className="mt-4">
              {subtask.map((subtaskItem, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between bg-gray-200 p-3 rounded-lg mt-2"
                >
                  <span>{subtaskItem}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(index)}
                    className="text-red-500 hover:text-red-700 transition-colors duration-200"
                  >
                    <FaTrashAlt />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Priority */}
        <div className="mb-6">
          <label className="block text-gray-700 text-lg font-medium mb-2">Priority</label>
          <div className="relative">
            <FaExclamationCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'Low' | 'Normal' | 'Urgent')}
            >
              <option value="Low">Low</option>
              <option value="Normal">Normal</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>
        {/* Buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleClearFields}
            className="w-1/2 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors duration-200 text-lg font-semibold mr-2 flex items-center justify-center"
          >
            <FaEraser className="mr-2" />
            Clear
          </button>
          <button
            type="submit"
            className="w-1/2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 text-lg font-semibold ml-2 flex items-center justify-center"
          >
            <FaPlusCircle className="mr-2" />
            Create Task
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTask;

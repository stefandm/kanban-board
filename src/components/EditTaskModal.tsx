// src/components/EditTaskModal.tsx

import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  doc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { Contact, Task, Subtask } from '../types';
import {
  FaTimes,
  FaUser,
  FaTag,
  FaCalendarAlt,
  FaTasks,
  FaListAlt,
  FaExclamationCircle,
  FaTrashAlt,
  FaEdit,
} from 'react-icons/fa';
import Select from 'react-select';

interface EditTaskModalProps {
  task: Task;
  contacts: Contact[];
  categories: string[];
  onClose: () => void;
  onUpdate: (updatedTask: Task) => void;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({
  task,
  contacts,
  categories,
  onClose,
  onUpdate,
}) => {
  const [title, setTitle] = useState<string>(task.title);
  const [description, setDescription] = useState<string>(task.description);
  const [priority, setPriority] = useState<'Low' | 'Normal' | 'Urgent'>(
    task.priority || 'Normal'
  );
  const [assignedTo, setAssignedTo] = useState<Contact[]>([]);
  const [category, setCategory] = useState<string>(task.category);
  const [dueDate, setDueDate] = useState<string>(
    task.dueDate instanceof Timestamp
      ? task.dueDate.toDate().toISOString().substr(0, 10)
      : ''
  );
  const [subtaskInput, setSubtaskInput] = useState<string>('');
  const [subtask, setSubtask] = useState<Subtask[]>(task.subtask || []);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Map assignedTo IDs to Contact objects
    const assignedContacts = contacts.filter((contact) =>
      task.assignedTo.includes(contact.id || '')
    );
    setAssignedTo(assignedContacts);
  }, [contacts, task.assignedTo]);

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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

    const updatedTask: Task = {
      ...task,
      title,
      description,
      priority,
      assignedTo: assignedTo.map((contact) => contact.id!),
      category,
      dueDate: Timestamp.fromDate(new Date(dueDate)),
      subtask,
    };

    try {
      const taskRef = doc(db, 'tasks', task.id!);
      await updateDoc(taskRef, {
        title: updatedTask.title,
        description: updatedTask.description,
        priority: updatedTask.priority,
        assignedTo: updatedTask.assignedTo,
        category: updatedTask.category,
        dueDate: updatedTask.dueDate,
        subtask: updatedTask.subtask,
      });
      onUpdate(updatedTask);
      onClose();
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task. Please try again.');
    }
  };

  const handleAddSubtask = () => {
    if (subtaskInput.trim() !== '') {
      const newSubtask: Subtask = {
        description: subtaskInput.trim(),
        status: 'not done',
      };
      setSubtask([...subtask, newSubtask]);
      setSubtaskInput('');
    }
  };

  const handleRemoveSubtask = (index: number) => {
    const newSubtasks = subtask.filter((_, idx) => idx !== index);
    setSubtask(newSubtasks);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 focus:outline-none"
        >
          <FaTimes size={20} />
        </button>
        <h2 className="text-3xl md:text-4xl mb-6 text-center font-bold text-blue-700 flex items-center justify-center">
          <FaEdit className="mr-3 text-blue-700 text-4xl" /> Edit Task
        </h2>
        {error && <div className="mb-6 text-red-500 text-md">{error}</div>}
        <form onSubmit={handleUpdateTask}>
          {/* Title */}
          <div className="mb-6">
            <label className="block text-gray-700 text-lg font-medium mb-2">
              Title
            </label>
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
            <label className="block text-gray-700 text-lg font-medium mb-2">
              Description
            </label>
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
            <label className="block text-gray-700 text-lg font-medium mb-2">
              Assigned To
            </label>
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
                        const contact = contacts.find(
                          (c) => c.id === option.value
                        );
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
            <label className="block text-gray-700 text-lg font-medium mb-2">
              Category
            </label>
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
            <label className="block text-gray-700 text-lg font-medium mb-2">
              Due Date
            </label>
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
            <label className="block text-gray-700 text-lg font-medium mb-2">
              Subtasks
            </label>
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
                    <span>{subtaskItem.description}</span>
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
            <label className="block text-gray-700 text-lg font-medium mb-2">
              Priority
            </label>
            <div className="relative">
              <FaExclamationCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          </div>
          {/* Buttons */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors duration-200 text-lg font-semibold flex items-center justify-center"
            >
              <FaEdit className="mr-2" />
              Update Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;

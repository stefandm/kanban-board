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
import CreatableSelect from 'react-select/creatable';

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
  categories: initialCategories,
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
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [dueDate, setDueDate] = useState<string>(
    task.dueDate instanceof Timestamp
      ? task.dueDate.toDate().toISOString().substr(0, 10)
      : ''
  );
  const [subtaskInput, setSubtaskInput] = useState<string>('');
  const [subtask, setSubtask] = useState<Subtask[]>(task.subtask || []);
  const [status, setStatus] = useState<string>(task.status);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Map assignedTo IDs to Contact objects
    const assignedContacts = contacts.filter((contact) =>
      task.assignedTo.includes(contact.id || '')
    );
    setAssignedTo(assignedContacts);
  }, [contacts, task.assignedTo]);

  // Function to handle creation of a new category and add it to the categories list
  const handleCreateCategory = (inputValue: string) => {
    const newCategory = inputValue.trim();
    if (newCategory && !categories.includes(newCategory)) {
      setCategories((prev) => [...prev, newCategory]);
    }
    setCategory(newCategory);
  };

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
      status,
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
        status: updatedTask.status,
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

  // Function to toggle subtask status
  const handleSubtaskStatusChange = (index: number) => {
    const updatedSubtasks = [...subtask];
    updatedSubtasks[index].status =
      updatedSubtasks[index].status === 'done' ? 'not done' : 'done';
    setSubtask(updatedSubtasks);
  };

  // Function to edit subtask description
  const handleSubtaskDescriptionChange = (
    index: number,
    newDescription: string
  ) => {
    const updatedSubtasks = [...subtask];
    updatedSubtasks[index].description = newDescription;
    setSubtask(updatedSubtasks);
  };

 
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl relative overflow-y-auto max-h-screen">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 focus:outline-none"
        >
          <FaTimes size={20} />
        </button>
        <h2 className="text-3xl md:text-4xl mb-6 text-center font-bold flex items-center justify-center">
          <FaEdit className="mr-3 text-blue-700 text-4xl" /> Edit Task
        </h2>
        {error && <div className="mb-6 text-red-500 text-md">{error}</div>}

        {/* Responsive Grid Layout */}
        <form onSubmit={handleUpdateTask}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div>
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
                  <div className="pl-12">
                    <CreatableSelect
                      isClearable
                      options={categories.map((cat) => ({
                        value: cat,
                        label: cat,
                      }))}
                      value={category ? { value: category, label: category } : null}
                      onChange={(newValue) => {
                        if (newValue) {
                          setCategory(newValue.value);
                        } else {
                          setCategory('');
                        }
                      }}
                      onCreateOption={handleCreateCategory}
                      placeholder="Enter or select a category"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div>
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
                    className="bg-gray-700 text-white px-4 py-3 rounded-r-lg hover:bg-blue-700 transition-colors duration-200"
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
                        <div className="flex items-center">
                          {/* Checkbox to toggle status */}
                          <input
                            type="checkbox"
                            className="mr-2"
                            checked={subtaskItem.status === 'done'}
                            onChange={() => handleSubtaskStatusChange(index)}
                          />
                          {/* Editable subtask description */}
                          <input
                            type="text"
                            className={`flex-1 bg-transparent border-none focus:outline-none ${
                              subtaskItem.status === 'done'
                                ? 'line-through text-gray-500'
                                : ''
                            }`}
                            value={subtaskItem.description}
                            onChange={(e) =>
                              handleSubtaskDescriptionChange(index, e.target.value)
                            }
                          />
                        </div>
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

              {/* Status */}
              <div className="mb-6">
                <label className="block text-gray-700 text-lg font-medium mb-2">
                  Status
                </label>
                <div className="relative">
                  <FaListAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="To do">To do</option>
                    <option value="In progress">In progress</option>
                    <option value="Awaiting Feedback">Awaiting Feedback</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-center mt-6">

            <button
              type="submit"
              className="w-full lg:w-1/2 shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px] py-3 rounded-lg bg-gray-500 hover:bg-green-700 text-white transition-colors duration-200 text-lg font-semibold ml-2 flex items-center justify-center"
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

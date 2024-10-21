// src/components/EditTaskModal.tsx
import React, { useState } from 'react';
import { Task, Contact } from '../types';
import { Timestamp } from 'firebase/firestore';

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
    task.priority
  );
  const [assignedTo, setAssignedTo] = useState<string[]>(task.assignedTo);
  const [category, setCategory] = useState<string>(task.category);
  const [dueDate, setDueDate] = useState<string>(
    task.dueDate instanceof Timestamp
      ? task.dueDate.toDate().toISOString().split('T')[0]
      : ''
  );
  const [subtaskInput, setSubtaskInput] = useState<string>('');
  const [subtask, setSubtask] = useState<string[]>(task.subtask || []);
  const [status, setStatus] = useState<string>(task.status);
  const [error, setError] = useState<string>('');

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
      setSubtask([...subtask, subtaskInput.trim()]);
      setSubtaskInput('');
    }
  };

  const handleRemoveSubtask = (index: number) => {
    const newSubtasks = subtask.filter((_, idx) => idx !== index);
    setSubtask(newSubtasks);
  };

  const handleSubmit = (e: React.FormEvent) => {
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
      assignedTo,
      category,
      dueDate: Timestamp.fromDate(new Date(dueDate)),
      subtask,
      status,
    };

    onUpdate(updatedTask);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          &#10005;
        </button>
        <h2 className="text-2xl mb-4 text-center">Edit Task</h2>
        {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}
        <form onSubmit={handleSubmit}>
          {/* Title */}
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
          {/* Description */}
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
          {/* Assigned To */}
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
          {/* Category */}
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
          {/* Due Date */}
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
          {/* Subtasks */}
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
            {subtask.length > 0 && (
              <ul className="mt-2">
                {subtask.map((subtask, index) => (
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
          {/* Priority */}
          <div className="mb-4">
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
          {/* Status */}
          <div className="mb-6">
            <label className="block text-gray-700">Status</label>
            <select
              className="w-full px-3 py-2 border rounded mt-1"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="To do">To do</option>
              <option value="In progress">In progress</option>
              <option value="Awaiting Feedback">Awaiting Feedback</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
          >
            Update Task
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;

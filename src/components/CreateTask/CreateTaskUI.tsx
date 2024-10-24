import React from 'react';
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
import CreatableSelect from 'react-select/creatable';
import Modal from '../Modal';
import { CreateTaskLogicData } from './CreateTaskLogic';

interface CreateTaskUIProps extends CreateTaskLogicData {
  isOpen: boolean;
  onClose: () => void;
}

const CreateTaskUI: React.FC<CreateTaskUIProps> = ({
  isOpen,
  onClose,
  title,
  setTitle,
  description,
  setDescription,
  priority,
  setPriority,
  assignedTo,
  setAssignedTo,
  contacts,
  category,
  setCategory,
  categories,
  dueDate,
  setDueDate,
  subtaskInput,
  setSubtaskInput,
  subtask,
  error,
  handleSubtaskStatusChange,
  handleSubtaskDescriptionChange,
  handleCreateTask,
  handleAddSubtask,
  handleRemoveSubtask,
  handleClearFields,
  handleCreateCategory,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabel="Create Task Modal">
      <form
        onSubmit={handleCreateTask}
        className="bg-white p-8 rounded-lg "
        aria-labelledby="create-task-heading"
      >
        <h2
          id="create-task-heading"
          className="text-3xl md:text-4xl mb-6 text-center font-bold flex items-center justify-center"
        >
          <FaPlusCircle
            className="mr-3 text-blue-700 text-4xl"
            aria-hidden="true"
          />
          Create New Task
        </h2>
        {error && (
          <div
            className="mb-6 text-red-500 text-md"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div>
            <div className="mb-6">
              <label
                htmlFor="title"
                className="block text-gray-700 text-lg font-medium mb-2"
              >
                Title
              </label>
              <div className="relative">
                <FaTasks
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                />
                <input
                  id="title"
                  type="text"
                  required
                  className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task Title"
                  aria-required="true"
                />
              </div>
            </div>

            <div className="mb-6">
              <label
                htmlFor="description"
                className="block text-gray-700 text-lg font-medium mb-2"
              >
                Description
              </label>
              <div className="relative">
                <FaListAlt
                  className="absolute left-3 top-3 text-gray-400"
                  aria-hidden="true"
                />
                <textarea
                  id="description"
                  required
                  className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Task Description"
                  rows={4}
                  aria-required="true"
                ></textarea>
              </div>
            </div>

            <div className="mb-6">
              <label
                htmlFor="assignedTo"
                className="block text-gray-700 text-lg font-medium mb-2"
              >
                Assigned To
              </label>
              <div className="relative">
                <FaUser
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                />
                <div className="pl-12">
                  <Select
                    id="assignedTo"
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
                    aria-label="Select Contacts to Assign"
                  />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label
                htmlFor="category"
                className="block text-gray-700 text-lg font-medium mb-2"
              >
                Category
              </label>
              <div className="relative">
                <FaTag
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                />
                <div className="pl-12">
                  <CreatableSelect
                    id="category"
                    isClearable
                    options={categories.map((cat) => ({
                      value: cat,
                      label: cat,
                    }))}
                    value={
                      category ? { value: category, label: category } : null
                    }
                    onChange={(newValue) => {
                      if (newValue) {
                        setCategory(newValue.value);
                      } else {
                        setCategory('');
                      }
                    }}
                    onCreateOption={handleCreateCategory}
                    placeholder="Enter or select a category"
                    aria-label="Select or Create Category"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            <div className="mb-6">
              <label
                htmlFor="dueDate"
                className="block text-gray-700 text-lg font-medium mb-2"
              >
                Due Date
              </label>
              <div className="relative">
                <FaCalendarAlt
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                />
                <input
                  id="dueDate"
                  type="date"
                  required
                  className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  aria-required="true"
                />
              </div>
            </div>

            <div className="mb-6">
              <label
                htmlFor="subtaskInput"
                className="block text-gray-700 text-lg font-medium mb-2"
              >
                Subtasks
              </label>
              <div className="flex">
                <div className="relative w-full">
                  <FaTasks
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    aria-hidden="true"
                  />
                  <input
                    id="subtaskInput"
                    type="text"
                    className="w-full pl-10 pr-4 py-3 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={subtaskInput}
                    onChange={(e) => setSubtaskInput(e.target.value)}
                    placeholder="Enter a subtask"
                    aria-label="Subtask Description"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  className="bg-gray-700 text-white px-4 py-3 rounded-r-lg hover:bg-blue-700 transition-colors duration-200"
                  aria-label="Add Subtask"
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
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={subtaskItem.status === 'done'}
                          onChange={() => handleSubtaskStatusChange(index)}
                          aria-label={`Mark subtask ${index + 1} as ${
                            subtaskItem.status === 'done' ? 'not done' : 'done'
                          }`}
                        />
                        <input
                          type="text"
                          className={`flex-1 bg-transparent border-none focus:outline-none ${
                            subtaskItem.status === 'done'
                              ? 'line-through text-gray-500'
                              : ''
                          }`}
                          value={subtaskItem.description}
                          onChange={(e) =>
                            handleSubtaskDescriptionChange(
                              index,
                              e.target.value
                            )
                          }
                          aria-label={`Subtask ${index + 1} Description`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubtask(index)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-200"
                        aria-label={`Remove subtask ${index + 1}`}
                      >
                        <FaTrashAlt aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mb-6">
              <label
                htmlFor="priority"
                className="block text-gray-700 text-lg font-medium mb-2"
              >
                Priority
              </label>
              <div className="relative">
                <FaExclamationCircle
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                />
                <select
                  id="priority"
                  className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as 'Low' | 'Normal' | 'Urgent')
                  }
                  aria-label="Select Task Priority"
                  aria-required="true"
                >
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={handleClearFields} // Only clears the fields
            className="w-full lg:w-1/2 py-3 rounded-lg hover:text-blue-800 hover:bg-blue-100 transition-colors duration-200 text-lg font-semibold mr-2 flex items-center justify-center shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]"
            aria-label="Clear All Fields"
          >
            <FaEraser className="mr-2" aria-hidden="true" />
            Clear
          </button>
          <button
            type="submit"
            className="w-full lg:w-1/2 shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px] py-3 rounded-lg bg-gray-500 hover:bg-green-700 text-white transition-colors duration-200 text-lg font-semibold ml-2 flex items-center justify-center"
            aria-label="Create Task"
          >
            <FaPlusCircle className="mr-2" aria-hidden="true" />
            Create Task
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTaskUI;

// src/components/TaskBoard.tsx

import React, { useState, useEffect, useContext } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  // Timestamp,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { AuthContext } from '../contexts/AuthContext';
import { Task, Contact, Subtask } from '../types';
import EditTaskModal from './EditTaskModal';
import {
  FaEdit,
  FaTrashAlt,
  FaExclamationCircle,
} from 'react-icons/fa';

const TaskBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const { currentUser } = useContext(AuthContext);

  // State for the edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    let unsubscribeTasks: () => void;
    let unsubscribeContacts: () => void;
    let unsubscribeCategories: () => void;

    if (currentUser) {
      // Fetch tasks with onSnapshot
      const tasksRef = collection(db, 'tasks');
      const tasksQuery = query(tasksRef, where('userId', '==', currentUser.uid));

      unsubscribeTasks = onSnapshot(tasksQuery, (querySnapshot) => {
        const tasksData = querySnapshot.docs.map((doc) => {
          const data = doc.data();

          // Ensure assignedTo is always an array
          const assignedToArray: string[] = Array.isArray(data.assignedTo)
            ? data.assignedTo
            : [data.assignedTo];

          // Ensure subtask is always an array of Subtask
          const subtaskArray: Subtask[] = Array.isArray(data.subtask)
            ? (data.subtask as Subtask[])
            : [];

          const taskData: Task = {
            id: doc.id,
            title: data.title,
            description: data.description,
            priority: data.priority,
            createdAt: data.createdAt,
            userId: data.userId,
            assignedTo: assignedToArray,
            category: data.category,
            dueDate: data.dueDate,
            subtask: subtaskArray,
            status: data.status,
          };

          return taskData;
        });
        setTasks(tasksData);
      });

      // Fetch contacts with onSnapshot
      const contactsRef = collection(db, 'contacts');
      const contactsQuery = query(
        contactsRef,
        where('userId', '==', currentUser.uid)
      );

      unsubscribeContacts = onSnapshot(contactsQuery, (querySnapshot) => {
        const contactsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Contact),
        }));
        setContacts(contactsData);
      });

      // Fetch categories with onSnapshot
      unsubscribeCategories = onSnapshot(tasksQuery, (querySnapshot) => {
        const categoriesSet = new Set<string>();
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.category) {
            categoriesSet.add(data.category);
          }
        });
        setCategories(Array.from(categoriesSet));
      });
    }

    // Cleanup function to unsubscribe listeners
    return () => {
      if (unsubscribeTasks) unsubscribeTasks();
      if (unsubscribeContacts) unsubscribeContacts();
      if (unsubscribeCategories) unsubscribeCategories();
    };
  }, [currentUser]);

  const getContactNameById = (id: string) => {
    const contact = contacts.find((c) => c.id === id);
    return contact ? contact.name : 'Unknown Contact';
  };

  const getContactInitialsById = (id: string) => {
    const contact = contacts.find((c) => c.id === id);
    if (contact && contact.name) {
      const names = contact.name.split(' ');
      const initials = names.map((n) => n[0]).join('');
      return initials.toUpperCase();
    }
    return '?';
  };

  const getSubtaskCompletion = (task: Task) => {
    const total = task.subtask?.length;
    const completed = task.subtask?.filter((sub) => sub.status === 'done').length;
    return `${completed}/${total}`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'text-red-500';
      case 'Normal':
        return 'text-yellow-500';
      case 'Low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setSelectedTask(null);
    setIsEditModalOpen(false);
  };

  // Function to update the task in Firestore and refresh the task list
  const handleUpdateTask = async (updatedTask: Task) => {
    if (currentUser && updatedTask.id) {
      try {
        const taskRef = doc(db, 'tasks', updatedTask.id);
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
        closeEditModal();
      } catch (err) {
        console.error('Error updating task:', err);
      }
    }
  };

  // Function to delete a task with confirmation
  const handleDeleteTask = async (taskId: string) => {
    if (currentUser && taskId) {
      const confirmDelete = window.confirm(
        'Are you sure you want to delete this task? This action cannot be undone.'
      );
      if (!confirmDelete) return;

      try {
        const taskRef = doc(db, 'tasks', taskId);
        await deleteDoc(taskRef);
      } catch (err) {
        console.error('Error deleting task:', err);
      }
    }
  };

  if (!currentUser) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4 text-center text-blue-700">
          Please log in to view your tasks.
        </h1>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-r from-blue-100 to-purple-100 min-h-screen">
      <h1 className="text-3xl md:text-4xl mb-6 text-center font-bold text-blue-700">
        Task Board
      </h1>
      {tasks.length === 0 ? (
        <p className="text-gray-700 text-center text-lg">
          Your tasks will appear here.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200"
            >
              <h2 className="text-2xl font-semibold mb-4 text-blue-700">
                {task.title}
              </h2>
              <p className="text-gray-700 mb-4">{task.description}</p>
              <div className="flex items-center mb-4">
                {task.assignedTo.map((id) => {
                  const initials = getContactInitialsById(id);
                  return (
                    <div
                      key={id}
                      className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center mr-2"
                      title={getContactNameById(id)}
                    >
                      {initials}
                    </div>
                  );
                })}
              </div>
              <p className="text-gray-600 mb-2">
                <strong>Category:</strong> {task.category}
              </p>
              {task.subtask && task.subtask.length > 0 && (
                <p className="text-gray-600 mb-2">
                  <strong>Subtasks:</strong> {getSubtaskCompletion(task)}
                </p>
              )}
              <div className="flex items-center mb-2">
                <FaExclamationCircle
                  className={`mr-2 ${getPriorityColor(task.priority)}`}
                />
                <span className="text-gray-600">
                  {task.priority} Priority
                </span>
              </div>
              <p className="text-gray-600 mb-2">
                <strong>Status:</strong> {task.status}
              </p>
              {/* Buttons */}
              <div className="flex justify-end mt-4 space-x-4">
                <button
                  onClick={() => openEditModal(task)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <FaEdit size={20} />
                </button>
                <button
                  onClick={() => handleDeleteTask(task.id!)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrashAlt size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Edit Task Modal */}
      {isEditModalOpen && selectedTask && (
        <EditTaskModal
          task={selectedTask}
          contacts={contacts}
          categories={categories}
          onClose={closeEditModal}
          onUpdate={handleUpdateTask}
        />
      )}
    </div>
  );
};

export default TaskBoard;

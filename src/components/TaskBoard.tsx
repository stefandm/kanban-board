// src/components/TaskBoard.tsx
import React, { useState, useEffect, useContext } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { AuthContext } from '../contexts/AuthContext';
import { Task, Contact, Subtask } from '../types';
import EditTaskModal from './EditTaskModal';

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
        // No need to manually update tasks state; onSnapshot will handle it
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
        // No need to manually update tasks state; onSnapshot will handle it
      } catch (err) {
        console.error('Error deleting task:', err);
      }
    }
  };

  // Function to handle subtask status change
  const handleSubtaskStatusChange = async (taskId: string, subtaskIndex: number) => {
    if (!currentUser) return;

    try {
      // Find the task in the tasks state
      const taskToUpdate = tasks.find((task) => task.id === taskId);
      if (!taskToUpdate) return;

      // Clone the subtasks array
      const updatedSubtasks = [...(taskToUpdate.subtask || [])];

      // Toggle the status of the subtask
      const subtask = updatedSubtasks[subtaskIndex];
      if (!subtask) return;

      subtask.status = subtask.status === 'done' ? 'not done' : 'done';

      // Update the task in Firestore
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        subtask: updatedSubtasks,
      });

      // No need to manually update tasks state; onSnapshot will handle it
    } catch (error) {
      console.error('Error updating subtask status:', error);
    }
  };

  if (!currentUser) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Please log in to view your tasks.</h1>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Task Board</h1>
      {tasks.length === 0 ? (
        <p className="text-gray-700">Your tasks will appear here.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white p-4 rounded shadow">
              <h2 className="text-xl font-semibold mb-2">{task.title}</h2>
              <p className="text-gray-700 mb-2">{task.description}</p>
              <p className="text-gray-600 mb-1">
                <strong>Assigned To:</strong>{' '}
                {task.assignedTo.map((id) => getContactNameById(id)).join(', ')}
              </p>
              <p className="text-gray-600 mb-1">
                <strong>Category:</strong> {task.category}
              </p>
              <p className="text-gray-600 mb-1">
                <strong>Due Date:</strong>{' '}
                {task.dueDate instanceof Timestamp
                  ? task.dueDate.toDate().toLocaleDateString()
                  : 'No Due Date'}
              </p>
              <p className="text-gray-600 mb-1">
                <strong>Priority:</strong> {task.priority}
              </p>
              {task.subtask && task.subtask.length > 0 && (
                <div className="mt-2">
                  <strong>Subtasks:</strong>
                  <ul className="list-none list-inside">
                    {task.subtask.map((subtaskItem, subtaskIndex) => (
                      <li key={subtaskIndex}>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="mr-2"
                            checked={subtaskItem.status === 'done'}
                            onChange={() => handleSubtaskStatusChange(task.id!, subtaskIndex)}
                          />
                          <span
                            className={
                              subtaskItem.status === 'done' ? 'line-through text-gray-500' : ''
                            }
                          >
                            {subtaskItem.description}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-gray-600 mt-2">
                <strong>Status:</strong> {task.status}
              </p>
              {/* Buttons */}
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => openEditModal(task)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2 w-full"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteTask(task.id!)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full"
                >
                  Remove
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

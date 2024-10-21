// src/components/TaskBoard.tsx
import React, { useState, useEffect, useContext } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { AuthContext } from '../contexts/AuthContext';
import { Task, Contact } from '../types';
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
    const fetchTasks = async () => {
      if (currentUser) {
        try {
          const tasksRef = collection(db, 'tasks');
          const q = query(tasksRef, where('userId', '==', currentUser.uid));
          const querySnapshot = await getDocs(q);
          const tasksData = querySnapshot.docs.map((doc) => {
            const data = doc.data();

            // Ensure assignedTo is always an array
            const assignedToArray: string[] = Array.isArray(data.assignedTo)
              ? data.assignedTo
              : [data.assignedTo];

            return {
              id: doc.id,
              ...(data as Omit<Task, 'assignedTo'>),
              assignedTo: assignedToArray,
            };
          });
          setTasks(tasksData);
        } catch (err) {
          console.error('Error fetching tasks:', err);
        }
      }
    };

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

    fetchTasks();
    fetchContacts();
    fetchCategories();
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
        // Refresh the task list
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === updatedTask.id ? updatedTask : task
          )
        );
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
        // Remove the task from local state
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      } catch (err) {
        console.error('Error deleting task:', err);
      }
    }
  };

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
                  <ul className="list-disc list-inside">
                    {task.subtask.map((subtask, index) => (
                      <li key={index}>{subtask}</li>
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

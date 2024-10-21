// src/components/TaskBoard.tsx
import React, { useState, useEffect, useContext } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { AuthContext } from '../contexts/AuthContext';
import { Task, Contact } from '../types';
import { Timestamp } from 'firebase/firestore';

const TaskBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const { currentUser } = useContext(AuthContext);

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

    fetchTasks();
    fetchContacts();
  }, [currentUser]);

  const getContactNameById = (id: string) => {
    const contact = contacts.find((c) => c.id === id);
    return contact ? contact.name : 'Unknown Contact';
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskBoard;

// src/components/Summary.tsx
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { AuthContext } from '../contexts/AuthContext';
import { Task } from '../types';
import { FaTasks, FaClipboardList, FaHourglassHalf, FaComments, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const Summary: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statusCounts, setStatusCounts] = useState<{ [key: string]: number }>({});
  const [urgentTasks, setUrgentTasks] = useState<Task[]>([]);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    let unsubscribeTasks: () => void;

    if (currentUser) {
      const tasksRef = collection(db, 'tasks');
      const q = query(tasksRef, where('userId', '==', currentUser.uid));

      unsubscribeTasks = onSnapshot(q, (querySnapshot) => {
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
          } as Task;
        });
        setTasks(tasksData);

        // Calculate status counts
        const counts: { [key: string]: number } = {};
        tasksData.forEach((task) => {
          const status = task.status;
          counts[status] = (counts[status] || 0) + 1;
        });
        setStatusCounts(counts);

        // Identify urgent tasks
        const urgent = tasksData.filter((task) => task.priority === 'Urgent');
        setUrgentTasks(urgent);
      });
    }

    return () => {
      if (unsubscribeTasks) unsubscribeTasks();
    };
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Please log in to view the summary.</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
    <h1 className="text-4xl md:text-5xl font-bold mb-10 text-blue-700">Task Summary</h1>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      {/* Tasks in Board */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl md:text-4xl font-semibold mb-8 text-green-700 flex items-center">
          <FaTasks className="mr-4 text-green-600 text-4xl md:text-5xl" /> Tasks in Board
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
          <Link
            to="/dashboard"
            className="bg-blue-200 rounded-lg p-8 flex flex-col items-center hover:bg-blue-300 transition-colors duration-200"
          >
            <FaClipboardList className="text-blue-600 text-5xl mb-4" />
            <p className="text-gray-800 text-xl font-medium">Total Tasks</p>
            <p className="text-3xl md:text-4xl font-bold text-blue-800">{tasks.length}</p>
          </Link>
          <Link
            to="/dashboard"
            className="bg-yellow-200 rounded-lg p-8 flex flex-col items-center hover:bg-yellow-300 transition-colors duration-200"
          >
            <FaHourglassHalf className="text-yellow-600 text-5xl mb-4" />
            <p className="text-gray-800 text-xl font-medium">To Do</p>
            <p className="text-3xl md:text-4xl font-bold text-yellow-800">{statusCounts['To do'] || 0}</p>
          </Link>
          <Link
            to="/dashboard"
            className="bg-purple-200 rounded-lg p-8 flex flex-col items-center hover:bg-purple-300 transition-colors duration-200"
          >
            <FaHourglassHalf className="text-purple-600 text-5xl mb-4" />
            <p className="text-gray-800 text-xl font-medium">In Progress</p>
            <p className="text-3xl md:text-4xl font-bold text-purple-800">{statusCounts['In progress'] || 0}</p>
          </Link>
          <Link
            to="/dashboard"
            className="bg-orange-200 rounded-lg p-8 flex flex-col items-center hover:bg-orange-300 transition-colors duration-200"
          >
            <FaComments className="text-orange-600 text-5xl mb-4" />
            <p className="text-gray-800 text-xl font-medium">Awaiting Feedback</p>
            <p className="text-3xl md:text-4xl font-bold text-orange-800">
              {statusCounts['Awaiting feedback'] || 0}
            </p>
          </Link>
          <Link
            to="/dashboard"
            className="bg-green-200 rounded-lg p-8 flex flex-col items-center hover:bg-green-300 transition-colors duration-200"
          >
            <FaCheckCircle className="text-green-600 text-5xl mb-4" />
            <p className="text-gray-800 text-xl font-medium">Completed</p>
            <p className="text-3xl md:text-4xl font-bold text-green-800">{statusCounts['Completed'] || 0}</p>
          </Link>
        </div>
      </div>

      {/* Urgent Tasks */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl md:text-4xl font-semibold mb-8 text-red-700 flex items-center">
          <FaExclamationTriangle className="mr-4 text-red-600 text-4xl md:text-5xl" /> Urgent Tasks
        </h2>
        {urgentTasks.length === 0 ? (
          <p className="text-gray-800 text-xl">No urgent tasks.</p>
        ) : (
          <ul>
            {urgentTasks.map((task) => (
              <li key={task.id} className="mb-6">
                <Link
                  to="/dashboard"
                  className="block bg-red-100 border-l-4 border-red-600 p-6 hover:bg-red-200 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-red-800 text-xl">{task.title}</p>
                    <span className="text-lg text-red-700">
                      Due by{' '}
                      {task.dueDate instanceof Timestamp
                        ? task.dueDate.toDate().toLocaleDateString()
                        : 'No Due Date'}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  </div>

  );
};

export default Summary;

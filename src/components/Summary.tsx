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
import { FaHourglassHalf, FaComments, FaCheckCircle, FaExclamationTriangle, FaEdit } from 'react-icons/fa';

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

  const linkClass = " rounded-2xl p-8 flex flex-col items-center justify-center hover:bg-gray-700 hover:text-white transition-colors duration-200 shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]"
  const linkTitleClass = " text-3xl text-center font-medium"
  const linkItemsClass = "text-3xl md:text-5xl font-bold "

  return (
    <div className="container mx-auto py-6 w-full ">
    <h1 className="text-4xl md:text-5xl font-bold mt-6 mb-10 text-center">Summary</h1>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      {/* Tasks in Board */}
      <div className="bg-white rounded-lg  p-8">
        <div className="transition  duration-200 text-center grid grid-cols-2 sm:grid-cols-3 gap-8">
          <Link
            to="/dashboard"
            className={linkClass}
          >
            <p className={linkTitleClass}>Total Tasks</p>
            <p className={linkItemsClass}>{tasks.length}</p>
          </Link>
          <Link
            to="/dashboard"
            className={linkClass}
          >
            <FaEdit size={50} className="text-5xl mb-4  text-blue-600" />
            <p className=" text-xl font-medium">To Do</p>
            <p className={linkItemsClass}>{statusCounts['To do'] || 0}</p>
          </Link>
          <Link
            to="/dashboard"
            className={linkClass}
          >
            <FaHourglassHalf className="text-5xl mb-4 text-zinc-400" />
            <p className=" text-xl font-medium">In Progress</p>
            <p className={linkItemsClass}>{statusCounts['In progress'] || 0}</p>
          </Link>
          <Link
            to="/dashboard"
            className={linkClass}
          >
            <FaComments className=" text-orange-600 text-5xl mb-4" />
            <p className="text-xl font-medium">Awaiting Feedback</p>
            <p className={linkItemsClass}>
              {statusCounts['Awaiting feedback'] || 0}
            </p>
          </Link>
          <Link
            to="/dashboard"
            className={linkClass}
          >
            <FaCheckCircle className="text-green-600 text-5xl mb-4" />
            <p className="text-xl font-medium">Completed</p>
            <p className={linkItemsClass}>{statusCounts['Completed'] || 0}</p>
          </Link>
        </div>
      </div>

      {/* Urgent Tasks */}
      <div className="bg-white rounded-lg  p-8 ">
        <h2 className="text-3xl md:text-4xl font-semibold mb-8 text-red-700 flex items-center">
          <FaExclamationTriangle className="mr-4  text-4xl md:text-5xl" /> Urgent Tasks
        </h2>
        {urgentTasks.length === 0 ? (
          <p className="text-gray-800 text-xl">No urgent tasks.</p>
        ) : (
          <ul>
            {urgentTasks.map((task) => (
              <li key={task.id} className="mb-6">
                <Link
                  to="/dashboard"
                  className="block  border-l-4 border-red-600  rounded-xl p-6 hover:bg-red-400 hover:text-white transition-colors duration-200  shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold  text-xl">{task.title}</p>
                    <span className="text-lg ">
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

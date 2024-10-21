// src/components/Summary.tsx
import React, { useState, useEffect, useContext } from 'react';
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { AuthContext } from '../contexts/AuthContext';
import { Task } from '../types';

const Summary: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statusCounts, setStatusCounts] = useState<{ [key: string]: number }>({});
  const [urgentTasks, setUrgentTasks] = useState<Task[]>([]);
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
        } catch (err) {
          console.error('Error fetching tasks:', err);
        }
      }
    };

    fetchTasks();
  }, [currentUser]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Task Summary</h1>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Tasks in Board</h2>
        <ul className="list-disc list-inside">
          <li>
            <strong>Total Tasks:</strong> {tasks.length}
          </li>
          <li>
            <strong>To do:</strong> {statusCounts['To do'] || 0}
          </li>
          <li>
            <strong>In progress:</strong> {statusCounts['In progress'] || 0}
          </li>
          <li>
            <strong>Awaiting feedback:</strong> {statusCounts['Awaiting feedback'] || 0}
          </li>
          <li>
            <strong>Completed:</strong> {statusCounts['Completed'] || 0}
          </li>
        </ul>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Urgent Tasks</h2>
        {urgentTasks.length === 0 ? (
          <p>No urgent tasks.</p>
        ) : (
          <ul className="list-disc list-inside">
            {urgentTasks.map((task) => (
              <li key={task.id}>
                <strong>{task.title}</strong> - Deadline by{' '}
                {task.dueDate instanceof Timestamp
                  ? task.dueDate.toDate().toLocaleDateString()
                  : 'No Due Date'}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Summary;

import React, { useState, useEffect, useContext } from 'react';
import { db } from '../../firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { AuthContext } from '../../contexts/AuthContext';
import { Task } from '../../types';

interface StatusCounts {
  [key: string]: number;
}

interface SummaryLogicProps {
  children: (data: {
    tasks: Task[];
    statusCounts: StatusCounts;
    urgentTasks: Task[];
    loading: boolean;
    isAuthenticated: boolean;
  }) => JSX.Element;
}

const SummaryLogic: React.FC<SummaryLogicProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({});
  const [urgentTasks, setUrgentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { currentUser, loading: authLoading } = useContext(AuthContext);

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
            ...(data as Omit<Task, 'assignedTo' | 'id'>), // Omit 'id' to prevent duplication
            assignedTo: assignedToArray,
          } as Task;
        });
        setTasks(tasksData);

        const counts: StatusCounts = {};
        tasksData.forEach((task) => {
          const status = task.status;
          counts[status] = (counts[status] || 0) + 1;
        });
        setStatusCounts(counts);

        const urgent = tasksData.filter((task) => task.priority === 'Urgent');
        setUrgentTasks(urgent);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }

    return () => {
      if (unsubscribeTasks) unsubscribeTasks();
    };
  }, [currentUser]);

  // Determine authentication status
  const isAuthenticated = !!currentUser;

  return children({ tasks, statusCounts, urgentTasks, loading: loading || authLoading, isAuthenticated });
};

export default SummaryLogic;

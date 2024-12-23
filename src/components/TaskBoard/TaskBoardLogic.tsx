import React, { useEffect, useContext, useState, ReactNode } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { AuthContext } from '../../contexts/AuthContext';
import { Task, Contact, Subtask } from '../../types';
import EditTaskModal from '../EditTaskModal';
import Modal from '../Modal';
import {
  MdKeyboardDoubleArrowDown,
  MdKeyboardDoubleArrowRight,
  MdKeyboardDoubleArrowUp,
} from 'react-icons/md';
import { DropResult } from '@hello-pangea/dnd';

export interface TaskBoardLogicProps {
  tasks: Task[];
  tasksByStatus: { [key: string]: Task[] };
  columnsOrder: string[];
  getContactNameById: (id: string) => string;
  getContactInitialsById: (id: string) => string;
  getSubtaskCompletion: (task: Task) => string;
  getPriorityColor: (priority: string) => string;
  getPriorityIcon: (priority: string) => JSX.Element;
  openEditModal: (task: Task) => void;
  handleDeleteTask: (taskId: string) => void;
  onDragEnd: (result: DropResult) => void;
}

interface TaskBoardLogicComponentProps {
  children: (props: TaskBoardLogicProps) => ReactNode;
}

const columnsOrder = ['To do', 'In progress', 'Awaiting Feedback', 'Completed'];

const TaskBoardLogic: React.FC<TaskBoardLogicComponentProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const { currentUser } = useContext(AuthContext);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    task?: Task;
  }>({ isOpen: false });

  useEffect(() => {
    let unsubscribeTasks: () => void;
    let unsubscribeContacts: () => void;
    let unsubscribeCategories: () => void;

    if (currentUser) {
      const tasksRef = collection(db, 'tasks');
      const tasksQueryFirebase = query(
        tasksRef,
        where('userId', '==', currentUser.uid),
        orderBy('status'),
        orderBy('order')
      );

      unsubscribeTasks = onSnapshot(tasksQueryFirebase, (querySnapshot) => {
        const tasksData: Task[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();

          const assignedToArray: string[] = Array.isArray(data.assignedTo)
            ? data.assignedTo
            : [data.assignedTo];

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
            status: data.status || 'To do',
            order: typeof data.order === 'number' ? data.order : 0, // Ensure order is set
          };

          return taskData;
        });
        setTasks(tasksData);
      });

      const contactsRef = collection(db, 'contacts');
      const contactsQueryFirebase = query(
        contactsRef,
        where('userId', '==', currentUser.uid)
      );

      unsubscribeContacts = onSnapshot(contactsQueryFirebase, (querySnapshot) => {
        const contactsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Contact),
        }));
        setContacts(contactsData);
      });

      unsubscribeCategories = onSnapshot(tasksQueryFirebase, (querySnapshot) => {
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
    const total = task.subtask?.length || 0;
    const completed = task.subtask?.filter((sub) => sub.status === 'done').length || 0;
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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return <MdKeyboardDoubleArrowUp aria-label="Urgent Priority" />;
      case 'Normal':
        return <MdKeyboardDoubleArrowRight aria-label="Normal Priority" />;
      case 'Low':
        return <MdKeyboardDoubleArrowDown aria-label="Low Priority" />;
      default:
        return <MdKeyboardDoubleArrowRight aria-label="Normal Priority" />;
    }
  };

  const openEditModal = (task: Task) => {
    setModalState({ isOpen: true, task });
  };

  const closeEditModal = () => {
    setModalState({ isOpen: false, task: undefined });
  };

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
          order: updatedTask.order,
        });
        closeEditModal();
      } catch (err) {
        console.error('Error updating task:', err);
      }
    }
  };

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

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const task = tasks.find((t) => t.id === draggableId);
    if (!task) return;

    const newStatus = destination.droppableId;
    const startColumn = source.droppableId;
    const endColumn = destination.droppableId;

    let newTasks: Task[] = [...tasks];

    if (startColumn === endColumn) {
      const columnTasks = newTasks.filter((t) => t.status === startColumn);
      const otherTasks = newTasks.filter((t) => t.status !== startColumn);
      const [movedTask] = columnTasks.splice(source.index, 1);
      columnTasks.splice(destination.index, 0, movedTask);

      const updatedColumnTasks = columnTasks.map((t, index) => ({
        ...t,
        order: index,
      }));

      newTasks = [...otherTasks, ...updatedColumnTasks];
    } else {
      const startTasks = newTasks.filter((t) => t.status === startColumn);
      const endTasks = newTasks.filter((t) => t.status === endColumn);
      const otherTasks = newTasks.filter(
        (t) => t.status !== startColumn && t.status !== endColumn
      );

      const [movedTask] = startTasks.splice(source.index, 1);
      movedTask.status = newStatus;
      endTasks.splice(destination.index, 0, movedTask);

      const updatedStartTasks = startTasks.map((t, index) => ({
        ...t,
        order: index,
      }));
      const updatedEndTasks = endTasks.map((t, index) => ({
        ...t,
        order: index,
      }));

      newTasks = [...otherTasks, ...updatedStartTasks, ...updatedEndTasks];
    }

    setTasks(newTasks);

    const batch = writeBatch(db);

    if (startColumn === endColumn) {
      const updatedTasks = newTasks.filter((t) => t.status === startColumn);
      updatedTasks.forEach((t, index) => {
        const taskRef = doc(db, 'tasks', t.id);
        batch.update(taskRef, { order: index });
      });
    } else {
      const updatedStartTasks = newTasks.filter(
        (t) => t.status === startColumn
      );
      const updatedEndTasks = newTasks.filter((t) => t.status === endColumn);

      updatedStartTasks.forEach((t, index) => {
        const taskRef = doc(db, 'tasks', t.id);
        batch.update(taskRef, { order: index });
      });

      updatedEndTasks.forEach((t, index) => {
        const taskRef = doc(db, 'tasks', t.id);
        batch.update(taskRef, { order: index, status: endColumn });
      });
    }

    try {
      await batch.commit();
    } catch (err) {
      console.error('Error moving task:', err);
      setTasks(tasks); // Revert to the original tasks
      alert('Failed to update task order. Please try again.');
    }
  };

  const tasksByStatus: { [key: string]: Task[] } = {
    'To do': [],
    'In progress': [],
    'Awaiting Feedback': [],
    'Completed': [],
  };

  tasks.forEach((task) => {
    const status = task.status || 'To do';
    if (tasksByStatus[status]) {
      tasksByStatus[status].push(task);
    } else {
      tasksByStatus['To do'].push(task);
    }
  });

  Object.keys(tasksByStatus).forEach((status) => {
    tasksByStatus[status].sort((a, b) => a.order - b.order);
  });

  const logicProps: TaskBoardLogicProps = {
    tasks,
    tasksByStatus,
    columnsOrder,
    getContactNameById,
    getContactInitialsById,
    getSubtaskCompletion,
    getPriorityColor,
    getPriorityIcon,
    openEditModal,
    handleDeleteTask,
    onDragEnd,
  };

  return (
    <>
      {children(logicProps)}
      <Modal isOpen={modalState.isOpen} onClose={closeEditModal} ariaLabel="Edit Task Modal">
        {modalState.task && (
          <EditTaskModal
            task={modalState.task}
            contacts={contacts}
            categories={categories}
            onClose={closeEditModal}
            onUpdate={handleUpdateTask}
          />
        )}
      </Modal>
    </>
  );
};

export default TaskBoardLogic;

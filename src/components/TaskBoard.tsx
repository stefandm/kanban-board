import React, { useState, useEffect, useContext } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
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
} from 'react-icons/fa';
import {
  MdKeyboardDoubleArrowDown,
  MdKeyboardDoubleArrowRight,
  MdKeyboardDoubleArrowUp,
} from 'react-icons/md';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';

const columnsOrder = ['To do', 'In progress', 'Awaiting Feedback', 'Completed'];

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
      const tasksRef = collection(db, 'tasks');
      const tasksQuery = query(tasksRef, where('userId', '==', currentUser.uid));

      unsubscribeTasks = onSnapshot(tasksQuery, (querySnapshot) => {
        const tasksData = querySnapshot.docs.map((doc) => {
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
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setSelectedTask(null);
    setIsEditModalOpen(false);
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

    if (newStatus !== task.status) {
      try {
        const taskRef = doc(db, 'tasks', task.id); 
        await updateDoc(taskRef, {
          status: newStatus,
        });
      } catch (err) {
        console.error('Error updating task status:', err);
      }
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

  if (!currentUser) {
    return (
      <div className="p-6" role="main" aria-labelledby="login-prompt">
        <h1 id="login-prompt" className="text-3xl font-bold mb-4 text-center text-blue-700">
          Please log in to view your tasks.
        </h1>
      </div>
    );
  }

  return (
    <main
      className="p-6 min-h-screen"
      role="main"
      aria-labelledby="task-board-heading"
    >
      <h1
        id="task-board-heading"
        className="text-3xl md:text-4xl mb-6 text-center font-bold"
      >
        Task Board
      </h1>
      {tasks.length === 0 ? (
        <p className="text-gray-700 text-center text-lg" role="status">
          Your tasks will appear here.
        </p>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <section
            className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0"
            aria-label="Task Columns"
          >
            {columnsOrder.map((columnId) => (
              <Droppable droppableId={columnId} key={columnId}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 bg-gray-100 p-4 rounded-md shadow-md ${
                      snapshot.isDraggingOver ? 'bg-blue-50' : ''
                    }`}
                    aria-labelledby={`column-${columnId}-heading`}
                  >
                    <h2
                      id={`column-${columnId}-heading`}
                      className="text-xl font-semibold mb-4 text-center"
                    >
                      {columnId}
                    </h2>
                    <ul role="list">
                      {tasksByStatus[columnId].map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <li
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`flex flex-col justify-between bg-white p-4 rounded-lg shadow mb-4 ${
                                snapshot.isDragging ? 'bg-blue-100' : 'bg-white'
                              } transition-colors duration-200`}
                              aria-labelledby={`task-title-${task.id}`}
                              aria-describedby={`task-description-${task.id}`}
                            >
                              <div>
                                <h3
                                  id={`task-title-${task.id}`}
                                  className="text-lg font-semibold mb-2"
                                >
                                  {task.title}
                                </h3>
                                <p
                                  id={`task-description-${task.id}`}
                                  className="text-gray-700 mb-2"
                                >
                                  {task.description.length > 50
                                    ? task.description.slice(0, 47) + '...'
                                    : task.description}
                                </p>
                                <div className="flex items-center mb-2">
                                  {task.assignedTo.map((id) => (
                                    <div
                                      key={id}
                                      className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-2 text-xs"
                                      title={getContactNameById(id)}
                                      aria-label={`Assigned to ${getContactNameById(id)}`}
                                    >
                                      {getContactInitialsById(id)}
                                    </div>
                                  ))}
                                </div>
                                {task.subtask && task.subtask.length > 0 && (
                                  <p className="text-gray-600 mb-2">
                                    <strong>Subtasks:</strong>{' '}
                                    {getSubtaskCompletion(task)}
                                  </p>
                                )}
                              </div>
                              {/* Priority and Buttons Section */}
                              <div className="flex justify-between items-center mt-4">
                                <div className="flex items-center">
                                  <span
                                    className={`${getPriorityColor(task.priority)} mr-2`}
                                    style={{ fontSize: '1.5rem' }}
                                  >
                                    {getPriorityIcon(task.priority)}
                                  </span>
                                  <span className="text-black font-medium">
                                    {task.priority}
                                  </span>
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => openEditModal(task)}
                                    className="text-blue-500 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                                    aria-label={`Edit task ${task.title}`}
                                  >
                                    <FaEdit size={20} aria-hidden="true" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="text-red-700 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                                    aria-label={`Delete task ${task.title}`}
                                  >
                                    <FaTrashAlt size={20} aria-hidden="true" />
                                  </button>
                                </div>
                              </div>
                            </li>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </ul>
                  </div>
                )}
              </Droppable>
            ))}
          </section>
        </DragDropContext>
      )}
      {isEditModalOpen && selectedTask && (
        <EditTaskModal
          task={selectedTask}
          contacts={contacts}
          categories={categories}
          onClose={closeEditModal}
          onUpdate={handleUpdateTask}
        />
      )}
    </main>
  );
};

export default TaskBoard;

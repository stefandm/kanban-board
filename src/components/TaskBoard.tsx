// src/components/TaskBoard.tsx

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
            id: doc.id, // doc.id is always a string
            title: data.title,
            description: data.description,
            priority: data.priority,
            createdAt: data.createdAt,
            userId: data.userId,
            assignedTo: assignedToArray,
            category: data.category,
            dueDate: data.dueDate,
            subtask: subtaskArray,
            status: data.status || 'To do', // Default to 'To do' if not set
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
        const taskRef = doc(db, 'tasks', updatedTask.id); // task.id is now guaranteed to be a string
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

  // Handler for drag end event
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If no destination, do nothing
    if (!destination) return;

    // If the location hasn't changed, do nothing
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Find the task being dragged
    const task = tasks.find((t) => t.id === draggableId);
    if (!task) return;

    // Determine the new status based on the destination droppableId
    const newStatus = destination.droppableId;

    // Update the task's status in Firestore
    if (newStatus !== task.status) {
      try {
        const taskRef = doc(db, 'tasks', task.id); // task.id is guaranteed to be a string
        await updateDoc(taskRef, {
          status: newStatus,
        });
      } catch (err) {
        console.error('Error updating task status:', err);
      }
    }
  };

  // Organize tasks by status
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
      // If the status is unexpected, add it to 'To do' by default
      tasksByStatus['To do'].push(task);
    }
  });

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
    <div className="p-6 min-h-screen">
      <h1 className="text-3xl md:text-4xl mb-6 text-center font-bold text-blue-700">
        Task Board
      </h1>
      {tasks.length === 0 ? (
        <p className="text-gray-700 text-center text-lg">
          Your tasks will appear here.
        </p>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
            {columnsOrder.map((columnId) => (
              <Droppable droppableId={columnId} key={columnId}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 bg-gray-100 p-4 rounded-md shadow-md ${
                      snapshot.isDraggingOver ? 'bg-blue-50' : ''
                    }`}
                  >
                    <h2 className="text-xl font-semibold mb-4 text-center">
                      {columnId}
                    </h2>
                    {tasksByStatus[columnId].length === 0 ? (
                      null
                    ) : (
                      tasksByStatus[columnId].map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id} // task.id is guaranteed to be a string
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white p-4 rounded-lg shadow mb-4 ${
                                snapshot.isDragging
                                  ? 'bg-blue-100'
                                  : 'bg-white'
                              } transition-colors duration-200`}
                            >
                              <div
                                className={`text-2xl font-medium mb-2 ${getPriorityColor(
                                  task.priority
                                )}`}
                              >
                                {task.priority}
                              </div>
                              <h3 className="text-lg font-semibold mb-2">
                                {task.title}
                              </h3>
                              <p className="text-gray-700 mb-2">
                                {task.description.length > 50
                                  ? task.description.slice(0, 47) + '...'
                                  : task.description}
                              </p>
                              <div className="flex items-center mb-2">
                                {task.assignedTo.map((id) => {
                                  const initials = getContactInitialsById(id);
                                  return (
                                    <div
                                      key={id}
                                      className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-2 text-xs"
                                      title={getContactNameById(id)}
                                    >
                                      {initials}
                                    </div>
                                  );
                                })}
                              </div>
                              {task.subtask && task.subtask.length > 0 && (
                                <p className="text-gray-600 mb-2">
                                  <strong>Subtasks:</strong> {getSubtaskCompletion(task)}
                                </p>
                              )}
                              {/* Buttons */}
                              <div className="flex justify-end space-x-2 mt-2">
                                <button
                                  onClick={() => openEditModal(task)}
                                  className="text-blue-700 hover:text-blue-800"
                                >
                                  <FaEdit size={25} />
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="text-red-700 hover:text-red-800"
                                >
                                  <FaTrashAlt size={25} />
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
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

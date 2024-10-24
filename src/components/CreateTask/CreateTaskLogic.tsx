// src/components/CreateTask/CreateTaskLogic.tsx
import React, { useState, useEffect, useContext } from 'react';
import { db } from '../../firebase';
import {
  collection,
  addDoc,
  Timestamp,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { Contact, Subtask, Task } from '../../types';
import { FirebaseError } from 'firebase/app';

interface CreateTaskLogicProps {
  children: (props: CreateTaskLogicData) => JSX.Element;
  onClose: () => void;
  isOpen: boolean;
}

const CreateTaskLogic: React.FC<CreateTaskLogicProps> = ({ children, onClose, isOpen }) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<'Low' | 'Normal' | 'Urgent'>('Normal');
  const [assignedTo, setAssignedTo] = useState<Contact[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [category, setCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<string>('');
  const [subtaskInput, setSubtaskInput] = useState<string>('');
  const [subtask, setSubtask] = useState<Subtask[]>([]);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
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

    fetchContacts();
    fetchCategories();
  }, [currentUser]);

  useEffect(() => {
    if (isOpen) {
      handleClearFields();
    }
  }, [isOpen]);

  const handleSubtaskStatusChange = (index: number) => {
    const updatedSubtasks = [...subtask];
    updatedSubtasks[index].status = updatedSubtasks[index].status === 'done' ? 'not done' : 'done';
    setSubtask(updatedSubtasks);
  };

  const handleSubtaskDescriptionChange = (index: number, newDescription: string) => {
    const updatedSubtasks = [...subtask];
    updatedSubtasks[index].description = newDescription;
    setSubtask(updatedSubtasks);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentUser) {
      setError('You must be logged in to create a task.');
      return;
    }

    if (
      title.trim() === '' ||
      description.trim() === '' ||
      assignedTo.length === 0 ||
      category.trim() === '' ||
      dueDate.trim() === ''
    ) {
      setError(
        'Title, Description, Assigned To, Category, and Due Date are required.'
      );
      return;
    }

    try {
      const tasksRef = collection(db, 'tasks');
      const tasksQuery = query(
        tasksRef,
        where('userId', '==', currentUser.uid),
        where('status', '==', 'To do'),
        orderBy('order', 'desc'),
        limit(1)
      );

      const querySnapshot = await getDocs(tasksQuery);
      let newOrder = 0;
      if (!querySnapshot.empty) {
        const lastTaskData = querySnapshot.docs[0].data();
        const lastTask: Task = {
          id: querySnapshot.docs[0].id,
          title: lastTaskData.title,
          description: lastTaskData.description,
          priority: lastTaskData.priority,
          createdAt: lastTaskData.createdAt,
          userId: lastTaskData.userId,
          assignedTo: lastTaskData.assignedTo,
          category: lastTaskData.category,
          dueDate: lastTaskData.dueDate,
          subtask: lastTaskData.subtask,
          status: lastTaskData.status || 'To do',
          order: typeof lastTaskData.order === 'number' ? lastTaskData.order : 0,
        };
        newOrder = lastTask.order + 1;
      }

      await addDoc(collection(db, 'tasks'), {
        title,
        description,
        priority,
        assignedTo: assignedTo.map((contact) => contact.id),
        category,
        dueDate: Timestamp.fromDate(new Date(dueDate)),
        createdAt: Timestamp.fromDate(new Date()),
        userId: currentUser.uid,
        subtask,
        status: 'To do',
        order: newOrder,
      });

      handleClearFields();
      onClose();
      navigate('/dashboard');
    } catch (err: unknown) {
      console.error('Error adding task:', err);

      if (err instanceof FirebaseError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create task. Please try again.');
      }
    }
  };

  const handleAddSubtask = () => {
    if (subtaskInput.trim() !== '') {
      const newSubtask: Subtask = {
        description: subtaskInput.trim(),
        status: 'not done',
      };
      setSubtask([...subtask, newSubtask]);
      setSubtaskInput('');
    }
  };

  const handleRemoveSubtask = (index: number) => {
    const newSubtasks = subtask.filter((_, idx) => idx !== index);
    setSubtask(newSubtasks);
  };

  const handleClearFields = () => {
    setTitle('');
    setDescription('');
    setPriority('Normal');
    setAssignedTo([]);
    setCategory('');
    setDueDate('');
    setSubtask([]);
    setSubtaskInput('');
    setError('');
  };

  const handleCreateCategory = (inputValue: string) => {
    const newCategory = inputValue.trim();
    if (newCategory && !categories.includes(newCategory)) {
      setCategories((prev) => [...prev, newCategory]);
    }
    setCategory(newCategory);
  };

  // New function to handle category removal
  const handleRemoveCategory = (categoryToRemove: string) => {
    setCategories((prev) => prev.filter((cat) => cat !== categoryToRemove));
    if (category === categoryToRemove) {
      setCategory('');
    }
  };

  const logicData: CreateTaskLogicData = {
    title,
    setTitle,
    description,
    setDescription,
    priority,
    setPriority,
    assignedTo,
    setAssignedTo,
    contacts,
    category,
    setCategory,
    categories,
    dueDate,
    setDueDate,
    subtaskInput,
    setSubtaskInput,
    subtask,
    setSubtask,
    error,
    setError,
    handleSubtaskStatusChange,
    handleSubtaskDescriptionChange,
    handleCreateTask,
    handleAddSubtask,
    handleRemoveSubtask,
    handleClearFields,
    handleCreateCategory,
    handleRemoveCategory, // Add this to logicData
  };

  return <>{children(logicData)}</>;
};

export default CreateTaskLogic;

// Update the CreateTaskLogicData interface
export interface CreateTaskLogicData {
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  description: string;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  priority: 'Low' | 'Normal' | 'Urgent';
  setPriority: React.Dispatch<React.SetStateAction<'Low' | 'Normal' | 'Urgent'>>;
  assignedTo: Contact[];
  setAssignedTo: React.Dispatch<React.SetStateAction<Contact[]>>;
  contacts: Contact[];
  category: string;
  setCategory: React.Dispatch<React.SetStateAction<string>>;
  categories: string[];
  dueDate: string;
  setDueDate: React.Dispatch<React.SetStateAction<string>>;
  subtaskInput: string;
  setSubtaskInput: React.Dispatch<React.SetStateAction<string>>;
  subtask: Subtask[];
  setSubtask: React.Dispatch<React.SetStateAction<Subtask[]>>;
  error: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
  handleSubtaskStatusChange: (index: number) => void;
  handleSubtaskDescriptionChange: (index: number, newDescription: string) => void;
  handleCreateTask: (e: React.FormEvent) => Promise<void>;
  handleAddSubtask: () => void;
  handleRemoveSubtask: (index: number) => void;
  handleClearFields: () => void;
  handleCreateCategory: (inputValue: string) => void;
  handleRemoveCategory: (categoryToRemove: string) => void; // Add this
}

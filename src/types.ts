// src/types.ts
import { Timestamp } from 'firebase/firestore';

export interface Subtask {
  description: string;
  status: 'not done' | 'done';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Normal' | 'Urgent';
  createdAt: Timestamp;
  userId: string;
  assignedTo:string[];
  category: string;
  dueDate: Timestamp;
  subtask?: Subtask[];
  status: string;
}

export interface Contact {
  id?: string;
  name: string;
  email: string;
  phoneNumber: string;
  createdAt: Timestamp;
  userId: string;
}
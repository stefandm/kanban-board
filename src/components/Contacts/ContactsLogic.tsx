// ContactsLogic.tsx
import React, { useState, useContext, useEffect } from 'react';
import {
  collection,
  addDoc,
  Timestamp,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { AuthContext } from '../../contexts/AuthContext';
import { Contact } from '../../types';
import { FirebaseError } from 'firebase/app';

const ContactsLogic: React.FC<{ children: (props: ContactsLogicProps) => JSX.Element }> = ({ children }) => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editContactId, setEditContactId] = useState<string | null>(null);
  const { currentUser } = useContext(AuthContext);

  // Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'new' | 'edit';
    contact?: Contact;
  }>({ isOpen: false, type: 'new' });

  useEffect(() => {
    let unsubscribeContacts: () => void;

    if (currentUser) {
      const contactsRef = collection(db, 'contacts');
      const q = query(contactsRef, where('userId', '==', currentUser.uid));

      unsubscribeContacts = onSnapshot(q, (querySnapshot) => {
        const contactsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Contact),
        }));
        setContacts(contactsData);
      });
    }

    return () => {
      if (unsubscribeContacts) unsubscribeContacts();
    };
  }, [currentUser]);

  const handleCreateOrUpdateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentUser) {
      setError('You must be logged in to create a contact.');
      return;
    }

    if (name.trim() === '' || email.trim() === '' || phoneNumber.trim() === '') {
      setError('All fields are required.');
      return;
    }

    try {
      const contactData: Omit<Contact, 'id'> = {
        name,
        email,
        phoneNumber,
        createdAt: Timestamp.fromDate(new Date()),
        userId: currentUser.uid,
      };

      if (isEditMode && editContactId) {
        // Update existing contact
        const contactRef = doc(db, 'contacts', editContactId);
        await updateDoc(contactRef, contactData);
        setIsEditMode(false);
        setEditContactId(null);
        setModalState({ isOpen: false, type: 'edit' });
      } else {
        // Add new contact
        await addDoc(collection(db, 'contacts'), contactData);
        setModalState({ isOpen: false, type: 'new' });
      }

      setName('');
      setEmail('');
      setPhoneNumber('');
    } catch (err: unknown) {
      console.error('Error adding/updating contact:', err);

      if (err instanceof FirebaseError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create/update contact. Please try again.');
      }
    }
  };

  const openNewContactModal = () => {
    setIsEditMode(false);
    setName('');
    setEmail('');
    setPhoneNumber('');
    setError('');
    setModalState({ isOpen: true, type: 'new' });
  };

  const openEditContactModal = (contact: Contact) => {
    setIsEditMode(true);
    setName(contact.name);
    setEmail(contact.email);
    setPhoneNumber(contact.phoneNumber);
    setError('');
    setEditContactId(contact.id || null);
    setModalState({ isOpen: true, type: 'edit', contact });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, type: 'new' });
    setName('');
    setEmail('');
    setPhoneNumber('');
    setIsEditMode(false);
    setError('');
    setEditContactId(null);
  };

  const handleDeleteFromModal = async () => {
    if (modalState.contact && modalState.contact.id && currentUser) {
      const confirmDelete = window.confirm(
        'Are you sure you want to delete this contact? This action cannot be undone.'
      );
      if (!confirmDelete) return;

      try {
        const contactRef = doc(db, 'contacts', modalState.contact.id);
        await deleteDoc(contactRef);
        closeModal();
      } catch (err) {
        console.error('Error deleting contact:', err);
        setError('Failed to delete contact. Please try again.');
      }
    }
  };

  const logicProps: ContactsLogicProps = {
    name,
    setName,
    email,
    setEmail,
    phoneNumber,
    setPhoneNumber,
    error,
    contacts,
    openNewContactModal,
    openEditContactModal,
    handleCreateOrUpdateContact,
    modalState,
    closeModal,
    handleDeleteFromModal,
    isEditMode,
  };

  return children(logicProps);
};

export default ContactsLogic;

// Define the props interface for the UI component
export interface ContactsLogicProps {
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  phoneNumber: string;
  setPhoneNumber: React.Dispatch<React.SetStateAction<string>>;
  error: string;
  contacts: Contact[];
  openNewContactModal: () => void;
  openEditContactModal: (contact: Contact) => void;
  handleCreateOrUpdateContact: (e: React.FormEvent) => Promise<void>;
  modalState: {
    isOpen: boolean;
    type: 'new' | 'edit';
    contact?: Contact;
  };
  closeModal: () => void;
  handleDeleteFromModal: () => Promise<void>;
  isEditMode: boolean;
}

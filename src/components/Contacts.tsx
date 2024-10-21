// src/components/Contacts.tsx
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
import { db } from '../firebase';
import { AuthContext } from '../contexts/AuthContext';
import { Contact } from '../types';
import { FirebaseError } from 'firebase/app';

const Contacts: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editContactId, setEditContactId] = useState<string | null>(null);
  const { currentUser } = useContext(AuthContext);

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

    // Cleanup function to unsubscribe listener
    return () => {
      if (unsubscribeContacts) unsubscribeContacts();
    };
  }, [currentUser]);

  const handleCreateContact = async (e: React.FormEvent) => {
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
      const newContact: Omit<Contact, 'id'> = {
        name,
        email,
        phoneNumber,
        createdAt: Timestamp.fromDate(new Date()), // Store as Timestamp
        userId: currentUser.uid,
      };

      if (isEditMode && editContactId) {
        // Update existing contact
        const contactRef = doc(db, 'contacts', editContactId);
        await updateDoc(contactRef, newContact);
        // No need to manually update contacts state; onSnapshot will handle it
        setIsEditMode(false);
        setEditContactId(null);
      } else {
        // Add new contact
        await addDoc(collection(db, 'contacts'), newContact);
        // No need to manually update contacts state; onSnapshot will handle it
      }

      // Clear form fields
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

  const handleEditContact = (contact: Contact) => {
    setName(contact.name);
    setEmail(contact.email);
    setPhoneNumber(contact.phoneNumber);
    setIsEditMode(true);
    setEditContactId(contact.id || null);
  };

  const handleDeleteContact = async (contactId: string) => {
    if (currentUser && contactId) {
      const confirmDelete = window.confirm(
        'Are you sure you want to delete this contact? This action cannot be undone.'
      );
      if (!confirmDelete) return;

      try {
        const contactRef = doc(db, 'contacts', contactId);
        await deleteDoc(contactRef);
        // No need to manually update contacts state; onSnapshot will handle it
      } catch (err) {
        console.error('Error deleting contact:', err);
      }
    }
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Please log in to manage your contacts.</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row md:space-x-6">
        {/* Form Section */}
        <div className="md:w-1/2">
          <form
            onSubmit={handleCreateContact}
            className="bg-white p-6 rounded shadow-md"
          >
            <h2 className="text-2xl mb-4 text-center">
              {isEditMode ? 'Edit Contact' : 'Create New Contact'}
            </h2>
            {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}
            <div className="mb-4">
              <label className="block text-gray-700">Name</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border rounded mt-1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                required
                className="w-full px-3 py-2 border rounded mt-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700">Phone Number</label>
              <input
                type="tel"
                required
                pattern="[0-9]{10}"
                className="w-full px-3 py-2 border rounded mt-1"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="1234567890"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
            >
              {isEditMode ? 'Update Contact' : 'Create Contact'}
            </button>
            {isEditMode && (
              <button
                type="button"
                onClick={() => {
                  // Reset form
                  setName('');
                  setEmail('');
                  setPhoneNumber('');
                  setIsEditMode(false);
                  setEditContactId(null);
                }}
                className="w-full bg-gray-500 text-white py-2 rounded mt-2 hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </form>
        </div>
        {/* Contacts List Section */}
        <div className="md:w-1/2 mt-6 md:mt-0">
          <h2 className="text-2xl mb-4 text-center">Your Contacts</h2>
          {contacts.length === 0 ? (
            <p className="text-gray-700 text-center">No contacts available.</p>
          ) : (
            <div className="space-y-4">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="bg-white p-4 rounded shadow flex justify-between items-center"
                >
                  <div>
                    <p className="text-lg font-semibold">{contact.name}</p>
                    <p className="text-gray-600">{contact.email}</p>
                    <p className="text-gray-600">{contact.phoneNumber}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditContact(contact)}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteContact(contact.id!)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contacts;

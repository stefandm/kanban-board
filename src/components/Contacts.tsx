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
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaPlusCircle,
  FaEdit,
  FaTrash,
  FaTimes,
} from 'react-icons/fa';

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
        createdAt: Timestamp.fromDate(new Date()),
        userId: currentUser.uid,
      };

      if (isEditMode && editContactId) {
        // Update existing contact
        const contactRef = doc(db, 'contacts', editContactId);
        await updateDoc(contactRef, newContact);
        setIsEditMode(false);
        setEditContactId(null);
      } else {
        // Add new contact
        await addDoc(collection(db, 'contacts'), newContact);
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
      } catch (err) {
        console.error('Error deleting contact:', err);
      }
    }
  };

  const handleClearForm = () => {
    setName('');
    setEmail('');
    setPhoneNumber('');
    setIsEditMode(false);
    setEditContactId(null);
    setError('');
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4 text-center text-blue-700">
          Please log in to manage your contacts.
        </h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row md:space-x-6">
        {/* Form Section */}
        <div className="md:w-1/2 mb-6 md:mb-0">
          <form
            onSubmit={handleCreateContact}
            className="bg-white p-8 rounded-lg shadow-lg"
          >
            <h2 className="text-3xl md:text-4xl mb-6 text-center font-bold text-blue-700 flex items-center justify-center">
              <FaUser className="mr-3 text-blue-700 text-4xl" />
              {isEditMode ? 'Edit Contact' : 'Create New Contact'}
            </h2>
            {error && <div className="mb-6 text-red-500 text-md">{error}</div>}
            {/* Name */}
            <div className="mb-6">
              <label className="block text-gray-700 text-lg font-medium mb-2">
                Name
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                />
              </div>
            </div>
            {/* Email */}
            <div className="mb-6">
              <label className="block text-gray-700 text-lg font-medium mb-2">
                Email
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
            </div>
            {/* Phone Number */}
            <div className="mb-6">
              <label className="block text-gray-700 text-lg font-medium mb-2">
                Phone Number
              </label>
              <div className="relative">
                <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="1234567890"
                />
              </div>
            </div>
            {/* Buttons */}
            <div className="flex flex-col md:flex-row md:space-x-4">
  <button
    type="submit"
    className="w-full md:w-1/2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 text-lg font-semibold flex items-center justify-center"
  >
    {isEditMode ? (
      <>
        <FaEdit className="mr-2" />
        Update Contact
      </>
    ) : (
      <>
        <FaPlusCircle className="mr-2" />
        Create Contact
      </>
    )}
  </button>
  {isEditMode && (
    <button
      type="button"
      onClick={handleClearForm}
      className="w-full md:w-1/2 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors duration-200 text-lg font-semibold flex items-center justify-center mt-2 md:mt-0"
    >
      <FaTimes className="mr-2" />
      Cancel
    </button>
  )}
</div>
          </form>
        </div>
        {/* Contacts List Section */}
        <div className="md:w-1/2">
          <h2 className="text-3xl md:text-4xl mb-6 text-center font-bold text-blue-700">
            Your Contacts
          </h2>
          {contacts.length === 0 ? (
            <p className="text-gray-700 text-center text-lg">
              No contacts available.
            </p>
          ) : (
            <div className="space-y-4">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center"
                >
                  <div>
                    <p className="text-xl font-semibold flex items-center text-gray-800">
                      <FaUser className="mr-2 text-blue-600" />
                      {contact.name}
                    </p>
                    <p className="text-gray-700 flex items-center mt-2">
                      <FaEnvelope className="mr-2 text-green-600" />
                      {contact.email}
                    </p>
                    <p className="text-gray-700 flex items-center mt-1">
                      <FaPhone className="mr-2 text-yellow-600" />
                      {contact.phoneNumber}
                    </p>
                  </div>
                  <div className="flex flex-col md:flex-row gap-2 ">
                    <button
                      onClick={() => handleEditContact(contact)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center"
                    >
                      <FaEdit className="mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteContact(contact.id!)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center"
                    >
                      <FaTrash className="mr-2" />
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

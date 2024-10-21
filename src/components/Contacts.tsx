
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
import Modal from './Modal';

const Contacts: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editContactId, setEditContactId] = useState<string | null>(null);
  const { currentUser } = useContext(AuthContext);

  const [isNewContactModalOpen, setIsNewContactModalOpen] = useState<boolean>(false);
  const [isEditContactModalOpen, setIsEditContactModalOpen] = useState<boolean>(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

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

  // Handle Create or Update Contact
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
        setIsEditContactModalOpen(false);
      } else {
        // Add new contact
        await addDoc(collection(db, 'contacts'), contactData);
        setIsNewContactModalOpen(false);
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

  // Open New Contact Modal
  const openNewContactModal = () => {
    setIsEditMode(false);
    setName('');
    setEmail('');
    setPhoneNumber('');
    setError('');
    setIsNewContactModalOpen(true);
  };

  // Open Edit Contact Modal
  const openEditContactModal = (contact: Contact) => {
    setIsEditMode(true);
    setSelectedContact(contact);
    setName(contact.name);
    setEmail(contact.email);
    setPhoneNumber(contact.phoneNumber);
    setError('');
    setEditContactId(contact.id || null);
    setIsEditContactModalOpen(true);
  };

  // Close All Modals
  const closeModals = () => {
    setIsNewContactModalOpen(false);
    setIsEditContactModalOpen(false);
    setSelectedContact(null);
    setName('');
    setEmail('');
    setPhoneNumber('');
    setIsEditMode(false);
    setError('');
    setEditContactId(null);
  };

  // Handle Delete from Edit Modal
  const handleDeleteFromModal = async () => {
    if (selectedContact && selectedContact.id && currentUser) {
      const confirmDelete = window.confirm(
        'Are you sure you want to delete this contact? This action cannot be undone.'
      );
      if (!confirmDelete) return;

      try {
        const contactRef = doc(db, 'contacts', selectedContact.id);
        await deleteDoc(contactRef);
        closeModals();
      } catch (err) {
        console.error('Error deleting contact:', err);
        setError('Failed to delete contact. Please try again.');
      }
    }
  };

  // Handle Clear Form

  // If not logged in, prompt to log in
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
    <div className="w-full relative ">
    <div className="flex flex-col md:flex-row justify-between">
      {/* New Contact Button Fixed in the Center */}
      <div className="fixed md:top-1/2 md:left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-[90vh] left-[50vw]  z-50 ">
        <button
          onClick={openNewContactModal}
          className="bg-gray-700 hover:bg-blue-400 text-white py-6 px-12 rounded-full text-xl font-semibold flex items-center shadow-lg transition-transform transform hover:scale-105"
        >
          <FaPlusCircle className="mr-2" />
          New Contact
        </button>
      </div>

      {/* Contacts List Section on the Right */}
      <div className="md:w-[20vw] max-h-[90vh] overflow-y-auto scroll-smooth">
        {contacts.length === 0 ? (
          <p className="text-gray-700 text-center text-lg">
            No contacts available.
          </p>
        ) : (
          <div className='bg-white'>
            {contacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => openEditContactModal(contact)}
                className="group bg-white mx-8 my-6 py-2 pl-12 border-b-2 rounded-t-xl border-gray-500 flex justify-betwen items-center cursor-pointer hover:bg-gray-700  transition-colors duration-200 "
              >
                 <div className=" w-12 h-12 rounded-full bg-blue-600 group-hover:bg-blue-400 flex items-center justify-center text-white font-bold mr-4">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                <div>
                  <p className="text-xl font-bold text-gray-700 group-hover:text-white">
                    {contact.name}
                  </p>
                  <p className="text-blue-700 flex items-center mt-2 group-hover:text-white">
                    {contact.email}
                  </p>
                  <p className="flex items-center mt-1 text-green-800 group-hover:text-white">
                    {contact.phoneNumber}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

    {/* New Contact Modal */}
    {isNewContactModalOpen && (
      <Modal onClose={closeModals}>
        <form onSubmit={handleCreateOrUpdateContact} className="bg-white p-8 rounded-lg">
          <h2 className="text-3xl mb-6 text-center font-bold flex items-center justify-center">
            New Contact
          </h2>
          {error && <div className="mb-6 text-red-500 text-md">{error}</div>}
          {/* Name */}
          <div className="mb-6">
            <label htmlFor="name" className="block text-gray-700 text-lg font-medium mb-2">
              Name
            </label>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="name"
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
            <label htmlFor="email" className="block text-gray-700 text-lg font-medium mb-2">
              Email
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="email"
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
            <label htmlFor="phoneNumber" className="block text-gray-700 text-lg font-medium mb-2">
              Phone Number
            </label>
            <div className="relative">
              <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="phoneNumber"
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
              className="w-full md:w-1/2 bg-gray-500 hover:bg-green-700 text-white py-3 rounded-lg transition-colors duration-200 text-lg font-semibold flex items-center justify-center shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]"
            >
              <FaPlusCircle className="mr-2" />
              Create Contact
            </button>
            <button
              type="button"
              onClick={closeModals}
              className="w-full md:w-1/2 hover:text-blue-800 hover:bg-blue-100 py-3 rounded-lg transition-colors duration-200 text-lg font-semibold flex items-center justify-center mt-2 md:mt-0 shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]"
            >
              <FaTimes className="mr-2" />
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    )}

    {/* Edit Contact Modal */}
    {isEditContactModalOpen && selectedContact && (
      <Modal onClose={closeModals}>
        <form onSubmit={handleCreateOrUpdateContact} className="bg-white p-8 rounded-lg ">
          <h2 className="text-3xl mb-6 text-center font-bold flex items-center justify-center">
            Edit Contact
          </h2>
          {error && <div className="mb-6 text-red-500 text-md">{error}</div>}
          {/* Name */}
          <div className="mb-6">
            <label htmlFor="editName" className="block text-gray-700 text-lg font-medium mb-2">
              Name
            </label>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="editName"
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
            <label htmlFor="editEmail" className="block text-gray-700 text-lg font-medium mb-2">
              Email
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="editEmail"
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
            <label htmlFor="editPhoneNumber" className="block text-gray-700 text-lg font-medium mb-2">
              Phone Number
            </label>
            <div className="relative">
              <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="editPhoneNumber"
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
              className="w-full md:w-1/2 bg-gray-500 hover:bg-green-700 text-white py-3 rounded-lg transition-colors duration-200 text-lg font-semibold flex items-center justify-center shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]"
            >
              <FaEdit className="mr-2" />
              Update Contact
            </button>
            <button
              type="button"
              onClick={handleDeleteFromModal}
              className="w-full md:w-1/2 hover:text-red-700 outline outline-1 hover:outline-red-700 py-3 rounded-lg transition-colors duration-200 text-lg font-semibold flex items-center justify-center mt-2 md:mt-0"
            >
              <FaTrash className="mr-2" />
              Delete Contact
            </button>
          </div>
        </form>
      </Modal>
    )}
  </div>
  );
};

export default Contacts;

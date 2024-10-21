// src/components/CreateContact.tsx
import React, { useState, useContext } from 'react';
import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Contact } from '../types';
import { FirebaseError } from 'firebase/app';


const CreateContact: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

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
        createdAt: new Date(),
        userId: currentUser.uid,
      };
  
      await addDoc(collection(db, 'contacts'), {
        ...newContact,
        createdAt: Timestamp.fromDate(newContact.createdAt),
      });
  
      // Redirect to Contacts Dashboard or another relevant page after successful creation
      navigate('/contacts');
    } catch (err: unknown) {  // Use 'unknown' here
      console.error('Error adding contact:', err);
  
      // Type checking using type guards
      if (err instanceof FirebaseError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create contact. Please try again.');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleCreateContact}
        className="bg-white p-6 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl mb-4 text-center">Create New Contact</h2>
        {error && (
          <div className="mb-4 text-red-500 text-sm">
            {error}
          </div>
        )}
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
          Create Contact
        </button>
      </form>
    </div>
  );
};

export default CreateContact;

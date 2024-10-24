// ContactsUI.tsx
import React from 'react';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaPlusCircle,
  FaEdit,
  FaTrash,
  FaTimes,
} from 'react-icons/fa';
import Modal from '../Modal';
import { ContactsLogicProps } from './ContactsLogic';

const ContactsUI: React.FC<ContactsLogicProps> = ({
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
}) => {
  if (!modalState.isOpen && !contacts) {
    return null; // Or a loading state
  }

  return (
    <div className="w-full relative">
      <div className="flex flex-col md:flex-row justify-between">
        <div
          className="fixed md:top-1/2 md:left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-[85vh] left-[30vw] z-50"
          aria-label="New Contact Button Container"
        >
          <button
            onClick={openNewContactModal}
            className="bg-gray-700 hover:bg-blue-400 text-white py-3 md:py-6 px-4 md:px-12 rounded-full text-xl font-semibold flex items-center shadow-lg transition-transform transform hover:scale-105"
            aria-label="Add New Contact"
          >
            <FaPlusCircle className="mr-2" aria-hidden="true" />
            New Contact
          </button>
        </div>

        <div
          className="md:min-w-[20vw] max-h-[95vh] overflow-y-auto scroll-smooth"
          role="region"
          aria-labelledby="contacts-heading"
        >
          <h2 id="contacts-heading" className="sr-only">
            Contacts List
          </h2>
          {contacts.length === 0 ? (
            <div
              className="text-gray-700 mt-[5vh] justify-center items-center text-center text-2xl"
              role="status"
              aria-live="polite"
            >
              No contacts available.
            </div>
          ) : (
            <div className="bg-white">
              {contacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => openEditContactModal(contact)}
                  className="group bg-white w-[80%] mx-8 my-6 py-2 pl-4 pr-12 border-b-2 rounded-t-xl border-gray-500 flex justify-between items-center cursor-pointer hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label={`Edit contact ${contact.name}`}
                >
                  <div
                    className="min-w-12 min-h-12 rounded-full bg-blue-600 group-hover:bg-blue-400 flex items-center justify-center text-white text-xl font-light mr-4"
                    aria-hidden="true"
                  >
                    {contact.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </div>
                  <div className="">
                    <p className="text-xl text-center font-bold text-gray-700 group-hover:text-white">
                      {contact.name}
                    </p>
                    <p className="text-blue-700 text-sm flex justify-center mt-2 group-hover:text-white">
                      {contact.email}
                    </p>
                    <p className="flex justify-center mt-1 text-green-800 group-hover:text-white">
                      {contact.phoneNumber}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reusable Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        ariaLabel={
          modalState.type === 'new' ? 'Create New Contact Modal' : 'Edit Contact Modal'
        }
      >
        <form
          onSubmit={handleCreateOrUpdateContact}
          className="bg-white p-8 rounded-lg"
          aria-labelledby={
            modalState.type === 'new' ? 'create-contact-heading' : 'edit-contact-heading'
          }
        >
          <h2
            id={
              modalState.type === 'new' ? 'create-contact-heading' : 'edit-contact-heading'
            }
            className="text-3xl mb-6 text-center font-bold flex items-center justify-center"
          >
            {modalState.type === 'new' ? 'New Contact' : 'Edit Contact'}
          </h2>
          {error && (
            <div className="mb-6 text-red-500 text-md" role="alert">
              {error}
            </div>
          )}
          {/* Name */}
          <div className="mb-6">
            <label
              htmlFor="name"
              className="block text-gray-700 text-lg font-medium mb-2"
            >
              Name
            </label>
            <div className="relative">
              <FaUser
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
              <input
                id="name"
                type="text"
                required
                className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                aria-required="true"
              />
            </div>
          </div>
          <div className="mb-6">
            <label
              htmlFor="email"
              className="block text-gray-700 text-lg font-medium mb-2"
            >
              Email
            </label>
            <div className="relative">
              <FaEnvelope
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
              <input
                id="email"
                type="email"
                required
                className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-required="true"
              />
            </div>
          </div>
          <div className="mb-6">
            <label
              htmlFor="phoneNumber"
              className="block text-gray-700 text-lg font-medium mb-2"
            >
              Phone Number
            </label>
            <div className="relative">
              <FaPhone
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
              <input
                id="phoneNumber"
                type="tel"
                required
                pattern="[0-9]{10}"
                className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="1234567890"
                aria-required="true"
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:space-x-4">
            <button
              type="submit"
              className="w-full md:w-1/2 bg-gray-500 hover:bg-green-700 text-white py-3 rounded-lg transition-colors duration-200 text-lg font-semibold flex items-center justify-center shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]"
              aria-label={
                modalState.type === 'new' ? 'Create Contact' : 'Update Contact'
              }
            >
              {modalState.type === 'new' ? (
                <>
                  <FaPlusCircle className="mr-2" aria-hidden="true" />
                  Create Contact
                </>
              ) : (
                <>
                  <FaEdit className="mr-2" aria-hidden="true" />
                  Update Contact
                </>
              )}
            </button>
            {modalState.type === 'edit' && (
              <button
                type="button"
                onClick={handleDeleteFromModal}
                className="w-full md:w-1/2 hover:text-red-700 outline outline-1 hover:outline-red-700 py-3 rounded-lg transition-colors duration-200 text-lg font-semibold flex items-center justify-center mt-2 md:mt-0"
                aria-label="Delete Contact"
              >
                <FaTrash className="mr-2" aria-hidden="true" />
                Delete Contact
              </button>
            )}
            <button
              type="button"
              onClick={closeModal}
              className="w-full md:w-1/2 hover:text-blue-800 hover:bg-blue-100 py-3 rounded-lg transition-colors duration-200 text-lg font-semibold flex items-center justify-center mt-2 md:mt-0"
              aria-label="Cancel"
            >
              <FaTimes className="mr-2" aria-hidden="true" />
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ContactsUI;

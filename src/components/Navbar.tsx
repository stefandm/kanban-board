// src/components/Navbar.tsx

import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import {
  FaTasks,
  FaTachometerAlt,
  FaPlusCircle,
  FaAddressBook,
  FaSignOutAlt,
  FaUserCircle,
  FaSignInAlt,
  FaUserPlus,
  FaBars,
  FaTimes,
} from 'react-icons/fa';

const Navbar: React.FC = () => {
  const { currentUser } = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Optionally, redirect to login page
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-blue-700 sticky top-0 z-20 h-[10vh]">
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center h-16">
        {/* Logo */}
        <Link
          to="/summary"
          className="text-white text-2xl md:text-3xl font-bold flex items-center"
        >
          <FaTasks className="mr-2" /> TaskApp
        </Link>

        {/* Hamburger Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white focus:outline-none"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <FaTimes className="text-2xl" />
            ) : (
              <FaBars className="text-2xl" />
            )}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex md:items-center md:space-x-2">
          {currentUser ? (
            <>
              <Link
                to="/summary"
                className="flex items-center bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200"
              >
                <FaTasks className="mr-2" />
                Summary
              </Link>
              <Link
                to="/dashboard"
                className="flex items-center bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                <FaTachometerAlt className="mr-2" />
                Dashboard
              </Link>
              <Link
                to="/create-task"
                className="flex items-center bg-yellow-500 text-white px-3 py-2 rounded-lg hover:bg-yellow-600 transition-colors duration-200"
              >
                <FaPlusCircle className="mr-2" />
                Create Task
              </Link>
              <Link
                to="/contacts"
                className="flex items-center bg-purple-500 text-white px-3 py-2 rounded-lg hover:bg-purple-600 transition-colors duration-200"
              >
                <FaAddressBook className="mr-2" />
                Contacts
              </Link>
              <span className="text-white flex items-center">
                <FaUserCircle className="mr-2" />
                {currentUser.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200"
              >
                <FaSignOutAlt className="mr-2" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="flex items-center text-white hover:text-gray-300 transition-colors duration-200"
              >
                <FaSignInAlt className="mr-2" />
                Login
              </Link>
              <Link
                to="/signup"
                className="flex items-center text-white hover:text-gray-300 transition-colors duration-200"
              >
                <FaUserPlus className="mr-2" />
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {currentUser ? (
              <>
                <Link
                  to="/summary"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200"
                >
                  <FaTasks className="mr-2" />
                  Summary
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 mt-2"
                >
                  <FaTachometerAlt className="mr-2" />
                  Dashboard
                </Link>
                <Link
                  to="/create-task"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center bg-yellow-500 text-white px-3 py-2 rounded-lg hover:bg-yellow-600 transition-colors duration-200 mt-2"
                >
                  <FaPlusCircle className="mr-2" />
                  Create Task
                </Link>
                <Link
                  to="/contacts"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center bg-purple-500 text-white px-3 py-2 rounded-lg hover:bg-purple-600 transition-colors duration-200 mt-2"
                >
                  <FaAddressBook className="mr-2" />
                  Contacts
                </Link>
                <span className="text-white flex items-center mt-2">
                  <FaUserCircle className="mr-2" />
                  {currentUser.email}
                </span>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 mt-2"
                >
                  <FaSignOutAlt className="mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center text-white hover:text-gray-300 transition-colors duration-200"
                >
                  <FaSignInAlt className="mr-2" />
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center text-white hover:text-gray-300 transition-colors duration-200 mt-2"
                >
                  <FaUserPlus className="mr-2" />
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

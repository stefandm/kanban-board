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
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className="bg-gray-800"
      role="navigation"
      aria-label="Main Navigation"
    >
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center h-16">
        <Link
          to="/summary"
          className="text-white text-2xl md:text-3xl font-bold flex items-center"
          aria-label="Kanban Dashboard Home"
        >
          <FaTasks className="mr-2" aria-hidden="true" /> Kanban
        </Link>

        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white focus:outline-none focus:ring-2 focus:ring-white rounded"
            aria-label={
              isMobileMenuOpen
                ? 'Close navigation menu'
                : 'Open navigation menu'
            }
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? (
              <FaTimes className="text-2xl" aria-hidden="true" />
            ) : (
              <FaBars className="text-2xl" aria-hidden="true" />
            )}
          </button>
        </div>

        <div className="hidden md:flex md:items-center md:space-x-2">
          {currentUser ? (
            <>
              <Link
                to="/summary"
                className="flex items-center text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="View Summary"
              >
                <FaTasks className="mr-2" aria-hidden="true" />
                Summary
              </Link>
              <Link
                to="/dashboard"
                className="flex items-center text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="View Dashboard"
              >
                <FaTachometerAlt className="mr-2" aria-hidden="true" />
                Dashboard
              </Link>
              <Link
                to="/create-task"
                className="flex items-center text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Create New Task"
              >
                <FaPlusCircle className="mr-2" aria-hidden="true" />
                Create Task
              </Link>
              <Link
                to="/contacts"
                className="flex items-center text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Manage Contacts"
              >
                <FaAddressBook className="mr-2" aria-hidden="true" />
                Contacts
              </Link>
              <div
                className="text-white px-4 flex items-center"
                aria-label={`Logged in as ${currentUser.email}`}
              >
                <FaUserCircle className="mr-2" size={30} aria-hidden="true" />
                <span className="sr-only">User Initial</span>
                {currentUser.email?.charAt(0).toUpperCase()}
              </div>
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Logout"
              >
                <FaSignOutAlt className="mr-2" aria-hidden="true" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="flex items-center text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Log In"
              >
                <FaSignInAlt className="mr-2" aria-hidden="true" />
                Login
              </Link>
              {/* Sign Up Link */}
              <Link
                to="/signup"
                className="flex items-center text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Sign Up"
              >
                <FaUserPlus className="mr-2" aria-hidden="true" />
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

      {isMobileMenuOpen && (
        <div
          className="md:hidden"
          id="mobile-menu"
          role="menu"
          aria-label="Mobile Navigation Menu"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {currentUser ? (
              <>
                <Link
                  to="/summary"
                  onClick={closeMobileMenu}
                  className="flex items-center bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white"
                  role="menuitem"
                  aria-label="View Summary"
                >
                  <FaTasks className="mr-2" aria-hidden="true" />
                  Summary
                </Link>
                <Link
                  to="/dashboard"
                  onClick={closeMobileMenu}
                  className="flex items-center bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 mt-2 focus:outline-none focus:ring-2 focus:ring-white"
                  role="menuitem"
                  aria-label="View Dashboard"
                >
                  <FaTachometerAlt className="mr-2" aria-hidden="true" />
                  Dashboard
                </Link>
                <Link
                  to="/create-task"
                  onClick={closeMobileMenu}
                  className="flex items-center bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 mt-2 focus:outline-none focus:ring-2 focus:ring-white"
                  role="menuitem"
                  aria-label="Create New Task"
                >
                  <FaPlusCircle className="mr-2" aria-hidden="true" />
                  Create Task
                </Link>
                <Link
                  to="/contacts"
                  onClick={closeMobileMenu}
                  className="flex items-center bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 mt-2 focus:outline-none focus:ring-2 focus:ring-white"
                  role="menuitem"
                  aria-label="Manage Contacts"
                >
                  <FaAddressBook className="mr-2" aria-hidden="true" />
                  Contacts
                </Link>
                {/* User Profile */}
                <span
                  className="text-white flex items-center mt-2 px-3 py-2 rounded-lg bg-gray-500"
                  aria-label={`Logged in as ${currentUser.email}`}
                >
                  <FaUserCircle className="mr-2" size={30} aria-hidden="true" />
                  {currentUser.email}
                </span>
                {/* Logout Button */}
                <button
                  onClick={() => {
                    handleLogout();
                    closeMobileMenu();
                  }}
                  className="flex items-center bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 mt-2 focus:outline-none focus:ring-2 focus:ring-white"
                  role="menuitem"
                  aria-label="Logout"
                >
                  <FaSignOutAlt className="mr-2" aria-hidden="true" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="flex items-center text-white hover:bg-gray-600 px-3 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white"
                  role="menuitem"
                  aria-label="Log In"
                >
                  <FaSignInAlt className="mr-2" aria-hidden="true" />
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={closeMobileMenu}
                  className="flex items-center text-white hover:bg-gray-600 px-3 py-2 rounded-lg transition-colors duration-200 mt-2 focus:outline-none focus:ring-2 focus:ring-white"
                  role="menuitem"
                  aria-label="Sign Up"
                >
                  <FaUserPlus className="mr-2" aria-hidden="true" />
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

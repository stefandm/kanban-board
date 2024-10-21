// src/components/Navbar.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const Navbar: React.FC = () => {
  const { currentUser } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Optionally, redirect to login page
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-blue-500 p-4 flex justify-between items-center">
      <Link to="/dashboard" className="text-white text-xl font-bold">
        TaskApp
      </Link>
      <div>
        {currentUser ? (
          <>
          <Link
              to="/create-task"
              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 mr-4"
            >
              Create Task
            </Link>
            <span className="text-white mr-4">
              {currentUser.email}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            
            <Link to="/login" className="text-white mr-4 hover:underline">
              Login
            </Link>
            <Link to="/signup" className="text-white hover:underline">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

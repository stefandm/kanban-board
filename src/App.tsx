import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import TaskBoard from './components/TaskBoard';
import Navbar from './components/Navbar';
import CreateTask from './components/CreateTask/CreateTask';
import Contacts from './components/Contacts/Contacts';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import Summary from './components/Summary/Summary';

const App: React.FC = () => {
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState<boolean>(false);

  const openCreateTaskModal = () => {
    setIsCreateTaskModalOpen(true);
  };

  const closeCreateTaskModal = () => {
    setIsCreateTaskModalOpen(false);
  };

  return (
    <AuthProvider>
      <Router>
        <Navbar openCreateTaskModal={openCreateTaskModal} />

        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <TaskBoard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/summary"
            element={
              <ProtectedRoute>
                <Summary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contacts"
            element={
              <ProtectedRoute>
                <Contacts />
              </ProtectedRoute>
            }
          />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Login />} /> {/* Default route */}
        </Routes>

        {/* Render the CreateTask modal */}
        <CreateTask isOpen={isCreateTaskModalOpen} onClose={closeCreateTaskModal} />
      </Router>
    </AuthProvider>
  );
};

export default App;

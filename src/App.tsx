// src/App.tsx
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import TaskBoard from './components/TaskBoard';
import Navbar from './components/Navbar';
import CreateTask from './components/CreateTask';
import Contacts from './components/Contacts';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import Summary from './components/Summary';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router basename="/kanban-board"> {/* Set basename if needed */}
        <Navbar />
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
            path="/create-task"
            element={
              <ProtectedRoute>
                <CreateTask />
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
      </Router>
    </AuthProvider>
  );
};

export default App;

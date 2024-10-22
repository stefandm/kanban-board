import React, { useState } from 'react';
import { auth } from '../firebase';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { FirebaseError } from 'firebase/app';
import { z } from 'zod';
import { ZodError } from 'zod';
import { FaLock, FaEnvelope } from 'react-icons/fa';
import Modal from './Modal';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [resetEmail, setResetEmail] = useState<string>('');
  const [resetMessage, setResetMessage] = useState<string>('');
  const navigate = useNavigate();

  const emailSchema = z.string().email({ message: 'Invalid email address' });
  const passwordSchema = z.string().min(6, { message: 'Password must be at least 6 characters' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const validatedEmail = emailSchema.parse(email);
      const validatedPassword = passwordSchema.parse(password);

      await signInWithEmailAndPassword(auth, validatedEmail, validatedPassword);
      navigate('/summary');
    } catch (err) {
      if (err instanceof ZodError) {
        const validationErrors = err.errors.map((e) => e.message).join(' ');
        setError(validationErrors);
      } else if (err instanceof FirebaseError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  const handleGuestLogin = async () => {
    setError('');
    try {
      const guestEmail = 'guest@gmail.com';
      const guestPassword = 'guestpassword';
      await signInWithEmailAndPassword(auth, guestEmail, guestPassword);
      navigate('/summary');
    } catch (err: unknown) {
      if (err instanceof FirebaseError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to log in as guest. Please try again.');
      }
    }
  };

  const openResetModal = () => {
    setResetEmail('');
    setResetMessage('');
    setIsResetModalOpen(true);
  };

  const closeResetModal = () => {
    setIsResetModalOpen(false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage('');
    setError('');

    try {
      const validatedEmail = emailSchema.parse(resetEmail);

      await sendPasswordResetEmail(auth, validatedEmail);
      setResetMessage('Password reset email sent. Please check your inbox.');
    } catch (err) {
      if (err instanceof ZodError) {
        const validationErrors = err.errors.map((e) => e.message).join(' ');
        setError(validationErrors);
      } else if (err instanceof FirebaseError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-purple-100 p-4"
      role="main"
      aria-labelledby="login-heading"
    >
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px] w-full max-w-md min-w-[35vw]"
        aria-labelledby="login-heading"
      >
        <h2
          id="login-heading"
          className="text-3xl md:text-4xl mb-6 text-center font-bold flex items-center justify-center"
        >
          Log In
        </h2>
        {error && (
          <div className="mb-4 text-red-500 text-md" role="alert">
            {error}
          </div>
        )}
        <div className="mb-6">
          <label
            htmlFor="login-email"
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
              id="login-email"
              type="email"
              required
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              aria-required="true"
            />
          </div>
        </div>
        <div className="mb-6">
          <label
            htmlFor="login-password"
            className="block text-gray-700 text-lg font-medium mb-2"
          >
            Password
          </label>
          <div className="relative">
            <FaLock
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              id="login-password"
              type="password"
              required
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              aria-required="true"
            />
          </div>
        </div>
        <div className="mb-6 text-right">
          <button
            type="button"
            onClick={openResetModal}
            className="text-blue-600 hover:text-blue-800 hover:underline text-md font-medium"
            aria-label="Forgot Password"
          >
            Forgot Password?
          </button>
        </div>
        <button
          type="submit"
          className="w-full bg-gray-700 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-200 text-lg font-semibold mb-4 hover:shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]"
          aria-label="Log In"
        >
          Log In
        </button>
        <button
          type="button"
          onClick={handleGuestLogin}
          className="w-full outline-[1px] border border-gray-700 py-3 rounded-lg hover:outline-0 hover:text-blue-700 transition duration-200 text-lg font-semibold hover:shadow-[1px_1px_1px_2px_#2b6cb0]"
          aria-label="Continue as Guest"
        >
          Continue as Guest
        </button>
        <p className="mt-6 text-center text-md">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
            aria-label="Sign Up"
          >
            Sign Up
          </Link>
        </p>
      </form>

      {isResetModalOpen && (
        <Modal onClose={closeResetModal} ariaLabel="Password Reset Modal">
          <form
            onSubmit={handlePasswordReset}
            className="bg-white p-8 rounded-lg"
            aria-labelledby="reset-password-heading"
          >
            <h2
              id="reset-password-heading"
              className="text-3xl mb-6 text-center font-bold flex items-center justify-center"
            >
              Reset Password
            </h2>
            {error && (
              <div className="mb-4 text-red-500 text-md" role="alert">
                {error}
              </div>
            )}
            {resetMessage && (
              <div className="mb-4 text-green-500 text-md" role="status">
                {resetMessage}
              </div>
            )}
            <div className="mb-6">
              <label
                htmlFor="reset-email"
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
                  id="reset-email"
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Email"
                  aria-required="true"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-gray-700 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-200 text-lg font-semibold mb-4 hover:shadow-[1px_1px_1px_2px_#2b6cb0]"
              aria-label="Send Password Reset Email"
            >
              Send Reset Email
            </button>
            <button
              type="button"
              onClick={closeResetModal}
              className="w-full border-gray-700 border-[1px] hover:text-blue-700 py-3 rounded-lg hover:border-blue-700 transition duration-200 text-lg font-semibold hover:shadow-[1px_1px_1px_2px_#2b6cb0]"
              aria-label="Cancel Password Reset"
            >
              Cancel
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Login;

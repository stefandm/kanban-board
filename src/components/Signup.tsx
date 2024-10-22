import React, { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { ZodError } from 'zod';

const signupSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const Signup: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const validatedData = signupSchema.parse({ email, password });

      await createUserWithEmailAndPassword(auth, validatedData.email, validatedData.password);

      navigate('/dashboard');
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-purple-100">
      <form
        onSubmit={handleSignup}
        className="bg-white p-6 shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px] w-full md:max-w-[35vw] rounded-lg"
      >
        <h2 className="text-3xl md:text-4xl font-bold  mb-4 text-center ">Sign Up</h2>
        {error && (
          <div className="mb-4 text-red-500 text-sm">
            {error}
          </div>
        )}
        <div className="mb-4">
          <label className="block text-gray-700 rounded-lg">Email</label>
          <input
            type="email"
            required
            className="w-full px-3 py-2 border mt-1 rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 rounded-lg">Password</label>
          <input
            type="password"
            required
            className="w-full px-3 py-2 border rounded-lg mt-1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-gray-700 text-white text-lg py-2 rounded-lg hover:bg-blue-700 hover:shadow-[1px_1px_1px_2px_#2b6cb0]"
        >
          Sign Up
        </button>
        <p className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-blue-500 hover:underline"
            aria-label="Sign Up"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;

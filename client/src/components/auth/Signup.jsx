import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FcGoogle } from 'react-icons/fc';
import { FiArrowLeft, FiMail, FiLock, FiUser } from 'react-icons/fi';

const Signup = () => {
  const { googleLogin, signupWithEmail, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await signupWithEmail({ name, email, password });
      navigate('/');
    } catch (submitError) {
      setError(submitError.response?.data?.error || 'Unable to sign up. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top_right,_#052e16_0%,_#064e3b_32%,_#030712_100%)] px-4">
      <div className="absolute inset-0 opacity-30 [background:linear-gradient(110deg,rgba(45,212,191,0.22),transparent_30%,transparent_70%,rgba(59,130,246,0.2))]" />

      <div className="relative w-full max-w-md">
        <div className="rounded-3xl border border-white/10 bg-white/95 dark:bg-gray-900/90 shadow-2xl backdrop-blur-xl p-7 sm:p-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-6"
          >
            <FiArrowLeft className="mr-2" /> Back to Home
          </button>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create account</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Sign up with email/password or Google OAuth.</p>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Full name</label>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2">
                <FiUser className="text-gray-400" />
                <input
                  type="text"
                  required
                  minLength={2}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent outline-none text-gray-900 dark:text-white"
                  placeholder="Your name"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Email</label>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2">
                <FiMail className="text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent outline-none text-gray-900 dark:text-white"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Password</label>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2">
                <FiLock className="text-gray-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent outline-none text-gray-900 dark:text-white"
                  placeholder="Minimum 6 characters"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 font-semibold transition disabled:opacity-60"
            >
              {submitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
            <span className="text-xs uppercase text-gray-400">or</span>
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
          </div>

          <button
            onClick={googleLogin}
            className="w-full flex justify-center items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100 py-2.5 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <FcGoogle className="text-xl" /> Sign up with Google
          </button>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;

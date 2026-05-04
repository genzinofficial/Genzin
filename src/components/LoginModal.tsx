import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginModal: React.FC = () => {
  const { isLoginModalOpen, setIsLoginModalOpen, login, authError, setAuthError } = useAuth();

  if (!isLoginModalOpen) return null;

  const handleClose = () => {
    setIsLoginModalOpen(false);
    setAuthError(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-8 pb-0 flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold tracking-[0.3em] text-accent uppercase mb-2 block text-left">Member Access</span>
              <h2 className="text-3xl font-display tracking-tight text-left">Welcome Back.</h2>
            </div>
            <button 
              onClick={handleClose}
              className="p-2 hover:bg-stone rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-8 space-y-4">
            <p className="text-gray-500 text-sm mb-8 text-left">
              Select your preferred method to sign in and access your personal curation.
            </p>

            {authError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 text-red-500 p-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-center"
              >
                {authError}
              </motion.div>
            )}

            {/* Social Login Options */}
            <button
              onClick={() => login('google')}
              className="w-full bg-white border border-gray-100 py-4 rounded-2xl flex items-center justify-center gap-4 hover:bg-stone transition-all group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-widest">Sign in with Google</span>
            </button>

            <button
              onClick={() => login('apple')}
              className="w-full bg-black text-white py-4 rounded-2xl flex items-center justify-center gap-4 hover:bg-accent transition-all group"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M17.057 10.706c-.024-2.583 2.115-3.812 2.211-3.873-1.201-1.748-3.056-1.986-3.71-2.016-1.564-.162-3.053 1.03-3.846 1.03-.793 0-2.031-1.01-3.344-1.01-1.725 0-3.315.986-4.201 2.528-1.787 3.109-.459 7.712 1.28 10.224.851 1.229 1.862 2.611 3.189 2.562 1.277-.05 1.76-.82 3.303-.82 1.542 0 1.975.82 3.325.794 1.378-.024 2.247-1.254 3.093-2.493.978-1.428 1.383-2.81 1.403-2.885-.029-.015-2.697-1.034-2.723-4.051zm-1.89-6.494c.703-.852 1.173-2.034 1.043-3.212-1.014.04-2.24.673-2.968 1.524-.654.752-1.224 1.956-1.069 3.111 1.127.087 2.29-.571 2.994-1.423z"/>
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-widest">Sign in with Apple</span>
            </button>

            <button
              onClick={() => login('facebook')}
              className="w-full bg-[#1877F2] text-white py-4 rounded-2xl flex items-center justify-center gap-4 hover:bg-opacity-90 transition-all group"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-widest">Sign in with Facebook</span>
            </button>
          </div>

          <div className="p-8 pt-0 text-center">
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
              By signing in, you agree to our Terms of Service <br /> and Privacy Policy.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LoginModal;

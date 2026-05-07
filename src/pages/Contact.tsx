import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Send, Instagram, Twitter, Youtube } from 'lucide-react';

const Contact: React.FC = () => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormState({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 max-w-screen-2xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
        {/* Left Column: Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-16">
            <span className="text-[10px] font-bold tracking-[0.3em] text-accent uppercase mb-4 block">Get In Touch</span>
            <h1 className="text-7xl md:text-8xl font-display tracking-tighter mb-8 leading-[0.9]">
              Connect <br /> with us.
            </h1>
            <p className="text-gray-500 max-w-md text-lg leading-relaxed">
              Have questions about our collections, orders, or just want to chat? Our team is here to help you redefine your style.
            </p>
          </div>

          <div className="space-y-12">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-stone flex items-center justify-center rounded-2xl shrink-0">
                <Mail size={20} className="text-ink" />
              </div>
              <div>
                <h3 className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">Email</h3>
                <p className="font-bold text-lg">genzin.official@gmail.com</p>
                <p className="text-sm text-gray-500 mt-1">Response within 24 hours</p>
              </div>
            </div>
          </div>

          <div className="mt-20 flex space-x-6">
            <a href="#" className="w-10 h-10 border border-gray-100 flex items-center justify-center rounded-full hover:bg-ink hover:text-white transition-all">
              <Instagram size={18} />
            </a>
            <a href="#" className="w-10 h-10 border border-gray-100 flex items-center justify-center rounded-full hover:bg-ink hover:text-white transition-all">
              <Twitter size={18} />
            </a>
            <a href="#" className="w-10 h-10 border border-gray-100 flex items-center justify-center rounded-full hover:bg-ink hover:text-white transition-all">
              <Youtube size={18} />
            </a>
          </div>
        </motion.div>

        {/* Right Column: Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-stone p-12 md:p-16 rounded-[40px] relative overflow-hidden"
        >
          {isSuccess ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-accent text-white flex items-center justify-center rounded-full mb-8">
                <Send size={32} />
              </div>
              <h2 className="text-4xl font-display mb-4">Message Received.</h2>
              <p className="text-gray-500 mb-8 max-w-xs">
                Our team has received your inquiry and will be in touch shortly.
              </p>
              <button 
                onClick={() => setIsSuccess(false)}
                className="text-[10px] font-bold tracking-[0.2em] uppercase border-b-2 border-accent pb-1"
              >
                Send another message
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-display mb-12">Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Your Name</label>
                    <input 
                      required
                      type="text" 
                      name="name"
                      value={formState.name}
                      onChange={handleChange}
                      placeholder="JOHN DOE"
                      className="w-full bg-white border-none rounded-2xl px-6 py-4 text-xs font-bold tracking-widest focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Email Address</label>
                    <input 
                      required
                      type="email" 
                      name="email"
                      value={formState.email}
                      onChange={handleChange}
                      placeholder="HELLO@EXAMPLE.COM"
                      className="w-full bg-white border-none rounded-2xl px-6 py-4 text-xs font-bold tracking-widest focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Subject</label>
                  <input 
                    required
                    type="text" 
                    name="subject"
                    value={formState.subject}
                    onChange={handleChange}
                    placeholder="HOW CAN WE HELP?"
                    className="w-full bg-white border-none rounded-2xl px-6 py-4 text-xs font-bold tracking-widest focus:ring-2 focus:ring-accent/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Message</label>
                  <textarea 
                    required
                    name="message"
                    rows={6}
                    value={formState.message}
                    onChange={handleChange}
                    placeholder="TELL US MORE..."
                    className="w-full bg-white border-none rounded-2xl px-6 py-4 text-xs font-bold tracking-widest focus:ring-2 focus:ring-accent/20 resize-none"
                  ></textarea>
                </div>

                <button 
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full bg-ink text-white py-6 rounded-2xl font-bold tracking-[0.2em] text-[10px] uppercase flex items-center justify-center gap-3 hover:bg-accent transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    'Sending...'
                  ) : (
                    <>
                      Send Message
                      <Send size={14} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
          
          {/* Background Decorative Element */}
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none"></div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;

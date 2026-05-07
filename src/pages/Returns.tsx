import React from 'react';
import { motion } from 'motion/react';
import { RefreshCcw, ShieldCheck, Clock, FileText, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

const Returns: React.FC = () => {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone rounded-full mb-6"
          >
            <RefreshCcw size={14} className="text-accent" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 italic">Policy Guidelines</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl font-display italic tracking-tight text-ink mb-8"
          >
            Return Policy<span className="text-accent">.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-lg max-w-2xl leading-relaxed"
          >
            We curate items of exceptional rarity and quality. Our return policy is designed to maintain the integrity of these collections while ensuring your complete satisfaction.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-10 rounded-[40px] border border-gray-50 shadow-sm"
          >
            <div className="w-12 h-12 bg-stone flex items-center justify-center rounded-2xl mb-6">
              <Clock size={20} className="text-ink" />
            </div>
            <h3 className="text-xl font-display italic mb-4">Inspection Period</h3>
            <p className="text-sm text-gray-500 leading-loose">
              Genzin provides a **7-day inspection period** from the date of delivery. During this time, you are encouraged to verify the item's condition and authenticity.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-10 rounded-[40px] border border-gray-50 shadow-sm"
          >
            <div className="w-12 h-12 bg-stone flex items-center justify-center rounded-2xl mb-6">
              <ShieldCheck size={20} className="text-ink" />
            </div>
            <h3 className="text-xl font-display italic mb-4">Eligibility Criteria</h3>
            <p className="text-sm text-gray-500 leading-loose">
              To be eligible for a return, items must be in their **original, untouched condition**. All security seals, tags, and digital authentication certificates must remain intact.
            </p>
          </motion.div>
        </div>

        <div className="space-y-16">
          <section>
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-accent italic">The Process</h2>
              <div className="h-[1px] flex-1 bg-stone"></div>
            </div>
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="w-10 h-10 rounded-full bg-ink text-white flex items-center justify-center text-[10px] font-black shrink-0">01</div>
                <div>
                  <h4 className="text-lg font-display italic mb-2">Initiate Request</h4>
                  <p className="text-sm text-gray-500 leading-loose">Contact our concierge team at <span className="text-ink font-bold">genzin.official@gmail.com</span> within the 7-day window to request a Return Merchandise Authorization (RMA).</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-10 h-10 rounded-full bg-ink text-white flex items-center justify-center text-[10px] font-black shrink-0">02</div>
                <div>
                  <h4 className="text-lg font-display italic mb-2">Secure Packaging</h4>
                  <p className="text-sm text-gray-500 leading-loose">Package the item in its original shipping container, including all documentation and specialized protective layers provided during the initial delivery.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-10 h-10 rounded-full bg-ink text-white flex items-center justify-center text-[10px] font-black shrink-0">03</div>
                <div>
                  <h4 className="text-lg font-display italic mb-2">Insured Transit</h4>
                  <p className="text-sm text-gray-500 leading-loose">We will provide a prepaid, fully insured shipping label. A courier will be scheduled for a private pickup from your registered address.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-stone/50 p-12 rounded-[48px] border border-stone">
            <div className="flex items-center gap-4 mb-6">
              <FileText size={20} className="text-accent" />
              <h3 className="text-xl font-display italic">Exclusions</h3>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Personalized or monogrammed items",
                "Items with broken security/authenticity seals",
                "Fragrances and apothecary products",
                "Editorial drops marked as Final Sale",
                "Items returned outside the 7-day window"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 p-12 bg-white rounded-[48px] border border-gray-100 text-center shadow-xl relative overflow-hidden"
        >
          <h3 className="text-3xl font-display italic mb-4">Request a Return</h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto mb-8 font-medium">Please include your order number and clear photographs of the item's current state and its security seals.</p>
          <a 
            href="mailto:genzin.official@gmail.com"
            className="inline-flex items-center gap-3 px-10 py-5 bg-ink text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-accent transition-all"
          >
            <Send size={14} />
            Email Concierge
          </a>
        </motion.div>

        <div className="mt-12 text-center">
          <Link to="/faq" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-accent transition-colors">
            Visit FAQ for more details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Returns;

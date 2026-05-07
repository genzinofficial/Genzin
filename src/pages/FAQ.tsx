import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, Search, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    category: "Curation & Products",
    questions: [
      {
        q: "How are products selected for Genzin?",
        a: "Every item in our collection undergoes a rigorous selection process focused on craftsmanship, historical significance, and contemporary relevance. We work directly with artisans and heritage brands to ensure every piece meets our standard of excellence."
      },
      {
        q: "Are the items authentic?",
        a: "Authenticity is the foundation of our platform. Every product is verified by our in-house experts and comes with a digital certificate of authenticity stored on our private ledger."
      },
      {
        q: "Do you offer limited edition collections?",
        a: "Yes, many of our offerings are part of exclusive 'Editorial Drops' that are produced in limited quantities and never restocked to maintain rarity."
      }
    ]
  },
  {
    category: "Shipping & Delivery",
    questions: [
      {
        q: "How long does shipping take?",
        a: "Standard curation delivery typically takes 3-7 business days. Express logistics are available for select metropolitan areas, delivering within 48 hours for verified elite members."
      },
      {
        q: "What is 'Complementary Delivery'?",
        a: "We believe the logistics of luxury should be seamless. We provide free worldwide shipping on all orders, fully insured and tracked from our vault to your door."
      }
    ]
  },
  {
    category: "Returns & Exchanges",
    questions: [
      {
        q: "What is your return policy?",
        a: "Due to the curated nature of our items, we offer a 7-day inspection period. Items must be returned in their original, untouched condition with all security seals intact."
      },
      {
        q: "How do I initiate a return?",
        a: "You can initiate a return through your Profile dashboard under 'Order History', or contact our concierge directly at genzin.official@gmail.com."
      }
    ]
  }
];

const FAQItem: React.FC<{ q: string; a: string; index: number }> = ({ q, a, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="border-b border-gray-100 last:border-0"
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-8 flex items-center justify-between text-left group"
      >
        <span className={`text-xl font-display italic transition-colors ${isOpen ? 'text-accent' : 'text-ink group-hover:text-accent'}`}>
          {q}
        </span>
        <div className={`w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center transition-all ${isOpen ? 'bg-ink text-white' : 'group-hover:border-accent group-hover:text-accent'}`}>
          {isOpen ? <Minus size={14} /> : <Plus size={14} />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pb-8 text-sm text-gray-500 leading-loose max-w-2xl">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FAQ: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = FAQS.map(cat => ({
    ...cat,
    questions: cat.questions.filter(
      q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
           q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.questions.length > 0);

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone rounded-full mb-6"
          >
            <HelpCircle size={14} className="text-accent" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 italic">Support Center</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl font-display italic tracking-tight text-ink mb-8"
          >
            Frequently Asked<br />Questions<span className="text-accent">.</span>
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative max-w-xl mx-auto"
          >
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input 
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone border-none rounded-[32px] py-6 pl-16 pr-8 text-sm font-bold focus:ring-2 focus:ring-accent/20 outline-none"
            />
          </motion.div>
        </header>

        <div className="space-y-20">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((category, catIndex) => (
              <div key={category.category}>
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-accent italic">{category.category}</h2>
                  <div className="h-[1px] flex-1 bg-stone"></div>
                </div>
                <div className="bg-white px-10 rounded-[40px] border border-gray-50 shadow-sm">
                  {category.questions.map((faq, i) => (
                    <FAQItem key={i} q={faq.q} a={faq.a} index={catIndex * 10 + i} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-stone rounded-[40px] border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-display italic">No answers found for "{searchQuery}"</p>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-4 text-[10px] font-black uppercase tracking-widest text-accent hover:border-b border-accent"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-32 p-12 bg-ink rounded-[48px] text-center text-white relative overflow-hidden"
        >
          <div className="relative z-10">
            <h3 className="text-3xl font-display italic mb-4">Still have questions?</h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto mb-8 font-medium">Our concierge team is available 24/7 to assist with your inquiries and collection management.</p>
            <a 
              href="/contact"
              className="inline-block px-10 py-5 bg-white text-ink rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-accent hover:text-white transition-all"
            >
              Contact Concierge
            </a>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        </motion.div>
      </div>
    </div>
  );
};

export default FAQ;

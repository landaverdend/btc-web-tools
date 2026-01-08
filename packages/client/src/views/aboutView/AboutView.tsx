import { Link } from 'react-router-dom';
import bitcoinStandard from '@assets/bookRecs/bitcoinStandard.webp';
import brokenMoney from '@assets/bookRecs/brokenMoney.webp';
import historyOfMoneyAndBanking from '@assets/bookRecs/historyOfMoneyAndBanking.webp';

const tools = [
  {
    name: 'Script Debugger',
    description: 'Step through Bitcoin scripts instruction by instruction. Visualize the stack as opcodes execute.',
    path: '/script',
  },
  {
    name: 'Tx Viewer',
    description: 'Fetch and inspect real Bitcoin transactions. View inputs, outputs, and script details.',
    path: '/txview',
  },
  {
    name: 'Merkle Tree',
    description: 'Interactive visualization of how Merkle trees work. Edit leaves and watch the root hash update.',
    path: '/merkle',
  },
];

const books = [
  {
    title: 'The Bitcoin Standard',
    author: 'Saifedean Ammous',
    image: bitcoinStandard,
  },
  {
    title: 'Broken Money',
    author: 'Lyn Alden',
    image: brokenMoney,
  },
  {
    title: 'A History of Money and Banking',
    author: 'Murray Rothbard',
    image: historyOfMoneyAndBanking,
  },
];

export default function AboutView() {
  return (
    <div className="min-h-screen bg-(--background-slate) text-white">
      {/* Hero Section */}
      <div className="flex flex-col items-center gap-6 px-6 py-12 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#f7931a]" />
          <h1 className="text-2xl font-semibold">Bitcoin Tools</h1>
        </div>
        <p className="text-gray-400 text-center max-w-2xl leading-relaxed">
          A collection of interactive tools and visualizations for learning about the Bitcoin protocol
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-12">
        {/* About Section */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="text-[#f7931a]">#</span> About
          </h2>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
            <p className="text-gray-300 leading-relaxed">
              This is a collection of tools and visual aids I've built while learning about Bitcoin. The goal is to make the
              protocol's internals more accessible through interactive exploration. Perhaps one day this will grow into a
              comprehensive educational resource.
            </p>
          </div>
        </section>

        {/* Tools Section */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="text-[#f7931a]">#</span> Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {tools.map((tool) => (
              <Link
                key={tool.path}
                to={tool.path}
                className="group bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 hover:border-[#f7931a]/30 transition-all duration-200"
              >
                <h3 className="text-white font-medium text-sm group-hover:text-[#f7931a] transition-colors">
                  {tool.name}
                </h3>
                <p className="text-gray-500 text-xs mt-2 leading-relaxed">
                  {tool.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Book Recommendations */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="text-[#f7931a]">#</span> Recommended Reading
          </h2>
          <p className="text-gray-400 text-sm">For understanding Bitcoin from an economic and historical perspective:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map((book) => (
              <div
                key={book.title}
                className="group bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden hover:border-[#3a3a3a] transition-all duration-200">
                <div className="aspect-[2/3] overflow-hidden bg-[#111]">
                  <img
                    src={book.image}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-white font-medium text-sm">{book.title}</h3>
                  <p className="text-gray-500 text-xs mt-1">{book.author}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="flex flex-col items-center gap-2 pt-8 border-t border-[#2a2a2a]">
          <p className="text-gray-500 text-sm">Built with React, TypeScript, and Tailwind CSS</p>
        </footer>
      </div>
    </div>
  );
}

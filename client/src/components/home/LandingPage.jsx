import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiUsers, 
  FiPenTool, 
  FiMessageCircle, 
  FiDownload, 
  FiUpload, 
  FiLock,
  FiVideo,
  FiImage,
  FiSmile,
  FiShield,
  FiClock,
  FiGlobe
} from 'react-icons/fi';
import CreateRoomCard from './CreateRoomCard';
import JoinRoomCard from './JoinRoomCard';

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 animate-fade-in">
              Welcome to <span className="text-yellow-300">ThinkCanvas</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              The ultimate real-time collaborative whiteboard for teams, educators, and creators.
              Draw, chat, and collaborate seamlessly from anywhere in the world.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#create-room" className="bg-white text-gray-900 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition transform hover:scale-105">
                Get Started Free
              </a>
              <a href="#features" className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-gray-900 transition">
                Learn More
              </a>
            </div>
          </div>
        </div>
        
        {/* Wave SVG */}
        <div className="absolute bottom-0 w-full">
          <svg viewBox="0 0 1440 120" fill="currentColor" className="text-gray-50 dark:text-gray-900">
            <path d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,48C960,53,1056,75,1152,80C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </div>

      {/* Main Action Cards */}
      <div id="create-room" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          <CreateRoomCard />
          <JoinRoomCard />
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features for Seamless Collaboration
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Everything you need to conduct productive meetings, teach classes, or brainstorm ideas
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FiUsers className="w-8 h-8 text-blue-600" />}
              title="Real-time Collaboration"
              description="Work together with your team in real-time. See changes, drawings, and annotations as they happen."
            />
            <FeatureCard
              icon={<FiPenTool className="w-8 h-8 text-purple-600" />}
              title="Advanced Drawing Tools"
              description="Pencil, eraser, shapes, text, colors, and brush sizes. Everything you need for creative sessions."
            />
            <FeatureCard
              icon={<FiMessageCircle className="w-8 h-8 text-green-600" />}
              title="Integrated Chat"
              description="Discuss ideas with built-in real-time chat. Share images, files, and emojis seamlessly."
            />
            <FeatureCard
              icon={<FiDownload className="w-8 h-8 text-orange-600" />}
              title="Download Notes"
              description="Save your whiteboard sessions as images or PDFs. Perfect for sharing meeting notes."
            />
            <FeatureCard
              icon={<FiUpload className="w-8 h-8 text-indigo-600" />}
              title="Upload Previous Notes"
              description="Import previous whiteboard sessions and continue where you left off."
            />
            <FeatureCard
              icon={<FiLock className="w-8 h-8 text-red-600" />}
              title="Room Control"
              description="Lock/unlock rooms, manage participants, and control who can draw or chat."
            />
            <FeatureCard
              icon={<FiVideo className="w-8 h-8 text-pink-600" />}
              title="Screen Sharing"
              description="Share your screen with participants for better presentations and explanations."
            />
            <FeatureCard
              icon={<FiImage className="w-8 h-8 text-teal-600" />}
              title="Image Support"
              description="Upload and insert images directly onto the whiteboard. Drag, resize, and arrange."
            />
            <FeatureCard
              icon={<FiShield className="w-8 h-8 text-cyan-600" />}
              title="Secure & Private"
              description="End-to-end encryption for all communications. Your data is safe with us."
            />
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold">10K+</div>
              <div className="text-lg opacity-90">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold">50K+</div>
              <div className="text-lg opacity-90">Rooms Created</div>
            </div>
            <div>
              <div className="text-4xl font-bold">100+</div>
              <div className="text-lg opacity-90">Countries</div>
            </div>
            <div>
              <div className="text-4xl font-bold">99.9%</div>
              <div className="text-lg opacity-90">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white dark:bg-gray-800 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to start collaborating?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Join thousands of teams who use ThinkCanvas for their collaborative needs
          </p>
          <Link
            to="/login"
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition transform hover:scale-105"
          >
            Get Started Now - It's Free
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                ThinkCanvas
              </h3>
              <p className="text-gray-400">
                Revolutionizing collaborative whiteboarding for teams worldwide.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
                <li><a href="#" className="hover:text-white transition">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white transition">GDPR</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} ThinkCanvas. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400">{description}</p>
  </div>
);

export default LandingPage;
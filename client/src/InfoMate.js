import React, { useState, useEffect, useRef } from 'react';
import { sendChatMessage } from './services/chatService';
import ChatInterface from './components/ChatInterface';
import { 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  Bot, 
  User, 
  Plus, 
  Menu,
  MessageSquare,
  BookOpen,
  Users,
  Calendar,
  Building,
  Sparkles,
  Copy,
  ThumbsUp,
  ThumbsDown,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Clock,
  GraduationCap,
  BookOpenCheck,
  ChevronRight
} from 'lucide-react';

// Speech Service Class
class SpeechService {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
  }

  initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
    }
    return this.recognition !== null;
  }

  startListening(onResult, onError) {
    if (this.recognition && !this.isListening) {
      this.isListening = true;
      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
        this.isListening = false;
      };
      
      this.recognition.onerror = (event) => {
        onError(event.error);
        this.isListening = false;
      };
      
      this.recognition.start();
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  speak(text) {
    if (this.synthesis) {
      this.synthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      this.synthesis.speak(utterance);
    }
  }
}

const speechService = new SpeechService();

// API Service for fetching dynamic data
const apiService = {
  async fetchFaculty() {
    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/faculty');
      return await response.json();
    } catch (error) {
      console.error('Error fetching faculty:', error);
      return [];
    }
  },

  async fetchCourses() {
    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/courses');
      return await response.json();
    } catch (error) {
      console.error('Error fetching courses:', error);
      return [];
    }
  },

  async fetchSemesters(courseId) {
    try {
      // Replace with your actual API endpoint
      const response = await fetch(`/api/courses/${courseId}/semesters`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching semesters:', error);
      return [];
    }
  },

  async fetchSubjects(courseId, semesterId) {
    try {
      // Replace with your actual API endpoint
      const response = await fetch(`/api/courses/${courseId}/semesters/${semesterId}/subjects`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching subjects:', error);
      return [];
    }
  }
};

// Faculty Card Component
const FacultyCard = ({ faculty }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
    <div className="flex items-start space-x-4">
      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
        {faculty.name?.charAt(0) || 'F'}
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-semibold text-gray-800">{faculty.name}</h3>
        <p className="text-blue-600 font-medium">{faculty.designation}</p>
        <p className="text-gray-600 mt-1">{faculty.specialization}</p>
        
        <div className="mt-4 space-y-2">
          {faculty.email && (
            <div className="flex items-center space-x-2 text-gray-600">
              <Mail size={16} />
              <span className="text-sm">{faculty.email}</span>
            </div>
          )}
          {faculty.phone && (
            <div className="flex items-center space-x-2 text-gray-600">
              <Phone size={16} />
              <span className="text-sm">{faculty.phone}</span>
            </div>
          )}
          {faculty.experience && (
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock size={16} />
              <span className="text-sm">{faculty.experience}</span>
            </div>
          )}
          {faculty.office && (
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin size={16} />
              <span className="text-sm">{faculty.office}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

// Faculty View Component
const FacultyView = ({ onBack }) => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFaculty = async () => {
      setLoading(true);
      const data = await apiService.fetchFaculty();
      setFaculty(data);
      setLoading(false);
    };
    loadFaculty();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Faculty Members</h1>
            <p className="text-gray-600">ICT Department Faculty Information</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faculty.map((member, index) => (
              <FacultyCard key={member.id || index} faculty={member} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Course Card Component
const CourseCard = ({ course, onClick }) => (
  <div 
    onClick={() => onClick(course)}
    className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <h3 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
          {course.name}
        </h3>
        <p className="text-gray-600 mt-1">{course.type}</p>
        <div className="mt-4 space-y-2">
          {course.duration && (
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock size={16} />
              <span className="text-sm">{course.duration}</span>
            </div>
          )}
          {course.intake && (
            <div className="flex items-center space-x-2 text-gray-600">
              <Users size={16} />
              <span className="text-sm">{course.intake}</span>
            </div>
          )}
        </div>
      </div>
      <ChevronRight size={20} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
    </div>
  </div>
);

// Semester View Component
const SemesterView = ({ course, onBack, onSemesterClick }) => {
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSemesters = async () => {
      setLoading(true);
      const data = await apiService.fetchSemesters(course.id);
      setSemesters(data);
      setLoading(false);
    };
    loadSemesters();
  }, [course.id]);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{course.name}</h1>
            <p className="text-gray-600">Select Semester</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
                <div className="h-6 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {semesters.map((semester) => (
              <div
                key={semester.id}
                onClick={() => onSemesterClick(semester)}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
              >
                <div className="text-center">
                  <GraduationCap size={32} className="mx-auto text-blue-500 mb-2" />
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {semester.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {semester.subjectCount || 0} subjects
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Subject View Component
const SubjectView = ({ course, semester, onBack }) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubjects = async () => {
      setLoading(true);
      const data = await apiService.fetchSubjects(course.id, semester.id);
      setSubjects(data);
      setLoading(false);
    };
    loadSubjects();
  }, [course.id, semester.id]);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{semester.name}</h1>
            <p className="text-gray-600">{course.name} - Subjects</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subjects.map((subject) => (
              <div key={subject.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <BookOpenCheck size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">{subject.name}</h3>
                    {subject.code && (
                      <p className="text-blue-600 font-medium text-sm">{subject.code}</p>
                    )}
                    {subject.credits && (
                      <p className="text-gray-600 text-sm mt-1">{subject.credits} Credits</p>
                    )}
                    {subject.type && (
                      <p className="text-gray-600 text-sm">{subject.type}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Courses View Component
const CoursesView = ({ onBack }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      const data = await apiService.fetchCourses();
      setCourses(data);
      setLoading(false);
    };
    loadCourses();
  }, []);

  if (selectedSemester) {
    return (
      <SubjectView 
        course={selectedCourse}
        semester={selectedSemester}
        onBack={() => setSelectedSemester(null)}
      />
    );
  }

  if (selectedCourse) {
    return (
      <SemesterView 
        course={selectedCourse}
        onBack={() => setSelectedCourse(null)}
        onSemesterClick={setSelectedSemester}
      />
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Courses</h1>
            <p className="text-gray-600">ICT Department Courses</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course) => (
              <CourseCard 
                key={course.id} 
                course={course} 
                onClick={setSelectedCourse}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Sidebar Component
const Sidebar = ({ isOpen, onToggle, chatHistory, onNewChat, onSelectChat, onQuickAction }) => {
  const sidebarItems = [
    { icon: Users, label: "Faculty Info", category: "faculty" },
    { icon: BookOpen, label: "Courses", category: "courses" }
  ];

  const handleQuickActionClick = (category) => {
    onQuickAction(category);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 w-80 bg-gray-950 text-white transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${!isOpen ? 'lg:w-16' : 'lg:w-80'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div className={`flex items-center space-x-3 ${!isOpen && 'lg:justify-center'}`}>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles size={18} />
                </div>
                {(isOpen) && (
                  <div>
                    <h1 className="text-lg font-bold">InfoMate</h1>
                    <p className="text-xs text-gray-400">ICT Assistant</p>
                  </div>
                )}
              </div>
              <button
                onClick={onToggle}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors lg:hidden"
              >
                <Menu size={18} />
              </button>
            </div>
          </div>

          {/* New Chat Button */}
          <div className="p-4">
            <button
              onClick={onNewChat}
              className={`
                w-full flex items-center space-x-3 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all duration-200
                ${!isOpen ? 'lg:justify-center lg:px-2' : ''}
              `}
            >
              <Plus size={18} />
              {(isOpen) && <span>New Chat</span>}
            </button>
          </div>

          {/* Quick Actions */}
          {(isOpen) && (
            <div className="px-4 pb-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Quick Actions</h3>
              <div className="space-y-1">
                {sidebarItems.map((item) => (
                  <button
                    key={item.category}
                    onClick={() => handleQuickActionClick(item.category)}
                    className="w-full flex items-center space-x-3 p-2 hover:bg-gray-800 rounded-lg transition-colors text-left"
                  >
                    <item.icon size={16} className="text-gray-400" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto px-4">
            {(isOpen) && chatHistory.length > 0 && (
              <>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Recent Chats</h3>
                <div className="space-y-1">
                  {chatHistory.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => onSelectChat(chat)}
                      className="w-full text-left p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <div className="text-sm text-white truncate">{chat.title}</div>
                      <div className="text-xs text-gray-400">{chat.date}</div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// Enhanced Message Bubble Component
const MessageBubble = ({ message, onCopy, onFeedback }) => {
  const [showActions, setShowActions] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.text);
    onCopy?.();
  };

  return (
    <div 
      className={`group flex gap-4 px-4 py-6 ${message.sender === 'bot' ? 'bg-gray-50' : 'bg-white'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        message.sender === 'user' 
          ? 'bg-blue-500 text-white' 
          : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
      }`}>
        {message.sender === 'user' ? <User size={16} /> : <Sparkles size={16} />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="font-semibold text-sm text-gray-800 mb-1">
            {message.sender === 'user' ? 'You' : 'InfoMate'}
          </div>
          <div className="text-xs text-gray-500">
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
        
        <div className="prose prose-sm max-w-none">
          <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {message.text}
          </div>
        </div>

        {/* Action buttons */}
        {message.sender === 'bot' && (showActions || window.innerWidth < 768) && (
          <div className="flex items-center space-x-2 mt-3 pt-2">
            <button
              onClick={copyToClipboard}
              className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            >
              <Copy size={14} />
              <span>Copy</span>
            </button>
            <button
              onClick={() => onFeedback?.('like')}
              className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
            >
              <ThumbsUp size={14} />
            </button>
            <button
              onClick={() => onFeedback?.('dislike')}
              className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            >
              <ThumbsDown size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Main InfoMate Component
const InfoMate = () => {
  // Initialize messages from sessionStorage or default welcome message
  const initializeMessages = () => {
    const savedMessages = sessionStorage.getItem('infomate_messages');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        // Convert timestamp strings back to Date objects
        return parsedMessages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      } catch (error) {
        console.error('Error parsing saved messages:', error);
        return [];
      }
    }
    return [];
  };

  const [messages, setMessages] = useState(initializeMessages);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatHistory] = useState([]);
  const [currentView, setCurrentView] = useState('chat'); // 'chat', 'faculty', 'courses'
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Only show welcome message if there are no saved messages
    if (messages.length === 0) {
      const isSupported = speechService.initializeSpeechRecognition();
      
      const welcomeMessage = {
        id: 1,
        text: `👋 Hello! I'm InfoMate, your intelligent ICT Department assistant at Marwadi University.\n\nI can help you with:\n• 👨‍🏫 Faculty information and contact details\n• 📚 Course details and curriculum\n• 🎓 Admission procedures\n\n${!isSupported ? '⚠️ Note: Speech recognition is not supported in your browser.' : '🎤 You can type or speak to me!'}\n\nHow can I assist you today?`,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages([welcomeMessage]);
      
      setTimeout(() => {
        speechService.speak("Hello! I'm InfoMate, your ICT Department assistant. How can I help you today?");
      }, 1000);
    } else {
      // Initialize speech service even if we have saved messages
      speechService.initializeSpeechRecognition();
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Save messages to sessionStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem('infomate_messages', JSON.stringify(messages));
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleQuickAction = (category) => {
    if (category === 'faculty') {
      setCurrentView('faculty');
    } else if (category === 'courses') {
      setCurrentView('courses');
    }
  };

  const handleBackToChat = () => {
    setCurrentView('chat');
  };

  const handleSpeechStart = () => {
    setIsListening(true);
    speechService.startListening(
      (transcript) => {
        setInputText(transcript);
        setIsListening(false);
        handleSendMessage(transcript);
      },
      (error) => {
        console.error('Speech recognition error:', error);
        setIsListening(false);
        alert('Speech recognition failed. Please try again or type your message.');
      }
    );
  };

  const handleSpeechStop = () => {
    speechService.stopListening();
    setIsListening(false);
  };

  const handleSendMessage = async (messageText = inputText) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Prepare minimal chat history for better context
      const history = messages.slice(-6).map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        content: m.text,
      }));

      const { answer } = await sendChatMessage(messageText, history);

      const botMessage = {
        id: Date.now() + 1,
        text: answer,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);

      setIsSpeaking(true);
      const cleanResponse = (answer || '').replace(/[*#•]/g, '').replace(/\n/g, ' ');
      if (cleanResponse) speechService.speak(cleanResponse);
      setTimeout(() => setIsSpeaking(false), Math.min(15000, cleanResponse.length * 50));
    } catch (err) {
      console.error('Chat error:', err);
      setIsLoading(false);
      const botMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I ran into a problem answering that. Please try again shortly.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewChat = () => {
    // Clear messages from both state and sessionStorage only when explicitly requested
    sessionStorage.removeItem('infomate_messages');
    setCurrentView('chat');
    
    const welcomeMessage = {
      id: Date.now(),
      text: `👋 New chat started! I'm InfoMate, ready to help you with ICT Department information.\n\nWhat would you like to know about?`,
      sender: 'bot',
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
  };

  // Render different views based on currentView state
  const renderMainContent = () => {
    switch (currentView) {
      case 'faculty':
        return <FacultyView onBack={handleBackToChat} />;
      case 'courses':
        return <CoursesView onBack={handleBackToChat} />;
      default:
        return (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
                >
                  <Menu size={20} />
                </button>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Sparkles size={16} className="text-white" />
                  </div>
                  <div>
                    <h1 className="font-semibold text-gray-800">InfoMate</h1>
                    <p className="text-xs text-gray-500">ICT Department Assistant</p>
                  </div>
                </div>
              </div>
              
              {isSpeaking && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 text-green-700 rounded-full">
                  <Volume2 size={16} className="animate-pulse" />
                  <span className="text-sm font-medium">Speaking...</span>
                </div>
              )}
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto">
              {messages.map((message) => (
                <MessageBubble 
                  key={message.id} 
                  message={message}
                  onCopy={() => console.log('Copied!')}
                  onFeedback={(type) => console.log('Feedback:', type)}
                />
              ))}
              
              {isLoading && (
                <div className="flex gap-4 px-4 py-6 bg-gray-50">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <Sparkles size={16} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-gray-800 mb-2">InfoMate</div>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-sm text-gray-500">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 bg-white p-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-end space-x-3">
                  <div className="flex-1 relative">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Message InfoMate..."
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32"
                      rows={1}
                      disabled={isLoading}
                      style={{ minHeight: '52px' }}
                    />
                    <button
                      onClick={isListening ? handleSpeechStop : handleSpeechStart}
                      className={`absolute right-3 top-3 p-2 rounded-lg transition-all duration-200 ${
                        isListening 
                          ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      disabled={isLoading}
                      title={isListening ? 'Stop listening' : 'Start voice input'}
                    >
                      {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>
                  </div>
                  
                  <button
                    onClick={() => handleSendMessage()}
                    className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!inputText.trim() || isLoading}
                    title="Send message"
                  >
                    <Send size={20} />
                  </button>
                </div>
                
                <div className="mt-2 text-center">
                  <p className="text-xs text-gray-500">
                    InfoMate can make mistakes. Consider checking important information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-white">
      
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        chatHistory={chatHistory}
        onNewChat={handleNewChat}
        onSelectChat={() => {}}
        onQuickAction={handleQuickAction}
      />

      {/* Main Content */}
      {renderMainContent()}
    </div>
  );
};

export default InfoMate;
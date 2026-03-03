/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Video, 
  FileText, 
  ShoppingBag, 
  Menu, 
  X, 
  ChevronRight, 
  Download, 
  Search, 
  Filter, 
  Play, 
  ArrowLeft,
  GraduationCap,
  BookMarked,
  Clock,
  Share2,
  Plus,
  Users,
  Send,
  Paperclip,
  MessageSquare,
  CheckCircle2,
  Cpu,
  Globe,
  Settings,
  Construction,
  Zap,
  CircuitBoard,
  Brain,
  Layers,
  Sparkles,
  Bot,
  Wand2,
  Camera,
  Image as ImageIcon,
  Loader2,
  BrainCircuit
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { Branch, Semester, View, StudyMaterial, VideoLecture, PYQ, ChatGroup, Message, AIChatMessage } from './types';

// Mock Data
const STUDY_MATERIALS: StudyMaterial[] = [
  // Common First Year
  { id: 'c1', title: 'Engineering Mathematics I', unit: 'Unit 1: Calculus', subject: 'Mathematics', branch: 'Common', isFirstYear: true },
  { id: 'c2', title: 'Engineering Physics', unit: 'Unit 2: Wave Optics', subject: 'Physics', branch: 'Common', isFirstYear: true },
  { id: 'c3', title: 'Basic Electrical Engineering', unit: 'Unit 1: DC Circuits', subject: 'Electrical', branch: 'Common', isFirstYear: true },
  
  // CS/IT Silo
  { id: 'cs1', title: 'Data Structures', unit: 'Unit 1: Introduction', subject: 'Computer Science', branch: 'Computer Science' },
  { id: 'cs2', title: 'Operating Systems', unit: 'Unit 3: Memory Management', subject: 'Computer Science', branch: 'Computer Science' },
  { id: 'it1', title: 'Web Technologies', unit: 'Unit 2: React Basics', subject: 'Information Technology', branch: 'Information Technology' },
  
  // Mechanical Silo
  { id: 'me1', title: 'Thermodynamics', unit: 'Unit 1: Basic Concepts', subject: 'Mechanical Engineering', branch: 'Mechanical' },
  { id: 'me2', title: 'Fluid Mechanics', unit: 'Unit 2: Fluid Statics', subject: 'Mechanical Engineering', branch: 'Mechanical' },
  
  // Civil Silo
  { id: 'ce1', title: 'Strength of Materials', unit: 'Unit 3: Bending Stresses', subject: 'Civil Engineering', branch: 'Civil' },
  { id: 'ce2', title: 'Structural Analysis', unit: 'Unit 1: Determinacy', subject: 'Civil Engineering', branch: 'Civil' },
  
  // AI/ML Silo
  { id: 'ai1', title: 'Machine Learning', unit: 'Unit 1: Linear Regression', subject: 'AI & ML', branch: 'AI & ML' },
];

const VIDEO_LECTURES: VideoLecture[] = [
  { id: '1', title: 'Introduction to Heat Transfer', duration: '15:20', thumbnail: 'https://picsum.photos/seed/edu1/400/225' },
  { id: '2', title: 'Laws of Thermodynamics', duration: '22:45', thumbnail: 'https://picsum.photos/seed/edu2/400/225' },
  { id: '3', title: 'Entropy and Second Law', duration: '18:10', thumbnail: 'https://picsum.photos/seed/edu3/400/225' },
  { id: '4', title: 'Power Cycles Explained', duration: '30:05', thumbnail: 'https://picsum.photos/seed/edu4/400/225' },
];

const PYQS: PYQ[] = [
  { id: '1', year: 2024, subject: 'Mathematics III', branch: 'Mechanical' },
  { id: '2', year: 2023, subject: 'Operating Systems', branch: 'Computer Science' },
  { id: '3', year: 2022, subject: 'Surveying', branch: 'Civil' },
  { id: '4', year: 2021, subject: 'Digital Electronics', branch: 'Electrical' },
  { id: '5', year: 2024, subject: 'Machine Design', branch: 'Mechanical' },
];

const CHAT_GROUPS: ChatGroup[] = [
  { id: '1', name: 'CS Warriors', branch: 'Computer Science', memberCount: '1.2k', lastMessage: 'Anyone has Unit 3 notes?' },
  { id: '2', name: 'Mechanical Hub', branch: 'Mechanical', memberCount: '850', lastMessage: 'The PYQ for 2024 is out!' },
  { id: '3', name: 'Civil Masters', branch: 'Civil', memberCount: '600', lastMessage: 'Check the new surveying video.' },
  { id: '4', name: 'Electrical Power', branch: 'Electrical', memberCount: '450', lastMessage: 'Digital Electronics is tough.' },
];

const MOCK_MESSAGES: Message[] = [
  { id: '1', text: 'Hello everyone! Welcome to CS Warriors.', sender: 'other', senderName: 'Admin', timestamp: '10:00 AM' },
  { id: '2', text: 'Does anyone have the OS Unit 2 notes?', sender: 'other', senderName: 'Rahul', timestamp: '10:05 AM' },
  { id: '3', text: 'Yes, I just uploaded them to the Study Material section.', sender: 'me', timestamp: '10:10 AM' },
  { id: '4', text: 'Thanks! That helps a lot.', sender: 'other', senderName: 'Rahul', timestamp: '10:12 AM' },
];

export default function App() {
  const [hasSelectedBranch, setHasSelectedBranch] = useState(false);
  const [currentView, setCurrentView] = useState<View>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch>('Computer Science');
  const [selectedSemester, setSelectedSemester] = useState<Semester>('5th');
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState<number | 'All'>('All');
  const [activeVideo, setActiveVideo] = useState<VideoLecture | null>(null);
  const [activeMaterial, setActiveMaterial] = useState<StudyMaterial | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [activeGroup, setActiveGroup] = useState<ChatGroup | null>(null);
  const [chatMessage, setChatMessage] = useState('');

  // AI State
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<AIChatMessage[]>([
    { id: '1', role: 'model', text: 'Hello! I am HK-AI, your engineering study assistant. How can I help you today?' }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiImage, setAiImage] = useState<string | null>(null);

  const branches: { name: Branch; icon: any; color: string }[] = [
    { name: 'Computer Science', icon: Cpu, color: 'bg-blue-500' },
    { name: 'Information Technology', icon: Globe, color: 'bg-indigo-500' },
    { name: 'Mechanical', icon: Settings, color: 'bg-orange-500' },
    { name: 'Civil', icon: Construction, color: 'bg-amber-500' },
    { name: 'Electrical', icon: Zap, color: 'bg-yellow-500' },
    { name: 'Electronics', icon: CircuitBoard, color: 'bg-red-500' },
    { name: 'AI & ML', icon: Brain, color: 'bg-purple-500' },
  ];
  const semesters: Semester[] = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

  const filteredPYQs = useMemo(() => {
    return PYQS.filter(pyq => {
      const matchesSearch = pyq.subject.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesYear = yearFilter === 'All' || pyq.year === yearFilter;
      return matchesSearch && matchesYear;
    });
  }, [searchQuery, yearFilter]);

  const navigateTo = (view: View) => {
    setCurrentView(view);
    setIsSidebarOpen(false);
  };

  const handleAISend = async (text: string, image?: string) => {
    if (!text.trim() && !image) return;

    const newUserMsg: AIChatMessage = { id: Date.now().toString(), role: 'user', text, image };
    setAiMessages(prev => [...prev, newUserMsg]);
    setAiInput('');
    setAiImage(null);
    setIsAILoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-3-flash-preview";
      
      let contents;
      if (image) {
        const base64Data = image.split(',')[1];
        contents = {
          parts: [
            { text: `You are an expert engineering assistant. Solve this problem step-by-step: ${text}` },
            { inlineData: { data: base64Data, mimeType: "image/jpeg" } }
          ]
        };
      } else {
        contents = `You are an expert engineering assistant. Answer this student's question: ${text}`;
      }

      const response = await ai.models.generateContent({
        model,
        contents,
      });

      const aiResponse: AIChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text || "I'm sorry, I couldn't process that request."
      };
      setAiMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error("AI Error:", error);
      setAiMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "Sorry, I'm having trouble connecting to my brain right now. Please try again later."
      }]);
    } finally {
      setIsAILoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAiImage(reader.result as string);
        setIsAIChatOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderHeader = (title: string, showBack = true) => (
    <header className="sticky top-0 z-30 bg-navy text-white px-4 py-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3">
        {showBack ? (
          <button onClick={() => navigateTo('home')} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
        ) : (
          <button onClick={() => setIsSidebarOpen(true)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <Menu size={24} />
          </button>
        )}
        <h1 className="text-xl font-bold tracking-tight truncate max-w-[200px]">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <GraduationCap size={18} />
        </div>
      </div>
    </header>
  );

  const BranchPickerView = () => (
    <div className="min-h-screen bg-navy p-6 flex flex-col">
      <div className="text-center mb-8 pt-8">
        <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-white/20">
          <GraduationCap size={40} className="text-white" />
        </div>
        <h2 className="text-3xl font-black text-white mb-2">Select Your Branch</h2>
        <p className="text-white/60 text-sm">Personalize your study experience.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1">
        {branches.map((branch) => (
          <motion.button
            key={branch.name}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSelectedBranch(branch.name);
              setHasSelectedBranch(true);
            }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:bg-white/10 transition-all"
          >
            <div className={`w-12 h-12 rounded-xl ${branch.color} flex items-center justify-center shadow-lg`}>
              <branch.icon size={24} className="text-white" />
            </div>
            <span className="text-white text-xs font-bold text-center leading-tight">{branch.name}</span>
          </motion.button>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-white/40 text-[10px] uppercase tracking-widest">HK Publication • Engineering Excellence</p>
      </div>
    </div>
  );

  const HomeView = () => (
    <div className="p-4 space-y-6 relative min-h-full">
      <div className="bg-navy rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-1">Welcome, Engineer!</h2>
          <p className="text-white/70 text-sm mb-4">Your complete study companion for {selectedBranch} Engineering.</p>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">{selectedBranch}</span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">Sem {selectedSemester}</span>
          </div>
        </div>
        <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { id: 'study-material', title: 'Study Material', icon: BookOpen, color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
          { id: 'video-academy', title: 'Video Academy', icon: Video, color: 'bg-red-50 text-red-600', border: 'border-red-100' },
          { id: 'pyq-hub', title: 'PYQ Hub', icon: FileText, color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
          { id: 'book-store', title: 'Book Store', icon: ShoppingBag, color: 'bg-amber-50 text-amber-600', border: 'border-amber-100' },
        ].map((item) => (
          <motion.button
            key={item.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigateTo(item.id as View)}
            className={`flex flex-col items-center justify-center p-6 rounded-2xl border ${item.border} ${item.color} shadow-sm transition-all`}
          >
            <item.icon size={32} className="mb-3" />
            <span className="font-semibold text-sm text-slate-800">{item.title}</span>
          </motion.button>
        ))}
      </div>

      {/* Common First Year Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-navy" />
            <h3 className="font-bold text-slate-800">Common First Year</h3>
          </div>
          <button className="text-navy text-xs font-semibold">View All</button>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {STUDY_MATERIALS.filter(m => m.isFirstYear).map((material) => (
            <div 
              key={material.id} 
              className="flex items-center gap-4 p-3 bg-white rounded-xl border border-slate-100 shadow-sm cursor-pointer"
              onClick={() => {
                setActiveMaterial(material);
                navigateTo('pdf-viewer');
              }}
            >
              <div className="w-10 h-10 rounded-lg bg-slate-50 text-navy flex items-center justify-center">
                <BookMarked size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-slate-800">{material.title}</h4>
                <p className="text-[10px] text-slate-500">Universal Subject • All Branches</p>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </div>
          ))}
        </div>
      </div>

      {/* Branch Specific Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-indigo-600" />
            <h3 className="font-bold text-slate-800">{selectedBranch} Specials</h3>
          </div>
          <button className="text-navy text-xs font-semibold">View All</button>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {STUDY_MATERIALS.filter(m => m.branch === selectedBranch).map((material) => (
            <div 
              key={material.id} 
              className="flex items-center gap-4 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 shadow-sm cursor-pointer"
              onClick={() => {
                setActiveMaterial(material);
                navigateTo('pdf-viewer');
              }}
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <FileText size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-slate-800">{material.title}</h4>
                <p className="text-[10px] text-slate-500">{material.unit}</p>
              </div>
              <ChevronRight size={16} className="text-indigo-200" />
            </div>
          ))}
          {STUDY_MATERIALS.filter(m => m.branch === selectedBranch).length === 0 && (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-xs text-slate-400">No specific materials for this branch yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setUploadSuccess(false);
          setIsUploadModalOpen(true);
        }}
        className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center z-40 border-4 border-white"
      >
        <Plus size={32} />
      </motion.button>
    </div>
  );

  const StudyMaterialView = () => (
    <div className="p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search subjects..." 
          className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all"
        />
      </div>
      <div className="space-y-3">
        {STUDY_MATERIALS.map((material) => (
          <motion.div 
            key={material.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between group cursor-pointer"
            onClick={() => {
              setActiveMaterial(material);
              navigateTo('pdf-viewer');
            }}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileText size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">{material.title}</h4>
                <p className="text-xs text-slate-500">{material.unit}</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-slate-300 group-hover:text-navy transition-colors" />
          </motion.div>
        ))}
      </div>
    </div>
  );

  const VideoAcademyView = () => (
    <div className="p-4 space-y-6">
      <div className="space-y-4">
        <h3 className="font-bold text-slate-800">Featured Lectures</h3>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {VIDEO_LECTURES.map((video) => (
            <motion.div 
              key={video.id}
              whileHover={{ y: -4 }}
              className="min-w-[280px] bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm cursor-pointer"
              onClick={() => {
                setActiveVideo(video);
                navigateTo('video-player');
              }}
            >
              <div className="relative aspect-video">
                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center text-navy shadow-lg">
                    <Play size={24} fill="currentColor" />
                  </div>
                </div>
                <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-[10px] font-bold rounded">
                  {video.duration}
                </span>
              </div>
              <div className="p-4">
                <h4 className="font-bold text-slate-800 line-clamp-1">{video.title}</h4>
                <p className="text-xs text-slate-500 mt-1">Dwivedi Educational Academy</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800">All Lectures</h3>
          <button className="text-navy text-xs font-semibold">Filter</button>
        </div>
        <div className="space-y-3">
          {VIDEO_LECTURES.map((video) => (
            <div key={video.id} className="flex gap-3 p-2 bg-white rounded-xl border border-slate-100 shadow-sm">
              <div className="w-24 h-16 rounded-lg overflow-hidden shrink-0 relative">
                <img src={video.thumbnail} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                  <Play size={14} className="text-white" fill="currentColor" />
                </div>
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h4 className="font-semibold text-sm text-slate-800 truncate">{video.title}</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">{video.duration} • 1.2k views</p>
              </div>
              <button className="p-2 text-slate-400 hover:text-navy transition-colors">
                <Download size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const PYQHubView = () => (
    <div className="p-4 space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['All', 2024, 2023, 2022, 2021, 2020].map((year) => (
          <button
            key={year}
            onClick={() => setYearFilter(year as any)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              yearFilter === year 
                ? 'bg-navy text-white shadow-md' 
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            {year}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search subject..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all"
        />
      </div>

      <div className="space-y-3">
        {filteredPYQs.map((pyq) => (
          <div key={pyq.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                {pyq.year}
              </div>
              <div>
                <h4 className="font-bold text-slate-800">{pyq.subject}</h4>
                <p className="text-xs text-slate-500">{pyq.branch} Engineering</p>
              </div>
            </div>
            <button className="p-2 text-navy hover:bg-navy/5 rounded-lg transition-colors">
              <Download size={20} />
            </button>
          </div>
        ))}
        {filteredPYQs.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Search size={32} />
            </div>
            <p className="text-slate-500">No questions found for this search.</p>
          </div>
        )}
      </div>
    </div>
  );

  const BookStoreView = () => (
    <div className="p-4 grid grid-cols-2 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
          <div className="aspect-[3/4] bg-slate-100 relative">
            <img src={`https://picsum.photos/seed/book${i}/300/400`} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            <div className="absolute top-2 right-2 px-2 py-1 bg-navy text-white text-[10px] font-bold rounded">
              NEW
            </div>
          </div>
          <div className="p-3">
            <h4 className="font-bold text-sm text-slate-800 line-clamp-1">Engineering Physics {i}</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">HK Publications</p>
            <div className="flex items-center justify-between mt-2">
              <span className="font-bold text-navy">₹499</span>
              <button className="p-1.5 bg-navy text-white rounded-lg">
                <ShoppingBag size={14} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const PDFViewerView = () => (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-800">
      <div className="bg-white/10 backdrop-blur-md p-4 flex items-center justify-between border-b border-white/10">
        <div className="text-white">
          <h3 className="font-bold text-sm">{activeMaterial?.title}</h3>
          <p className="text-[10px] text-white/60">{activeMaterial?.unit}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              setAiInput(`Based on this material "${activeMaterial?.title}", can you explain the core concepts of ${activeMaterial?.unit}?`);
              setIsAIChatOpen(true);
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg text-[10px] font-bold shadow-lg shadow-blue-500/20"
          >
            <Wand2 size={14} />
            Explain with AI
          </button>
          <button className="p-2 bg-white/10 text-white rounded-lg">
            <Download size={18} />
          </button>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="pdf-placeholder w-full aspect-[1/1.4] bg-white rounded-lg shadow-2xl flex items-center justify-center p-8 text-center">
          <div>
            <div className="w-16 h-16 bg-navy/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={32} className="text-navy" />
            </div>
            <h4 className="font-bold text-slate-800 mb-2">{activeMaterial?.title}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              This is a high-fidelity PDF preview placeholder for {activeMaterial?.subject}. 
              In the production app, this would render the actual study material using a PDF worker.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const VideoPlayerView = () => (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="aspect-video bg-black relative group">
        <img 
          src={activeVideo?.thumbnail || 'https://picsum.photos/seed/video/800/450'} 
          alt="" 
          className="w-full h-full object-cover opacity-60" 
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white border border-white/30 cursor-pointer hover:scale-110 transition-transform">
            <Play size={32} fill="currentColor" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <Play size={20} fill="currentColor" />
            <div className="h-1 bg-white/30 w-48 rounded-full relative">
              <div className="absolute inset-y-0 left-0 w-1/3 bg-navy rounded-full"></div>
            </div>
            <span className="text-[10px]">05:20 / {activeVideo?.duration || '20:00'}</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock size={16} />
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">HD</div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">{activeVideo?.title || 'Engineering Lecture'}</h2>
              <p className="text-sm text-slate-500 mt-1">1,240 views • Published on Feb 20, 2025</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-xl text-sm font-bold shadow-lg shadow-navy/20">
              <Download size={18} />
              Download
            </button>
          </div>
          
          <div className="flex items-center gap-4 py-4 border-y border-slate-100">
            <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
              <img src="https://picsum.photos/seed/prof/100/100" alt="" referrerPolicy="no-referrer" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-800">Dwivedi Educational Academy</h4>
              <p className="text-xs text-slate-500">250k Students • 1.2k Videos</p>
            </div>
            <button className="px-4 py-2 border border-navy text-navy rounded-lg text-xs font-bold">SUBSCRIBE</button>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-800">Description</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              In this lecture, we cover the fundamental principles of {activeVideo?.title || 'this subject'}. 
              This is part of the comprehensive engineering series by HK Publication.
            </p>
          </div>
        </div>

        <div className="w-80 border-l border-slate-100 bg-slate-50 overflow-y-auto hidden md:block">
          <div className="p-4 border-b border-slate-100 bg-white sticky top-0 z-10">
            <h3 className="font-bold text-slate-800">Next Lectures</h3>
          </div>
          <div className="p-2 space-y-2">
            {VIDEO_LECTURES.map((video) => (
              <div 
                key={video.id} 
                className={`flex gap-3 p-2 rounded-xl transition-colors cursor-pointer ${activeVideo?.id === video.id ? 'bg-navy/5 border border-navy/10' : 'hover:bg-white'}`}
                onClick={() => setActiveVideo(video)}
              >
                <div className="w-24 h-14 rounded-lg overflow-hidden shrink-0 relative">
                  <img src={video.thumbnail} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <span className="absolute bottom-1 right-1 px-1 bg-black/70 text-white text-[8px] rounded">
                    {video.duration}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-xs text-slate-800 line-clamp-2">{video.title}</h4>
                  <p className="text-[10px] text-slate-500 mt-1">Part {video.id}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const GroupsView = () => (
    <div className="p-4 space-y-4">
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-1">Community Groups</h3>
        <p className="text-xs text-slate-500">Connect with fellow engineers from your branch.</p>
      </div>

      <div className="space-y-3">
        {CHAT_GROUPS.map((group) => (
          <motion.div
            key={group.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setActiveGroup(group);
              navigateTo('chat');
            }}
            className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-navy/10 text-navy flex items-center justify-center">
              <Users size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 truncate">{group.name}</h4>
                <span className="text-[10px] text-emerald-600 font-bold">{group.memberCount} Online</span>
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">{group.lastMessage}</p>
            </div>
            <ChevronRight size={18} className="text-slate-300" />
          </motion.div>
        ))}
      </div>
    </div>
  );

  const ChatView = () => (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-100">
      <div className="bg-white px-4 py-2 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-navy/10 text-navy flex items-center justify-center">
            <Users size={20} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-800">{activeGroup?.name}</h4>
            <p className="text-[10px] text-emerald-600 font-medium">{activeGroup?.memberCount} Students Online</p>
          </div>
        </div>
        <button className="p-2 text-slate-400">
          <Clock size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {MOCK_MESSAGES.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
            {msg.sender === 'other' && (
              <span className="text-[10px] text-slate-500 mb-1 ml-2 font-medium">{msg.senderName}</span>
            )}
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
              msg.sender === 'me' 
                ? 'bg-navy text-white rounded-tr-none' 
                : 'bg-white text-slate-800 rounded-tl-none'
            }`}>
              {msg.text}
              <div className={`text-[9px] mt-1 text-right ${msg.sender === 'me' ? 'text-white/60' : 'text-slate-400'}`}>
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-400 hover:text-navy transition-colors">
            <Paperclip size={20} />
          </button>
          <input
            type="text"
            placeholder="Type a message..."
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            className="flex-1 bg-slate-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-navy/20"
          />
          <button className="w-10 h-10 bg-navy text-white rounded-full flex items-center justify-center shadow-lg shadow-navy/20">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  const UploadModal = () => (
    <AnimatePresence>
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsUploadModalOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="bg-navy p-6 text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus size={32} />
              </div>
              <h3 className="text-xl font-bold">Contribute Content</h3>
              <p className="text-white/60 text-xs mt-1">Help your fellow engineers succeed.</p>
            </div>

            <div className="p-6 space-y-4">
              {uploadSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8 space-y-4"
                >
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Upload Successful!</h4>
                    <p className="text-sm text-slate-500 mt-2 px-4">
                      Thank you for contributing! Your data is under review by our admin team.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsUploadModalOpen(false)}
                    className="w-full py-3 bg-navy text-white rounded-xl font-bold shadow-lg shadow-navy/20"
                  >
                    Close
                  </button>
                </motion.div>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Category</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Notes', 'PYQ', 'Images'].map((cat) => (
                        <button key={cat} className="py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-navy/5 hover:border-navy/20 transition-all">
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Subject Name</label>
                    <input type="text" placeholder="e.g. Thermodynamics" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-navy/20 outline-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Year</label>
                      <input type="number" placeholder="2024" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-navy/20 outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">File Type</label>
                      <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-navy/20 outline-none">
                        <option>PDF</option>
                        <option>Image</option>
                        <option>Video Link</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-bold hover:bg-slate-50 transition-all flex flex-col items-center gap-2">
                      <Download size={20} />
                      Choose File
                    </button>
                  </div>

                  <button
                    onClick={() => setUploadSuccess(true)}
                    className="w-full py-4 bg-navy text-white rounded-2xl font-bold shadow-xl shadow-navy/20 mt-4"
                  >
                    Submit for Review
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const AIChatOverlay = () => (
    <AnimatePresence>
      {isAIChatOpen && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.9 }}
          className="fixed inset-x-4 bottom-24 z-50 max-w-md mx-auto h-[500px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-100"
        >
          <div className="bg-gradient-to-r from-navy to-blue-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                <Bot size={24} />
              </div>
              <div>
                <h4 className="font-bold text-sm">HK-AI Assistant</h4>
                <p className="text-[10px] text-white/60 font-medium">Powered by Gemini AI</p>
              </div>
            </div>
            <button onClick={() => setIsAIChatOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {aiMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-navy text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 rounded-tl-none shadow-sm border border-slate-100'
                }`}>
                  {msg.image && (
                    <img src={msg.image} alt="Uploaded problem" className="w-full rounded-lg mb-2 border border-white/20" />
                  )}
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {isAILoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-navy" />
                  <span className="text-xs text-slate-500 font-medium">AI is thinking...</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-slate-100">
            {aiImage && (
              <div className="mb-3 relative inline-block">
                <img src={aiImage} alt="Preview" className="w-16 h-16 object-cover rounded-lg border-2 border-navy/20" />
                <button 
                  onClick={() => setAiImage(null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md"
                >
                  <X size={10} />
                </button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <label className="p-2 text-slate-400 hover:text-navy transition-colors cursor-pointer">
                <Camera size={20} />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
              <input
                type="text"
                placeholder="Ask HK-AI anything..."
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAISend(aiInput, aiImage || undefined)}
                className="flex-1 bg-slate-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-navy/20 outline-none"
              />
              <button 
                onClick={() => handleAISend(aiInput, aiImage || undefined)}
                disabled={isAILoading}
                className="w-10 h-10 bg-gradient-to-r from-navy to-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-navy/20 disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const Sidebar = () => (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-80 bg-white z-50 shadow-2xl flex flex-col"
          >
            <div className="p-6 bg-navy text-white">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <GraduationCap size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">HK Publication</h2>
                    <p className="text-white/60 text-[10px] uppercase tracking-widest">Engineering Hub</p>
                  </div>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-1">
                <p className="text-white/40 text-[10px] font-bold uppercase mb-2">Current Selection</p>
                <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/10">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <BookMarked size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold">{selectedBranch}</p>
                    <p className="text-[10px] text-white/60">Semester {selectedSemester}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Current Branch</h3>
                  <button 
                    onClick={() => setHasSelectedBranch(false)}
                    className="text-navy text-[10px] font-bold uppercase hover:underline"
                  >
                    Change
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {branches.map((branch) => (
                    <button
                      key={branch.name}
                      onClick={() => setSelectedBranch(branch.name)}
                      className={`flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-all ${
                        selectedBranch === branch.name 
                          ? 'bg-navy/5 text-navy border border-navy/10' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <branch.icon size={16} className={selectedBranch === branch.name ? 'text-navy' : 'text-slate-400'} />
                        {branch.name}
                      </div>
                      {selectedBranch === branch.name && <div className="w-1.5 h-1.5 rounded-full bg-navy" />}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-slate-400 text-[10px] font-bold uppercase mb-4 tracking-wider">Select Semester</h3>
                <div className="grid grid-cols-4 gap-2">
                  {semesters.map((sem) => (
                    <button
                      key={sem}
                      onClick={() => setSelectedSemester(sem)}
                      className={`aspect-square flex items-center justify-center rounded-xl text-xs font-bold transition-all ${
                        selectedSemester === sem 
                          ? 'bg-navy text-white shadow-lg shadow-navy/20' 
                          : 'bg-slate-50 text-slate-600 border border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      {sem}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <div className="p-6 border-t border-slate-100">
              <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                <ShoppingBag size={18} />
                Visit Bookstore
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  const renderView = () => {
    switch (currentView) {
      case 'home': return <HomeView />;
      case 'study-material': return <StudyMaterialView />;
      case 'video-academy': return <VideoAcademyView />;
      case 'pyq-hub': return <PYQHubView />;
      case 'book-store': return <BookStoreView />;
      case 'pdf-viewer': return <PDFViewerView />;
      case 'video-player': return <VideoPlayerView />;
      case 'groups': return <GroupsView />;
      case 'chat': return <ChatView />;
      default: return <HomeView />;
    }
  };

  const getTitle = () => {
    switch (currentView) {
      case 'home': return 'HK Publication';
      case 'study-material': return 'Study Material';
      case 'video-academy': return 'Video Academy';
      case 'pyq-hub': return 'PYQ Hub';
      case 'book-store': return 'Book Store';
      case 'pdf-viewer': return activeMaterial?.title || 'PDF Viewer';
      case 'video-player': return 'Lecture Player';
      case 'groups': return 'Community Groups';
      case 'chat': return activeGroup?.name || 'Chat';
      default: return 'HK Publication';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto shadow-2xl relative overflow-x-hidden">
      {!hasSelectedBranch ? (
        <BranchPickerView />
      ) : (
        <>
          <Sidebar />
          <UploadModal />
          <AIChatOverlay />
          {renderHeader(getTitle(), currentView !== 'home')}
          
          <main className="flex-1 overflow-y-auto pb-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderView()}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* AI Floating Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsAIChatOpen(!isAIChatOpen)}
            className="fixed bottom-24 left-6 w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-400 text-white rounded-2xl shadow-2xl flex flex-col items-center justify-center z-40 border-2 border-white/20"
          >
            <Bot size={24} />
            <span className="text-[8px] font-black uppercase mt-1">HK-AI</span>
          </motion.button>

          {/* Floating Action Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setUploadSuccess(false);
              setIsUploadModalOpen(true);
            }}
            className="fixed bottom-24 right-6 w-14 h-14 bg-navy text-white rounded-full shadow-2xl flex items-center justify-center z-40 border-4 border-white"
          >
            <Plus size={32} />
          </motion.button>

          {/* Bottom Navigation Bar */}
          <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-lg border-t border-slate-100 px-6 py-3 flex items-center justify-between z-30">
            {[
              { id: 'home', icon: GraduationCap, label: 'Home' },
              { id: 'study-material', icon: BookOpen, label: 'Study' },
              { id: 'video-academy', icon: Video, label: 'Academy' },
              { id: 'groups', icon: MessageSquare, label: 'Groups' },
              { id: 'pyq-hub', icon: FileText, label: 'PYQs' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id as View)}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  currentView === item.id ? 'text-navy' : 'text-slate-400'
                }`}
              >
                <item.icon size={22} strokeWidth={currentView === item.id ? 2.5 : 2} />
                <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
              </button>
            ))}
          </nav>
        </>
      )}
    </div>
  );
}

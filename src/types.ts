export type Branch = 'Computer Science' | 'Information Technology' | 'Mechanical' | 'Civil' | 'Electrical' | 'Electronics' | 'AI & ML' | 'Common';
export type Semester = '1st' | '2nd' | '3rd' | '4th' | '5th' | '6th' | '7th' | '8th';

export interface StudyMaterial {
  id: string;
  title: string;
  unit: string;
  subject: string;
  branch: Branch;
  isFirstYear?: boolean;
}

export interface VideoLecture {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
}

export interface PYQ {
  id: string;
  year: number;
  subject: string;
  branch: Branch;
}

export type View = 'home' | 'study-material' | 'video-academy' | 'pyq-hub' | 'book-store' | 'pdf-viewer' | 'video-player' | 'groups' | 'chat' | 'ai-solver';

export interface AIChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string;
}

export interface ChatGroup {
  id: string;
  name: string;
  branch: Branch;
  memberCount: string;
  lastMessage: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'me' | 'other';
  senderName?: string;
  timestamp: string;
}

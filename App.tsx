
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TaskManager from './components/TaskManager';
import CurriculumMapper from './components/CurriculumMapper';
import ScheduleManager from './components/ScheduleManager';
import VideoLibrary from './components/VideoLibrary'; 
import ResourceManager from './components/ResourceManager';
import BacklogManager from './components/BacklogManager';
import AIAssistant from './components/AIAssistant'; 
import AppGuide from './components/AppGuide';
import TelegramChannel from './components/TelegramChannel'; // Imported
import { Task, Course, UserStats, ScheduleBlock, ResourceItem, ChatSession } from './types';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';

// --- INITIAL DATA FALLBACKS ---
const INITIAL_COURSES: Course[] = [
  { 
    id: '1', 
    name: 'فيزياء', 
    credits: 5, 
    difficulty: 'Hard', 
    color: '#6366f1', 
    currentGrade: 82,
    targetGrade: 95,
    units: []
  },
  { 
    id: '2', 
    name: 'رياضيات (تفاضل وتكامل)', 
    credits: 6, 
    difficulty: 'Hard', 
    color: '#ec4899', 
    currentGrade: 92,
    targetGrade: 98,
    units: []
  },
  { 
    id: '3', 
    name: 'كيمياء', 
    credits: 4, 
    difficulty: 'Medium', 
    color: '#10b981', 
    currentGrade: 88,
    targetGrade: 95,
    units: []
  }
];

const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'حل بنك أسئلة الفيزياء الباب الأول', dueDate: new Date(Date.now() + 86400000).toISOString(), priority: 'High', isCompleted: false, courseId: '1' }
];

const INITIAL_SCHEDULE: ScheduleBlock[] = [
  { id: '1', title: 'صلاة الفجر', type: 'prayer', startTime: '04:30', durationMinutes: 30, isCompleted: false },
  { id: '2', title: 'مذاكرة فيزياء', type: 'study', startTime: '06:00', durationMinutes: 120, isCompleted: false }
];

const INITIAL_STATS: UserStats = {
    level: 1, 
    xp: 0,
    streakDays: 1,
    totalFocusMinutes: 0,
    tasksCompleted: 0,
    masteryScore: 0
};

// --- DB HELPER HOOK ---
function usePersistentState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage`, error);
    }
  }, [key, state]);

  return [state, setState];
}

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  
  // Database Connected States
  const [tasks, setTasks] = usePersistentState<Task[]>('db_tasks', INITIAL_TASKS);
  const [courses, setCourses] = usePersistentState<Course[]>('db_courses', INITIAL_COURSES);
  const [schedule, setSchedule] = usePersistentState<ScheduleBlock[]>('db_schedule', INITIAL_SCHEDULE);
  const [resources, setResources] = usePersistentState<ResourceItem[]>('db_resources', []);
  const [userStats, setUserStats] = usePersistentState<UserStats>('db_stats', INITIAL_STATS);
  const [chatHistory, setChatHistory] = usePersistentState<ChatSession[]>('db_chat_history', []);

  // --- Handlers ---
  const addTask = (task: Task) => {
    setTasks(prev => [task, ...prev]);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, isCompleted: !t.isCompleted };
      }
      return t;
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const addCourse = (course: Course) => {
    setCourses(prev => [...prev, course]);
  };

  const updateCourse = (updatedCourse: Course) => {
      setCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
  };

  const deleteCourse = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const addScheduleBlock = (block: ScheduleBlock) => {
    setSchedule(prev => [...prev, block]);
  };

  const deleteScheduleBlock = (id: string) => {
    setSchedule(prev => prev.filter(b => b.id !== id));
  };

  const addResource = (item: ResourceItem) => {
    setResources(prev => [...prev, item]);
  };

  // Save or Update a Chat Session
  const saveChatSession = (session: ChatSession) => {
    setChatHistory(prev => {
        const exists = prev.find(s => s.id === session.id);
        let newHistory;
        if (exists) {
            newHistory = prev.map(s => s.id === session.id ? session : s);
        } else {
            newHistory = [session, ...prev];
        }
        // Sort by last modified (newest first)
        return newHistory.sort((a, b) => b.lastModified - a.lastModified);
    });
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard tasks={tasks} courses={courses} stats={userStats} onNavigateTo={setCurrentView} />;
      case 'tasks':
        return <TaskManager tasks={tasks} courses={courses} addTask={addTask} toggleTask={toggleTask} deleteTask={deleteTask} />;
      case 'curriculum':
        return <CurriculumMapper courses={courses} addCourse={addCourse} updateCourse={updateCourse} deleteCourse={deleteCourse} />;
      case 'schedule':
        return <ScheduleManager schedule={schedule} addBlock={addScheduleBlock} deleteBlock={deleteScheduleBlock} />;
      case 'study_zone':
        return <VideoLibrary />;
      case 'resources':
        return <ResourceManager resources={resources} addResource={addResource} />;
      case 'backlog':
        return <BacklogManager courses={courses} updateCourse={updateCourse} addCourse={addCourse} />;
      case 'telegram': 
        return <TelegramChannel />;
      case 'ai': 
        return (
          <AIAssistant 
            tasks={tasks} 
            schedule={schedule} 
            courses={courses} 
            chatHistory={chatHistory}
            onSaveSession={saveChatSession}
            onExit={() => setCurrentView('dashboard')}
          />
        );
      case 'guide':
        return <AppGuide />;
      default:
        return <Dashboard tasks={tasks} courses={courses} stats={userStats} onNavigateTo={setCurrentView} />;
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      onChangeView={setCurrentView}
      userLevel={userStats.level}
      userXP={userStats.xp}
    >
      {renderView()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;

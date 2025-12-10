
import { GoogleGenAI, Type, Content } from "@google/genai";
import { Course, Task, ScheduleBlock, DailyPlan, ChatMessage, UserStats, ResourceItem } from "../types";

// Initialize Gemini
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export interface ParsedTaskResult {
  title: string;
  courseName?: string;
  dueDate?: string; // ISO format suggested
  priority: 'Low' | 'Medium' | 'High';
}

// --- TASK PARSING (Kept efficient) ---
export const parseTaskWithAI = async (
  input: string, 
  availableCourses: Course[]
): Promise<ParsedTaskResult | null> => {
  if (!apiKey) {
    console.warn("Gemini API Key is missing.");
    return null;
  }

  const courseNames = availableCourses.map(c => c.name).join(", ");
  const today = new Date().toISOString();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Date: ${today}. Courses: [${courseNames}]. Input: "${input}". 
      Extract task. ISO Date. Default Priority Medium.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            courseName: { type: Type.STRING },
            dueDate: { type: Type.STRING },
            priority: { type: Type.STRING, enum: ["Low", "Medium", "High"] }
          },
          required: ["title", "priority"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as ParsedTaskResult;

  } catch (error) {
    console.error("Error parsing task:", error);
    return null;
  }
};

// --- SMART CHAT WITH FULL CONTEXT & MEMORY ---

export const chatWithGenie = async (
  userMessage: string,
  history: ChatMessage[], // NEW: Accept full history
  context: {
    tasks: Task[];
    schedule: ScheduleBlock[];
    courses: Course[];
    stats: UserStats;
    resources: ResourceItem[];
  },
  imageData?: string
): Promise<string> => {
  if (!apiKey) return "عذراً، المفتاح الخاص بـ AI غير موجود.";

  const today = new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const currentTime = new Date().toLocaleTimeString('ar-EG');

  // 1. Prepare Deep Context (The "Brain")
  const contextString = JSON.stringify({
    userProfile: {
      level: context.stats.level,
      mastery: context.stats.masteryScore,
      streak: context.stats.streakDays
    },
    academicStatus: context.courses.map(c => ({
      subject: c.name,
      currentGrade: c.currentGrade || 0,
      targetGrade: c.targetGrade || 100,
      gap: (c.targetGrade || 100) - (c.currentGrade || 0),
      difficulty: c.difficulty,
      remainingBacklog: c.studyConfig?.backlogCount || 0
    })),
    pendingTasks: context.tasks.filter(t => !t.isCompleted).map(t => ({
      title: t.title,
      due: t.dueDate,
      priority: t.priority
    })),
    todaysSchedule: context.schedule.map(s => `${s.startTime}: ${s.title} (${s.type})`),
    resources: context.resources.map(r => r.title)
  }, null, 2);

  const systemPrompt = `
    You are the "Intelligent Mentor" (الناصح الأمين) for a High School student (Thanaweya Amma).
    
    === REAL-TIME CONTEXT ===
    Date: ${today}, Time: ${currentTime}
    FULL STUDENT DATA: ${contextString}
    
    === YOUR CORE PERSONA ===
    1. **Honest & Direct (صريح)**: You do NOT lie, sugarcoat, or sycophant. If the student's grades are bad, say they are at risk politely but firmly. If they have accumulated tasks, warn them.
    2. **Compassionate & Kind (عطوف)**: You care about their future. Your advice comes from love, not judgment. Be the "Big Brother".
    3. **Analytical (محلل)**: You don't just chat; you analyze. Use the provided data to point out weaknesses (e.g., "I noticed your Physics grade is 82 while your target is 95. Focus on Chapter 3").
    4. **Language**: Egyptian Arabic (Masri) ONLY. Natural, friendly, but professional.
    
    === YOUR CAPABILITIES ===
    1. **Personalized Learning**: Suggest study plans based on the user's specific weak subjects (look at 'academicStatus').
    2. **Performance Analysis**: Analyze their grades/tasks. Tell them exactly where they stand.
    3. **Task Automation**: If they ask "What should I do?", prioritize their 'pendingTasks' and 'backlog'.
    4. **Interactive Help**: Explain complex concepts simply if asked.
    
    === RESPONSE GUIDELINES ===
    - Be concise. Don't write essays unless asked.
    - No Markdown headers (#). Use bullet points if needed.
    - If the student is doing well, praise them genuinely.
    - If the student is slacking (low streak, many pending tasks), give them a "Reality Check" (فوق لنفسك) but kindly.
  `;

  try {
    // 2. Build History for Gemini
    // Map previous React messages to Gemini Content objects
    const pastTurns: Content[] = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // 3. Prepare Current User Message
    const currentParts: any[] = [{ text: userMessage }];
    if (imageData) {
        const base64Data = imageData.split(',')[1];
        currentParts.push({
            inlineData: {
                mimeType: "image/jpeg",
                data: base64Data
            }
        });
    }

    // 4. Send Request (System Prompt + History + Current Message)
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.6, // Slightly lower for more grounded/honest responses
      },
      contents: [
        ...pastTurns, // Inject Memory
        { role: 'user', parts: currentParts }
      ]
    });

    let text = response.text || "مش قادر أرد دلوقتي، في مشكلة تقنية.";
    // Clean up Markdown just in case
    text = text.replace(/[*#_`]/g, '').trim(); 
    return text;

  } catch (error) {
    console.error("AI Chat Error", error);
    return "فيه مشكلة في الاتصال، جرب كمان شوية.";
  }
};

// --- BACKLOG PLANNER ---
export const generateBacklogPlan = async (courses: Course[]): Promise<DailyPlan[]> => {
  if (!apiKey) return [];
  
  const coursesData = courses
    .filter(c => (c.studyConfig && (c.studyConfig.backlogCount > 0 || (c.studyConfig.lectureDays && c.studyConfig.lectureDays.length > 0))))
    .map(c => ({
      subject: c.name,
      ...c.studyConfig
    }));

  if (coursesData.length === 0) return [];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Create a 7-day study plan (Sat-Fri) for High School student.
      Data: ${JSON.stringify(coursesData)}
      Rules: Prioritize lectures on fixed days. Fill gaps with backlogs.
      Output: JSON Array [{day, totalHours, tasks: [{subject, type, details, duration}]}]`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.STRING },
              totalHours: { type: Type.NUMBER },
              tasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    subject: { type: Type.STRING },
                    type: { type: Type.STRING },
                    details: { type: Type.STRING },
                    duration: { type: Type.NUMBER }
                  }
                }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || "[]") as DailyPlan[];
  } catch (e) { return []; }
};

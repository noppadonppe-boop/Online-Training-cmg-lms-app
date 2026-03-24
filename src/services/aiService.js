const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent`;

const CHOICE_LABELS = ['ก', 'ข', 'ค', 'ง'];

/**
 * Shuffles an array using Fisher-Yates and returns a new array.
 */
export function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Given a question with choices, returns a new question object
 * with the choices shuffled (answer key updated accordingly).
 */
export function shuffleQuestionChoices(question) {
  const shuffled = shuffleArray(question.choices);
  const newAnswerIndex = shuffled.findIndex(c => c.id === question.answer);
  const newAnswerLabel = CHOICE_LABELS[newAnswerIndex];
  return {
    ...question,
    choices: shuffled.map((c, i) => ({ ...c, label: CHOICE_LABELS[i] })),
    answer: newAnswerLabel,
  };
}

/**
 * Calls Gemini REST API with a YouTube URL and returns 10 multiple-choice questions.
 * Each question: { id, text, choices: [{id, label, text}], answer: 'ก'|'ข'|'ค'|'ง' }
 */
export async function generateQuestionsFromYouTube(youtubeUrl) {
  if (!API_KEY || API_KEY === 'your_gemini_api_key_here') {
    throw new Error('VITE_GEMINI_API_KEY ยังไม่ได้ตั้งค่า กรุณาเพิ่ม API Key ใน .env');
  }

  const textPrompt = `คุณคือผู้เชี่ยวชาญด้านการสร้างข้อสอบเพื่อการเรียนรู้

ฉันต้องการให้คุณวิเคราะห์วิดีโอ YouTube ที่แนบมานี้ แล้วดึงข้อมูล เนื้อหา และประเด็นสำคัญจากวิดีโอนั้น เพื่อนำมาสร้างข้อสอบแบบปรนัย จำนวน 10 ข้อ

เงื่อนไขการสร้างข้อสอบ:
1. คำถามทุกข้อต้องมาจากเนื้อหาในวิดีโอโดยตรง ห้ามสร้างคำถามที่ไม่เกี่ยวข้องกับวิดีโอนี้
2. แต่ละข้อมีตัวเลือก 4 ข้อ ได้แก่ ก ข ค ง
3. มีคำตอบที่ถูกต้องเพียง 1 ข้อเท่านั้น
4. ตัวเลือกที่ผิดต้องดูสมเหตุสมผล ไม่ใช่คำตอบที่ผิดอย่างชัดเจน
5. ครอบคลุมเนื้อหาหลายส่วนของวิดีโอ ไม่ถามซ้ำประเด็นเดิม
6. ใช้ภาษาไทยที่ชัดเจนและเข้าใจง่าย

ตอบกลับในรูปแบบ JSON เท่านั้น ไม่มีข้อความอื่นนอกจาก JSON โดยใช้โครงสร้างนี้:
{
  "questions": [
    {
      "text": "คำถาม...",
      "choices": [
        { "label": "ก", "text": "ตัวเลือก ก..." },
        { "label": "ข", "text": "ตัวเลือก ข..." },
        { "label": "ค", "text": "ตัวเลือก ค..." },
        { "label": "ง", "text": "ตัวเลือก ง..." }
      ],
      "answer": "ก"
    }
  ]
}`;

  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: textPrompt },
          { fileData: { mimeType: 'video/*', fileUri: youtubeUrl } },
        ],
      },
    ],
  };

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = err?.error?.message || `HTTP ${response.status}`;
    throw new Error(`Gemini API Error: ${msg}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Gemini ส่งข้อมูลกลับมาในรูปแบบที่ไม่ถูกต้อง');

  const parsed = JSON.parse(jsonMatch[0]);
  if (!parsed.questions || !Array.isArray(parsed.questions)) {
    throw new Error('ไม่พบข้อมูลคำถามในผลลัพธ์ที่ได้รับ');
  }

  return parsed.questions.slice(0, 10).map((q, i) => ({
    id: `q_ai_${Date.now()}_${i}`,
    text: q.text,
    choices: q.choices.map((c, ci) => ({
      id: `c_${i}_${ci}`,
      label: CHOICE_LABELS[ci],
      text: c.text,
    })),
    answer: q.answer,
    type: 'multiple',
  }));
}

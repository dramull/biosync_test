const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY as string | undefined;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export function isOpenRouterConfigured(): boolean {
  return !!OPENROUTER_API_KEY;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

async function chatCompletion(messages: ChatMessage[], model = 'google/gemini-2.0-flash-001'): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key not configured');
  }

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'BioSync',
    },
    body: JSON.stringify({ model, messages, temperature: 0.3 }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content ?? '';
}

export async function analyzeSelfieLive(imageBase64: string): Promise<{
  gender: string;
  age: number;
  bmi: number;
}> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: 'You are a health assessment AI. Analyze the selfie and estimate gender, approximate age, and approximate BMI. Respond ONLY with valid JSON: {"gender":"male|female|other","age":<number>,"bmi":<number>}',
    },
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Analyze this selfie for gender, age, and BMI estimation.' },
        { type: 'image_url', image_url: { url: imageBase64 } },
      ],
    },
  ];

  const result = await chatCompletion(messages, 'google/gemini-2.0-flash-001');
  const cleaned = result.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(cleaned);
}

export async function analyzeMealPhoto(imageBase64: string): Promise<{
  description: string;
  ingredients: Array<{ name: string; portion: string; calories: number; protein: number; carbs: number; fat: number }>;
  total: { calories: number; protein: number; carbs: number; fat: number };
}> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are a nutrition analysis AI. Analyze the meal photo and extract ingredients with nutritional estimates. Respond ONLY with valid JSON:
{"description":"<meal description>","ingredients":[{"name":"<ingredient>","portion":"<amount>","calories":<n>,"protein":<n>,"carbs":<n>,"fat":<n>}],"total":{"calories":<n>,"protein":<n>,"carbs":<n>,"fat":<n>}}`,
    },
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Analyze this meal photo for ingredients and nutritional content.' },
        { type: 'image_url', image_url: { url: imageBase64 } },
      ],
    },
  ];

  const result = await chatCompletion(messages, 'google/gemini-2.0-flash-001');
  const cleaned = result.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(cleaned);
}

export async function analyzeMealText(description: string): Promise<{
  description: string;
  ingredients: Array<{ name: string; portion: string; calories: number; protein: number; carbs: number; fat: number }>;
  total: { calories: number; protein: number; carbs: number; fat: number };
}> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are a nutrition analysis AI. Given a meal description, extract ingredients with nutritional estimates. Respond ONLY with valid JSON:
{"description":"<meal description>","ingredients":[{"name":"<ingredient>","portion":"<amount>","calories":<n>,"protein":<n>,"carbs":<n>,"fat":<n>}],"total":{"calories":<n>,"protein":<n>,"carbs":<n>,"fat":<n>}}`,
    },
    {
      role: 'user',
      content: description,
    },
  ];

  const result = await chatCompletion(messages);
  const cleaned = result.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(cleaned);
}

export async function analyzeWorkoutText(description: string): Promise<{
  workout_type: string;
  exercises: Array<{ name: string; sets?: number; reps?: number; weight_kg?: number; duration_minutes?: number; distance_km?: number }>;
  duration_minutes: number;
  calories_burned: number;
  intensity: 'low' | 'moderate' | 'high';
}> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are a fitness analysis AI. Given a workout description, structure it into exercises. Respond ONLY with valid JSON:
{"workout_type":"<type>","exercises":[{"name":"<exercise>","sets":<n>,"reps":<n>,"weight_kg":<n>,"duration_minutes":<n>,"distance_km":<n>}],"duration_minutes":<n>,"calories_burned":<n>,"intensity":"low|moderate|high"}
Omit null fields in exercises.`,
    },
    {
      role: 'user',
      content: description,
    },
  ];

  const result = await chatCompletion(messages);
  const cleaned = result.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(cleaned);
}

export async function getRecommendations(nutritionData: string, fitnessData: string): Promise<
  Array<{ type: string; title: string; description: string; priority: string }>
> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are a health optimization AI. Given recent nutrition and fitness data, provide actionable recommendations. Respond ONLY with valid JSON array:
[{"type":"nutrition|fitness|recovery|general","title":"<short title>","description":"<actionable advice>","priority":"low|medium|high"}]
Provide 3-5 recommendations.`,
    },
    {
      role: 'user',
      content: `Recent nutrition: ${nutritionData}\n\nRecent fitness: ${fitnessData}`,
    },
  ];

  const result = await chatCompletion(messages);
  const cleaned = result.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(cleaned);
}

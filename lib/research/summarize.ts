const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface AiSummaries {
  simple: string;
  adult: string;
  professional: string;
}

export async function summarizeAbstract(
  title: string,
  abstract: string
): Promise<AiSummaries | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !abstract) return null;

  const prompt = `You are summarizing a medical research paper about Duane Syndrome for a patient information website.

Title: ${title}
Abstract: ${abstract}

Please provide THREE summaries of this research paper:

1. SIMPLE (for children/teens, ages 10-16): Use simple language, short sentences. Explain what the researchers found in a way a young person with Duane Syndrome could understand. 2-3 sentences max.

2. ADULT (for patients and parents): Clear, accessible language without excessive jargon. Explain what the study found and why it matters for people living with Duane Syndrome. 3-4 sentences.

3. PROFESSIONAL (for healthcare providers): Concise clinical summary maintaining medical terminology. Focus on methodology, findings, and clinical implications. 3-4 sentences.

Format your response as JSON:
{"simple": "...", "adult": "...", "professional": "..."}`;

  try {
    const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3 },
      }),
    });

    if (!res.ok) {
      console.error(`Gemini API error: ${res.status} ${res.statusText}`);
      return null;
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error('Gemini returned no text:', JSON.stringify(data).slice(0, 200));
      return null;
    }

    // Extract JSON from response (may be wrapped in markdown code block)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Could not extract JSON from Gemini response:', text.slice(0, 200));
      return null;
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Summarization failed:', error);
    return null;
  }
}

export type Persona = 'patient' | 'parent' | 'friend';

const PERSONA_KEY = 'duane-persona';

export function getPersona(): Persona | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(PERSONA_KEY) as Persona | null;
}

export function setPersona(persona: Persona): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PERSONA_KEY, persona);
}

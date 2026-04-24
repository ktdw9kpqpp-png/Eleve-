import type { Location, WorkoutType } from '@/types/domain';

// Intent detection for Luna, per spec §4.2. Lightweight, regex-based; runs on
// the client so the app can react to the user's message independently of the
// LLM response.

export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type BodyPart =
  | 'shoulder'
  | 'back'
  | 'neck'
  | 'lower-back'
  | 'knee'
  | 'ankle'
  | 'wrist'
  | 'elbow'
  | 'hip'
  | 'other';

export type Intent =
  | { kind: 'focus'; type: WorkoutType }
  | { kind: 'tired'; scope: 'day' | 'week' }
  | { kind: 'reschedule'; day: Weekday | null }
  | { kind: 'sweet_craving' }
  | { kind: 'injury'; bodyPart: BodyPart }
  | { kind: 'location_change'; location: Location }
  | { kind: 'missed_session' }
  | { kind: 'overate' }
  | { kind: 'question_cycle' }
  | { kind: 'question_workout' }
  | { kind: 'none' };

const WORKOUT_PATTERNS: Array<[RegExp, WorkoutType]> = [
  [/pilates/i, 'pilates'],
  [/yoga/i, 'yoga'],
  [/hiit/i, 'hiit'],
  [/(ağırlık|agirlik|güç antrenman|guc antrenman|weight)/i, 'strength'],
  [/(yüzme|yuzme|havuz|swim)/i, 'swim'],
  [/(koşu|kosu|run)/i, 'run'],
  [/(dans|dance)/i, 'dance'],
  [/(yürüyüş|yuruyus|yürüy|walk)/i, 'walk'],
  [/(restoratif|toparlan|dinlenme)/i, 'restorative'],
];

const DAY_PATTERNS: Array<[RegExp, Weekday]> = [
  [/pazartesi/i, 'monday'],
  [/salı|sali/i, 'tuesday'],
  [/çarşamba|carsamba/i, 'wednesday'],
  [/perşembe|persembe/i, 'thursday'],
  [/cumartesi/i, 'saturday'],
  // "cuma" must come after "cumartesi" to avoid false match.
  [/cuma/i, 'friday'],
  [/pazar/i, 'sunday'],
];

// Body part patterns accept the Turkish vowel-drop forms (omuz→omz, boyun→boyn)
// that appear with possessive suffixes ("omzum", "boynum").
const BODY_PART_PATTERNS: Array<[RegExp, BodyPart]> = [
  [/(omuz|omz[ua])/i, 'shoulder'],
  [/(bel|alt sırt|alt sirt)/i, 'lower-back'],
  [/(sırt|sirt)/i, 'back'],
  [/(boyun|boyn[ua])/i, 'neck'],
  [/diz/i, 'knee'],
  [/(ayak bileği|ayak bilegi|topuk)/i, 'ankle'],
  [/bilek/i, 'wrist'],
  [/dirsek/i, 'elbow'],
  [/(kalça|kalca)/i, 'hip'],
];

const LOCATION_PATTERNS: Array<[RegExp, Location]> = [
  [/(evdeyim|ev programı|ev programi|evde yapalım|evde yapalim)/i, 'home'],
  [/(salon kapandı|salon kapandi|salona git)/i, 'gym'],
  [/(stüdyo|studyo|studio)/i, 'studio'],
  [/(dışarı|disari|açık hava|acik hava|park)/i, 'outdoor'],
  [/(havuz)/i, 'pool'],
];

const TIRED_RX =
  /(yorgun|halsız|halsiz|bitkin|enerjim yok|enerjim düşük|enerjim dusuk|takatim yok|mecalim yok)/i;
const WEEK_SCOPE_RX = /(bu hafta|haftalık|haftalik|tüm hafta|tum hafta|hafta boyunca)/i;
const SWEET_RX = /(canım tatlı|canim tatli|tatlı istiyor|tatli istiyor|şeker çek|seker cek|çikolata|cikolata)/i;
const INJURY_RX = /(ağrı|agri|acı|aci|tutul|zorland|sancı|sanci|sakat)/i;
const OVERATE_RX = /(çok yedim|cok yedim|fazla yedim|abartt|tıkın|tikin|kaçırdım sınır|kacirdim sinir)/i;
const MISSED_RX = /(derse girmedim|atlad|gitmedim|kaçırd|kacird|yapamad)/i;
const RESCHEDULE_RX = /(yapamam|erteleyelim|ertele|sonraya|taşıyalım|tasiyalim|kaydıralım|kaydiralim)/i;
const FOCUS_RX = /(yoğunlaş|yogunlas|odaklan|istiyorum|yapalım|yapalim|yapmak istiyorum|hadi|yap)/i;
const QUESTION_CYCLE_RX =
  /(hangi faz|döngüm|dongum|faz nedir|luteal|foliküler|folikuler|ovülasyon|ovulasyon|adet)/i;
const QUESTION_WORKOUT_RX =
  /(bugün ne yap|bugun ne yap|ne önerir|ne onerir|tavsiye|öneri|oneri|öner|oner)/i;

function findFirst<T>(input: string, patterns: Array<[RegExp, T]>): T | null {
  for (const [rx, value] of patterns) {
    if (rx.test(input)) return value;
  }
  return null;
}

/**
 * Detect the user's intent from free text. Pattern-based and lenient — handles
 * common Turkish variants with and without diacritics. Returns a single best
 * match; callers can layer a second pass if a message contains multiple cues.
 */
export function detectIntent(raw: string): Intent {
  const text = raw.trim();
  if (text.length === 0) return { kind: 'none' };

  // Injury: a body part with an ache word.
  if (INJURY_RX.test(text)) {
    const part = findFirst(text, BODY_PART_PATTERNS) ?? 'other';
    return { kind: 'injury', bodyPart: part };
  }

  // Location change.
  const location = findFirst(text, LOCATION_PATTERNS);
  if (location) return { kind: 'location_change', location };

  // Overate.
  if (OVERATE_RX.test(text)) return { kind: 'overate' };

  // Sweet craving.
  if (SWEET_RX.test(text)) return { kind: 'sweet_craving' };

  // Tired.
  if (TIRED_RX.test(text)) {
    return { kind: 'tired', scope: WEEK_SCOPE_RX.test(text) ? 'week' : 'day' };
  }

  // Reschedule (by day).
  if (RESCHEDULE_RX.test(text)) {
    const day = findFirst(text, DAY_PATTERNS);
    return { kind: 'reschedule', day };
  }

  // Missed a session.
  if (MISSED_RX.test(text)) return { kind: 'missed_session' };

  // Focus on a workout type — either explicit intent word, or bare mention.
  const workoutType = findFirst(text, WORKOUT_PATTERNS);
  if (workoutType && (FOCUS_RX.test(text) || text.split(/\s+/).length <= 4)) {
    return { kind: 'focus', type: workoutType };
  }

  // Generic questions.
  if (QUESTION_CYCLE_RX.test(text)) return { kind: 'question_cycle' };
  if (QUESTION_WORKOUT_RX.test(text)) return { kind: 'question_workout' };

  return { kind: 'none' };
}

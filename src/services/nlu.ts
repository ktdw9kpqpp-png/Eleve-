import type { Location, WorkoutType } from '@/types/domain';

// Intent detection for Luna. Lightweight, regex-based; runs on the client so
// the app can react to the user's message independently of the LLM response.
//
// IMPORTANT: emotional crisis (loss/grief/very-low-mood) intents take priority
// over every other detection so the UI can switch to empathy mode and remove
// task / streak pressure (spec §17 + product brief).

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

export type SleepSeverity = 'mild' | 'severe';
export type StressLevel = 'medium' | 'high';
export type Mood = 'low' | 'great';

export type Intent =
  // Emotional / contextual states (handled with empathy first, plan second)
  | { kind: 'emotional_crisis'; cue: string }
  | { kind: 'low_mood' }
  | { kind: 'feeling_great' }
  // Recovery / lifestyle signals that adapt today's plan
  | { kind: 'alcohol' }
  | { kind: 'poor_sleep'; severity: SleepSeverity }
  | { kind: 'high_stress'; level: StressLevel }
  | { kind: 'sore'; bodyPart: BodyPart | null }
  | { kind: 'busy_week' }
  | { kind: 'travel' }
  | { kind: 'period_started' }
  // Existing (kept)
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
  [/cuma/i, 'friday'],
  [/pazar/i, 'sunday'],
];

const BODY_PART_PATTERNS: Array<[RegExp, BodyPart]> = [
  [/(omuz|omz[ua])/i, 'shoulder'],
  [/(\bbel\b|alt sırt|alt sirt)/i, 'lower-back'],
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

// ─── New: emotional + lifestyle patterns ─────────────────────────────────────

// Loss / grief / suicidal ideation / severe depression. Handled with empathy
// first; the app suppresses task pressure on detect.
const CRISIS_RX =
  /(kaybett(ik|im)|öldü|oldu \(vefat\)|vefat|cenaze|matem|yas tutuyor|yas tut|depresyon|depresif|kendimi çok kötü hissediyor|hayatım bitti|yaşayamıyor|intihar|canıma kıy|canima kiy)/i;

// "I feel bad / down / sad" without an explicit loss cue.
const LOW_MOOD_RX =
  /(kötüyüm|kotuyum|kötü hissediyor|kotu hissediyor|berbat hissediyor|moralim bozuk|moralim çok düşük|mutsuzum|içim sıkkın|icim sikkin|ağlamak istiyor|aglamak istiyor|umutsuzum|kendimi kötü|kendimi kotu)/i;

const FEELING_GREAT_RX =
  /(harikayım|harikayim|enerjim yüksek|enerjim yuksek|çok iyiyim|cok iyiyim|formdayım|formdayim|süperim|superim|mükemmel hissediyor|mukemmel hissediyor)/i;

// Alcohol / party indicators (incl. spelling variants). Triggers recovery mode.
const ALCOHOL_RX =
  /(alkol|içki|icki|içtim|ictim|şarap|sarap|bira|kokteyl|kafayı buldum|kafayi buldum|sarhoş|sarhos|akşamdan kalma|aksamdan kalma|hangover|partiye gittim|partideydim|gece dışarı çıktım|gece disari ciktim)/i;

// Sleep cues. Severity bumps when explicit < 5h or "hardly slept".
const POOR_SLEEP_RX =
  /(az uyu|kötü uyu|kotu uyu|uyuyamad|uyku kaçtı|uyku kacti|uykusuzum|geç yattım|gec yattim|gece geç yat|gece gec yat|uykum bölün|uykum bolun)/i;
const SEVERE_SLEEP_RX =
  /(hiç uyumad|hic uyumad|2 saat|3 saat|4 saat|sabaha kadar|sabaha karşı yat|sabaha karsi yat|gece [1234] (de|te)|gözüm kapanmad|gozum kapanmad)/i;

const HIGH_STRESS_RX =
  /(stresliyim|çok stresli|cok stresli|gerginim|sinir(li)?yim|bunaldım|bunaldim|baş edemiyorum|bas edemiyorum|patladım|patladim|tükendim|tukendim|burnout|kafam çok dolu|kafam cok dolu)/i;
const EXTREME_STRESS_RX =
  /(çok bunaldım|cok bunaldim|nefes alamıyor|nefes alamiyor|kriz geçiriyor|kriz geciriyor|panik|delirec|delirek)/i;

const SORE_RX =
  /(kaslarım ağrı|kaslarim agri|tutulmuşum|tutulmusum|dünkü antrenman.*ağr|dunku antrenman.*agr|kas ağrısı|kas agrisi|sertleşmiş|sertlesmis|toparlanamadım|toparlanamadim|ağır geldi|agir geldi)/i;

const BUSY_WEEK_RX =
  /(işim çok yoğun|isim cok yogun|bu hafta çok dolu|bu hafta cok dolu|bu hafta çok meşgul|bu hafta cok mesgul|deadlin|teslim|sınav haftası|sinav haftasi|maraton hafta)/i;

const TRAVEL_RX =
  /(tatile|seyahat|yola çıkıyor|yola cikiyor|uçağa biniyor|ucaga biniyor|otelde|kampa|izindeyim|izine çıktım|izine ciktim|şehir dışında|sehir disinda)/i;

const PERIOD_STARTED_RX =
  /(reglim başladı|reglim basladi|adetim başladı|adetim basladi|adet oldum|regl oldum|kanama başladı|kanama basladi)/i;

// ─── Existing patterns (with subtle widening) ────────────────────────────────

const TIRED_RX =
  /(yorgun|halsız|halsiz|bitkin|enerjim yok|enerjim düşük|enerjim dusuk|takatim yok|mecalim yok)/i;
const WEEK_SCOPE_RX = /(bu hafta|haftalık|haftalik|tüm hafta|tum hafta|hafta boyunca)/i;
const SWEET_RX =
  /(canım tatlı|canim tatli|tatlı istiyor|tatli istiyor|şeker çek|seker cek|çikolata istiyor|cikolata istiyor)/i;
const INJURY_RX = /(ağrıyor|agriyor|acıyor|aciyor|tutuldu|zorland|sancı|sanci|sakatland|sakatlandım)/i;
const OVERATE_RX =
  /(çok yedim|cok yedim|fazla yedim|abartt|tıkın|tikin|kaçırdım sınır|kacirdim sinir|açıldım|acildim)/i;
const MISSED_RX =
  /(derse girmedim|antrenmana gitmedim|atlad(ım|im)|kaçırd(ım|im)|kacird(ım|im)|yapamad(ım|im))/i;
const RESCHEDULE_RX =
  /(yapamam|erteleyelim|ertele|sonraya|taşıyalım|tasiyalim|kaydıralım|kaydiralim|bu gün olmaz|bugün olmaz|bugun olmaz)/i;
const FOCUS_RX =
  /(yoğunlaş|yogunlas|odaklan|istiyorum|yapalım|yapalim|yapmak istiyorum|hadi|yap)/i;
const QUESTION_CYCLE_RX =
  /(hangi faz|döngüm|dongum|faz nedir|luteal|foliküler|folikuler|ovülasyon|ovulasyon|\badet\b)/i;
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
 * common Turkish variants with and without diacritics.
 *
 * Priority order (highest first):
 *   1. Emotional crisis  (overrides everything — empathy mode)
 *   2. Period started    (cycle reset signal)
 *   3. Acute lifestyle   (alcohol, severe sleep deficit, extreme stress)
 *   4. Travel / busy week
 *   5. Soreness / injury
 *   6. Tiredness / location / mood-low / feeling-great
 *   7. Sweet craving / overate / reschedule / missed
 *   8. Workout-type focus
 *   9. Generic questions
 */
export function detectIntent(raw: string): Intent {
  const text = raw.trim();
  if (text.length === 0) return { kind: 'none' };

  // 1. Emotional crisis — highest priority. Plan changes are secondary; the
  //    UI will switch to empathy mode and lift task / streak pressure.
  if (CRISIS_RX.test(text)) return { kind: 'emotional_crisis', cue: extractCue(text) };

  // 2. Period started — useful as a cycle signal even alongside other cues.
  if (PERIOD_STARTED_RX.test(text)) return { kind: 'period_started' };

  // 3. Acute lifestyle signals (alcohol / poor sleep / high stress).
  if (ALCOHOL_RX.test(text)) return { kind: 'alcohol' };
  if (SEVERE_SLEEP_RX.test(text)) return { kind: 'poor_sleep', severity: 'severe' };
  if (POOR_SLEEP_RX.test(text)) return { kind: 'poor_sleep', severity: 'mild' };
  if (EXTREME_STRESS_RX.test(text)) return { kind: 'high_stress', level: 'high' };
  if (HIGH_STRESS_RX.test(text)) return { kind: 'high_stress', level: 'medium' };

  // 4. Travel / busy week.
  if (TRAVEL_RX.test(text)) return { kind: 'travel' };
  if (BUSY_WEEK_RX.test(text)) return { kind: 'busy_week' };

  // 5. Soreness from previous training (different from injury — DOMS).
  if (SORE_RX.test(text)) {
    return { kind: 'sore', bodyPart: findFirst(text, BODY_PART_PATTERNS) };
  }

  // Acute injury (with an ache word + body part or generic).
  if (INJURY_RX.test(text)) {
    const part = findFirst(text, BODY_PART_PATTERNS) ?? 'other';
    return { kind: 'injury', bodyPart: part };
  }

  // 6. Location / tiredness / mood.
  const location = findFirst(text, LOCATION_PATTERNS);
  if (location) return { kind: 'location_change', location };

  if (FEELING_GREAT_RX.test(text)) return { kind: 'feeling_great' };
  // Low mood comes after crisis (which already returned above) so we only
  // catch generic-bad-feeling here.
  if (LOW_MOOD_RX.test(text)) return { kind: 'low_mood' };

  if (TIRED_RX.test(text)) {
    return { kind: 'tired', scope: WEEK_SCOPE_RX.test(text) ? 'week' : 'day' };
  }

  // 7. Eating / scheduling.
  if (OVERATE_RX.test(text)) return { kind: 'overate' };
  if (SWEET_RX.test(text)) return { kind: 'sweet_craving' };
  if (RESCHEDULE_RX.test(text)) {
    const day = findFirst(text, DAY_PATTERNS);
    return { kind: 'reschedule', day };
  }
  if (MISSED_RX.test(text)) return { kind: 'missed_session' };

  // 8. Workout-type focus.
  const workoutType = findFirst(text, WORKOUT_PATTERNS);
  if (workoutType && (FOCUS_RX.test(text) || text.split(/\s+/).length <= 4)) {
    return { kind: 'focus', type: workoutType };
  }

  // 9. Generic questions.
  if (QUESTION_CYCLE_RX.test(text)) return { kind: 'question_cycle' };
  if (QUESTION_WORKOUT_RX.test(text)) return { kind: 'question_workout' };

  return { kind: 'none' };
}

/** Extract a short snippet for crisis cues — used only for system-prompt context. */
function extractCue(text: string): string {
  const trimmed = text.length > 80 ? text.slice(0, 77) + '…' : text;
  return trimmed;
}

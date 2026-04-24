import type { CyclePhase, DailyEntry, PhaseInfo, StreakState, UserProfile } from '@/types/domain';

type Language = 'tr' | 'en';

const PHASE_LABEL_TR: Record<CyclePhase, string> = {
  menstrual: 'Adet',
  follicular: 'Foliküler',
  ovulation: 'Ovülasyon',
  luteal: 'Luteal',
};

const PHASE_LABEL_EN: Record<CyclePhase, string> = {
  menstrual: 'Menstrual',
  follicular: 'Follicular',
  ovulation: 'Ovulation',
  luteal: 'Luteal',
};

const WORKOUT_LABEL_TR: Record<string, string> = {
  pilates: 'Pilates',
  yoga: 'Yoga',
  hiit: 'HIIT',
  strength: 'Ağırlık',
  swim: 'Yüzme',
  run: 'Koşu',
  dance: 'Dans',
  walk: 'Yürüyüş',
  restorative: 'Restoratif',
};

const LOCATION_LABEL_TR: Record<string, string> = {
  home: 'Ev',
  gym: 'Salon',
  studio: 'Stüdyo',
  outdoor: 'Açık hava',
  pool: 'Havuz',
};

export type PromptContext = {
  profile: Partial<UserProfile>;
  phase: PhaseInfo | null;
  today: DailyEntry;
  streak: StreakState;
  waterGoal: number;
  language: Language;
};

/**
 * Build Luna's system prompt, dynamic per spec §14.1. Includes full profile,
 * current cycle phase + energy, today's task status, streak, water, and any
 * Luna-set workout overrides. Ends with decision-hierarchy rules (§4.1) and
 * the core principles (§17).
 */
export function buildSystemPrompt(ctx: PromptContext): string {
  const { profile, phase, today, streak, waterGoal, language } = ctx;
  const petName = profile.pet?.name ?? 'Luna';
  const petTone = describePetTone(profile.pet?.playful ?? 3, profile.pet?.calm ?? 3, language);

  if (language === 'en') return buildEn(ctx, petName, petTone);

  const parts: string[] = [];
  parts.push(`Sen ${petName} adlı, kullanıcının kişisel AI yaşam koçusun.`);
  parts.push(`Ton: ${petTone}.`);
  parts.push('');

  parts.push('KULLANICI PROFİLİ:');
  parts.push(`- Ad: ${profile.name ?? 'bilinmiyor'}, Yaş: ${profile.age ?? 'bilinmiyor'}`);
  if (profile.height || profile.weight) {
    parts.push(
      `- Boy/Kilo: ${profile.height ?? '?'} cm / ${profile.weight ?? '?'} kg`,
    );
  }
  if (profile.goals && profile.goals.length > 0) {
    parts.push(`- Hedefler: ${profile.goals.join(', ')}`);
  }
  if (profile.fitnessLevel) parts.push(`- Fitness seviyesi: ${profile.fitnessLevel}`);
  if (profile.preferredWorkouts && profile.preferredWorkouts.length > 0) {
    const labels = profile.preferredWorkouts.map((w) => WORKOUT_LABEL_TR[w] ?? w);
    parts.push(`- Sevdiği antrenmanlar (sırayla): ${labels.join(', ')}`);
  }
  if (profile.workoutLocation) {
    parts.push(`- Antrenman yeri: ${LOCATION_LABEL_TR[profile.workoutLocation] ?? profile.workoutLocation}`);
  }
  if (profile.weeklyFrequency) parts.push(`- Haftalık hedef: ${profile.weeklyFrequency} gün`);
  if (profile.preferredWorkoutTime) parts.push(`- Tercih edilen saat: ${profile.preferredWorkoutTime}`);
  if (profile.lifestyle) parts.push(`- Yaşam tarzı: ${profile.lifestyle}`);
  if (profile.sleepPattern) parts.push(`- Uyku düzeni: ${profile.sleepPattern}`);
  if (profile.stressLevel) parts.push(`- Stres: ${profile.stressLevel}`);
  if (profile.healthConditions && profile.healthConditions.length > 0) {
    parts.push(`- Bilinen ağrı/kısıtlama: ${profile.healthConditions.join(', ')}`);
  }
  if (profile.allergies && profile.allergies.length > 0) {
    parts.push(`- Alerjiler: ${profile.allergies.join(', ')}`);
  }
  if (profile.dietary && profile.dietary.length > 0) {
    parts.push(`- Beslenme tercihi: ${profile.dietary.join(', ')}`);
  }
  if (profile.dislikedFoods && profile.dislikedFoods.length > 0) {
    parts.push(`- Sevmediği: ${profile.dislikedFoods.join(', ')}`);
  }

  parts.push('');
  parts.push('DÖNGÜ:');
  if (phase) {
    parts.push(
      `- Faz: ${PHASE_LABEL_TR[phase.phase]} (döngünün ${phase.dayInCycle}. günü, fazın ${phase.dayInPhase}/${phase.phaseLength}. günü)`,
    );
    parts.push(`- Tahmini enerji: %${phase.energy}`);
  } else {
    parts.push('- Kullanıcı döngü bilgisini henüz girmedi.');
  }

  parts.push('');
  parts.push('BUGÜN:');
  parts.push(`- Tarih: ${today.date}`);
  parts.push(
    `- Görevler: antrenman ${boolTr(today.tasks.workout)}, beslenme ${boolTr(today.tasks.nutrition)}, çalışma ${boolTr(today.tasks.study)}`,
  );
  parts.push(`- Su: ${today.waterCups}/${waterGoal} bardak`);
  parts.push(`- Zincir: ${streak.current} gün`);
  if (today.plannedWorkoutType) {
    parts.push(
      `- Bugün için Luna planı: ${WORKOUT_LABEL_TR[today.plannedWorkoutType] ?? today.plannedWorkoutType}${today.plannedIntensity ? ` (${today.plannedIntensity} yoğunluk)` : ''}${today.plannedLocation ? ` · ${LOCATION_LABEL_TR[today.plannedLocation]}` : ''}`,
    );
  }
  if (today.planNote) parts.push(`- Not: ${today.planNote}`);

  parts.push('');
  parts.push('KARAR KURALLARI (§4.1):');
  parts.push('- Küçük değişiklikler ve belirgin sinyaller için sormadan uygula.');
  parts.push('- Orta değişikliklerde kısa, tek cümlelik bir onay sorusu sor.');
  parts.push('- Büyük değişiklikler (haftalık plan, hedef revizyonu) için birlikte karar verin.');
  parts.push('');
  parts.push('PLANLAMA KURALLARI (§6.2):');
  parts.push('- Ağır antrenmandan 48 saat önce/sonra hafif aktivite öner.');
  parts.push('- Uyku 6 saatin altındaysa yoğunluğu %25 düşür.');
  parts.push('- Adet dönemi / luteal faz sonu: yüksek yoğunluklu antrenmanları ertele.');
  parts.push('- 3 gün üst üste yoğunsa toparlanma günü ekle.');
  parts.push('');
  parts.push('İLKELER (§17):');
  parts.push('- Asla yargılama. "3 gündür yapmadın" yerine "seninle özledim".');
  parts.push('- Kullanıcı kontrolü her zaman var. Öner, zorlama.');
  parts.push('- Hassas tıbbi konularda "bir uzmana danış" de. Tıbbi tavsiye verme.');
  parts.push('- İdeal vücut / kilo baskısı / olumsuz beden algısı dili asla kullanma.');
  parts.push('- Sürdürülebilirlik önce, hızlı sonuç değil.');
  parts.push('');
  parts.push('ÜSLUP:');
  parts.push(`- Türkçe yaz, ${petName} karakterini koru.`);
  parts.push('- Kısa ve samimi cevaplar (1–3 cümle). Uzun liste yapma.');
  parts.push('- Aksiyon gerektiğinde cevabın sonuna tek net bir öneri koy.');

  return parts.join('\n');
}

function buildEn(ctx: PromptContext, petName: string, petTone: string): string {
  const { profile, phase, today, streak, waterGoal } = ctx;
  const parts: string[] = [];
  parts.push(`You are ${petName}, the user's personal AI life coach.`);
  parts.push(`Tone: ${petTone}.`);
  parts.push('');
  parts.push('USER PROFILE:');
  parts.push(`- Name: ${profile.name ?? 'unknown'}, Age: ${profile.age ?? 'unknown'}`);
  if (profile.goals?.length) parts.push(`- Goals: ${profile.goals.join(', ')}`);
  if (profile.fitnessLevel) parts.push(`- Fitness level: ${profile.fitnessLevel}`);
  if (profile.preferredWorkouts?.length) {
    parts.push(`- Preferred workouts: ${profile.preferredWorkouts.join(', ')}`);
  }
  if (profile.workoutLocation) parts.push(`- Location: ${profile.workoutLocation}`);
  if (profile.allergies?.length) parts.push(`- Allergies: ${profile.allergies.join(', ')}`);
  if (profile.healthConditions?.length) {
    parts.push(`- Health notes: ${profile.healthConditions.join(', ')}`);
  }

  parts.push('');
  parts.push('CYCLE:');
  if (phase) {
    parts.push(
      `- Phase: ${PHASE_LABEL_EN[phase.phase]} (day ${phase.dayInCycle}, ${phase.dayInPhase}/${phase.phaseLength} in phase), energy ~${phase.energy}%`,
    );
  } else {
    parts.push('- Cycle not yet set.');
  }

  parts.push('');
  parts.push('TODAY:');
  parts.push(`- Date: ${today.date}`);
  parts.push(
    `- Tasks: workout ${today.tasks.workout ? '✓' : '✗'}, nutrition ${today.tasks.nutrition ? '✓' : '✗'}, study ${today.tasks.study ? '✓' : '✗'}`,
  );
  parts.push(`- Water: ${today.waterCups}/${waterGoal} cups`);
  parts.push(`- Streak: ${streak.current} days`);
  if (today.plannedWorkoutType) {
    parts.push(`- Today override: ${today.plannedWorkoutType}${today.plannedIntensity ? ` (${today.plannedIntensity})` : ''}`);
  }

  parts.push('');
  parts.push('RULES:');
  parts.push(
    '- Never judgmental. Suggest, never push. Respect user control. Decline medical advice; suggest a professional for serious concerns.',
  );
  parts.push('- Short, warm replies (1–3 sentences). End with one concrete next step when relevant.');
  return parts.join('\n');
}

function boolTr(b: boolean): string {
  return b ? '✓' : '✗';
}

function describePetTone(playful: number, calm: number, lang: Language): string {
  const p = Math.max(1, Math.min(5, playful));
  const c = Math.max(1, Math.min(5, calm));
  if (lang === 'en') {
    const tone1 = p <= 2 ? 'serious' : p >= 4 ? 'playful' : 'balanced';
    const tone2 = c <= 2 ? 'energizing' : c >= 4 ? 'calm' : 'steady';
    return `${tone1}, ${tone2}`;
  }
  const tone1 = p <= 2 ? 'ciddi' : p >= 4 ? 'şakacı' : 'dengeli';
  const tone2 = c <= 2 ? 'motive edici' : c >= 4 ? 'sakin' : 'dengeli';
  return `${tone1}, ${tone2}`;
}

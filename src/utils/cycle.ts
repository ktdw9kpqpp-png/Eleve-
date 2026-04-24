import type { CyclePhase, PhaseInfo } from '@/types/domain';

const PHASE_ENERGY: Record<CyclePhase, number> = {
  menstrual: 30,
  follicular: 70,
  ovulation: 100,
  luteal: 55,
};

/** Phase window end-days (inclusive), per spec §7.1. */
const MENSTRUAL_END = 5;
const FOLLICULAR_END = 13;
const OVULATION_END = 16;

/** YYYY-MM-DD in device-local time. */
export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayIso(): string {
  return toIsoDate(new Date());
}

export function parseIsoDate(iso: string): Date {
  const parts = iso.split('-').map((x) => Number(x));
  const y = parts[0] ?? 1970;
  const m = parts[1] ?? 1;
  const d = parts[2] ?? 1;
  return new Date(y, m - 1, d);
}

function daysBetween(from: Date, to: Date): number {
  const MS = 24 * 60 * 60 * 1000;
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();
  return Math.floor((b - a) / MS);
}

export function yesterdayIso(fromIso?: string): string {
  const base = fromIso ? parseIsoDate(fromIso) : new Date();
  base.setDate(base.getDate() - 1);
  return toIsoDate(base);
}

/**
 * Compute the cycle-phase info for `today` given the user's last period start
 * and average cycle length. Phase windows follow spec §7.1 and are clamped for
 * shorter cycles so the luteal window is at least 1 day.
 */
export function computePhase(params: {
  lastPeriodStart: string;
  averageCycleDays: number;
  today?: Date;
}): PhaseInfo {
  const cycleLength = Math.max(21, Math.min(40, params.averageCycleDays));
  const lastPeriod = parseIsoDate(params.lastPeriodStart);
  const now = params.today ?? new Date();
  const elapsed = daysBetween(lastPeriod, now);
  // Wrap into the current cycle; dayInCycle is 1-based.
  const wrapped = ((elapsed % cycleLength) + cycleLength) % cycleLength;
  const dayInCycle = wrapped + 1;

  let phase: CyclePhase;
  let phaseStart: number;
  let phaseEnd: number;
  if (dayInCycle <= MENSTRUAL_END) {
    phase = 'menstrual';
    phaseStart = 1;
    phaseEnd = MENSTRUAL_END;
  } else if (dayInCycle <= FOLLICULAR_END) {
    phase = 'follicular';
    phaseStart = MENSTRUAL_END + 1;
    phaseEnd = FOLLICULAR_END;
  } else if (dayInCycle <= OVULATION_END) {
    phase = 'ovulation';
    phaseStart = FOLLICULAR_END + 1;
    phaseEnd = OVULATION_END;
  } else {
    phase = 'luteal';
    phaseStart = OVULATION_END + 1;
    phaseEnd = cycleLength;
  }

  return {
    phase,
    dayInCycle,
    dayInPhase: dayInCycle - phaseStart + 1,
    phaseLength: phaseEnd - phaseStart + 1,
    energy: PHASE_ENERGY[phase],
    cycleLength,
  };
}

export function phaseEnergy(phase: CyclePhase): number {
  return PHASE_ENERGY[phase];
}

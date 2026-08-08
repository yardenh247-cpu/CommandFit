export type FitnessStandard = {
  id: string;
  year: number;
  battalion: string;
  test: string;
  metric: string;
  population?: string;
  startThreshold?: string | number;
  endThreshold?: string | number;
  excellenceThreshold?: string | number;
  isActive: boolean;
};

export const fitnessStandards: FitnessStandard[] = [
  // גפן - כש"ג סוף - סף אחיד
  { id: "gefen-3km", year: 2026, battalion: "גפן", test: 'כש"ג סוף', metric: '3 ק"מ', endThreshold: "12:40", excellenceThreshold: "10:57", isActive: true },
  { id: "gefen-150x2", year: 2026, battalion: "גפן", test: 'כש"ג סוף', metric: "2×150", endThreshold: "00:53", excellenceThreshold: "00:43", isActive: true },
  { id: "gefen-pullups", year: 2026, battalion: "גפן", test: 'כש"ג סוף', metric: 'מתח 15 ק"ג', endThreshold: 8, excellenceThreshold: 15, isActive: true },
  { id: "gefen-chest", year: 2026, battalion: "גפן", test: 'כש"ג סוף', metric: "לחיצת חזה 60 ק״ג", endThreshold: 7, excellenceThreshold: 15, isActive: true },
  { id: "gefen-trap", year: 2026, battalion: "גפן", test: 'כש"ג סוף', metric: "טראפבר 90 ק״ג", endThreshold: 7, excellenceThreshold: 10, isActive: true },

  // דקל - שריון+הנדסה
  { id: "dekel-armor-3km", year: 2026, battalion: "דקל", population: "רמה 1", test: 'כש"ג סוף', metric: '3 ק"מ', endThreshold: "14:00", excellenceThreshold: "10:57", isActive: true },
  { id: "dekel-armor-150x2", year: 2026, battalion: "דקל", population: "רמה 1", test: 'כש"ג סוף', metric: "2×150", endThreshold: "00:58", excellenceThreshold: "00:43", isActive: true },
  { id: "dekel-armor-pullups", year: 2026, battalion: "דקל", population: "רמה 1", test: 'כש"ג סוף', metric: "מתח", endThreshold: 7, excellenceThreshold: 15, isActive: true },
  { id: "dekel-armor-push", year: 2026, battalion: "דקל", population: "רמה 1", test: 'כש"ג סוף', metric: "מקבילים", endThreshold: 11, excellenceThreshold: 20, isActive: true },
  { id: "dekel-armor-trap", year: 2026, battalion: "דקל", population: "רמה 1", test: 'כש"ג סוף', metric: "טראפבר", endThreshold: 7, excellenceThreshold: 10, isActive: true },

  // דקל - חי"ר
  { id: "dekel-infantry-3km", year: 2026, battalion: "דקל", population: "רמה 2", test: 'כש"ג סוף', metric: '3 ק"מ', endThreshold: "12:50", excellenceThreshold: "10:57", isActive: true },
  { id: "dekel-infantry-150x2", year: 2026, battalion: "דקל", population: "רמה 2", test: 'כש"ג סוף', metric: "2×150", endThreshold: "00:55", excellenceThreshold: "00:43", isActive: true },
  { id: "dekel-infantry-pullups", year: 2026, battalion: "דקל", population: "רמה 2", test: 'כש"ג סוף', metric: "מתח", endThreshold: 7, excellenceThreshold: 15, isActive: true },
  { id: "dekel-infantry-push", year: 2026, battalion: "דקל", population: "רמה 2", test: 'כש"ג סוף', metric: "לחיצת חזה", endThreshold: 5, excellenceThreshold: 15, isActive: true },
  { id: "dekel-infantry-trap", year: 2026, battalion: "דקל", population: "רמה 2", test: 'כש"ג סוף', metric: "טראפבר", endThreshold: 5, excellenceThreshold: 10, isActive: true },

  // דקל - מיוחדות
  { id: "dekel-special-3km", year: 2026, battalion: "דקל", population: "רמה 3", test: 'כש"ג סוף', metric: '3 ק"מ', endThreshold: "12:40", excellenceThreshold: "10:57", isActive: true },
  { id: "dekel-special-150x2", year: 2026, battalion: "דקל", population: "רמה 3", test: 'כש"ג סוף', metric: "2×150", endThreshold: "00:53", excellenceThreshold: "00:43", isActive: true },
  { id: "dekel-special-pullups", year: 2026, battalion: "דקל", population: "רמה 3", test: 'כש"ג סוף', metric: "מתח", endThreshold: 8, excellenceThreshold: 15, isActive: true },
  { id: "dekel-special-push", year: 2026, battalion: "דקל", population: "רמה 3", test: 'כש"ג סוף', metric: "לחיצת חזה", endThreshold: 7, excellenceThreshold: 15, isActive: true },
  { id: "dekel-special-trap", year: 2026, battalion: "דקל", population: "רמה 3", test: 'כש"ג סוף', metric: "טראפבר", endThreshold: 7, excellenceThreshold: 10, isActive: true },

  // רימון - שריון+הנדסה
  { id: "rimon-armor-3km", year: 2026, battalion: "רימון", population: "רמה 1", test: 'כש"ג סוף', metric: '3 ק"מ', endThreshold: "14:00", excellenceThreshold: "10:57", isActive: true },
  { id: "rimon-armor-150x2", year: 2026, battalion: "רימון", population: "רמה 1", test: 'כש"ג סוף', metric: "2×150", endThreshold: "00:58", excellenceThreshold: "00:43", isActive: true },
  { id: "rimon-armor-pullups", year: 2026, battalion: "רימון", population: "רמה 1", test: 'כש"ג סוף', metric: "מתח", endThreshold: 7, excellenceThreshold: 15, isActive: true },
  { id: "rimon-armor-push", year: 2026, battalion: "רימון", population: "רמה 1", test: 'כש"ג סוף', metric: "מקבילים", endThreshold: 11, excellenceThreshold: 20, isActive: true },
  { id: "rimon-armor-trap", year: 2026, battalion: "רימון", population: "רמה 1", test: 'כש"ג סוף', metric: "טראפבר", endThreshold: 7, excellenceThreshold: 10, isActive: true },

  // רימון - חי"ר
  { id: "rimon-infantry-3km", year: 2026, battalion: "רימון", population: "רמה 2", test: 'כש"ג סוף', metric: '3 ק"מ', endThreshold: "12:50", excellenceThreshold: "10:57", isActive: true },
  { id: "rimon-infantry-150x2", year: 2026, battalion: "רימון", population: "רמה 2", test: 'כש"ג סוף', metric: "2×150", endThreshold: "00:55", excellenceThreshold: "00:43", isActive: true },
  { id: "rimon-infantry-pullups", year: 2026, battalion: "רימון", population: "רמה 2", test: 'כש"ג סוף', metric: "מתח", endThreshold: 7, excellenceThreshold: 15, isActive: true },
  { id: "rimon-infantry-push", year: 2026, battalion: "רימון", population: "רמה 2", test: 'כש"ג סוף', metric: "לחיצת חזה", endThreshold: 5, excellenceThreshold: 15, isActive: true },
  { id: "rimon-infantry-trap", year: 2026, battalion: "רימון", population: "רמה 2", test: 'כש"ג סוף', metric: "טראפבר", endThreshold: 5, excellenceThreshold: 10, isActive: true },

  // רימון - מיוחדות
  { id: "rimon-special-3km", year: 2026, battalion: "רימון", population: "רמה 3", test: 'כש"ג סוף', metric: '3 ק"מ', endThreshold: "12:40", excellenceThreshold: "10:57", isActive: true },
  { id: "rimon-special-150x2", year: 2026, battalion: "רימון", population: "רמה 3", test: 'כש"ג סוף', metric: "2×150", endThreshold: "00:53", excellenceThreshold: "00:43", isActive: true },
  { id: "rimon-special-pullups", year: 2026, battalion: "רימון", population: "רמה 3", test: 'כש"ג סוף', metric: "מתח", endThreshold: 8, excellenceThreshold: 15, isActive: true },
  { id: "rimon-special-push", year: 2026, battalion: "רימון", population: "רמה 3", test: 'כש"ג סוף', metric: "לחיצת חזה", endThreshold: 7, excellenceThreshold: 15, isActive: true },
  { id: "rimon-special-trap", year: 2026, battalion: "רימון", population: "רמה 3", test: 'כש"ג סוף', metric: "טראפבר", endThreshold: 7, excellenceThreshold: 10, isActive: true },
];

/*
  מיפוי רמות כש"ג בדקל/רימון:
  רמה 1 = שריון + הנדסה
  רמה 2 = חי"ר
  רמה 3 = מיוחדות

  בגפן אין חלוקה לרמות.
*/
export function getStandard(
  year: number,
  battalion: string,
  test: string,
  metric: string,
  population?: string
) {
  return fitnessStandards.find(
    (standard) =>
      standard.year === year &&
      standard.battalion === battalion &&
      standard.test === test &&
      standard.metric === metric &&
      standard.isActive &&
      (
        standard.population === undefined ||
        standard.population === population
      )
  );
}

export function getStandardsForTest(
  year: number,
  battalion: string,
  test: string,
  population?: string
) {
  return fitnessStandards.filter(
    (standard) =>
      standard.year === year &&
      standard.battalion === battalion &&
      standard.test === test &&
      standard.isActive &&
      (
        standard.population === undefined ||
        standard.population === population
      )
  );
}
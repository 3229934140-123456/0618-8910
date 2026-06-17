export const cn = (...classes: (string | false | null | undefined)[]): string => {
  return classes.filter(Boolean).join(' ');
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
};

export const clamp = (num: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, num));
};

export const randomBetween = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

export const randomInt = (min: number, max: number): number => {
  return Math.floor(randomBetween(min, max + 1));
};

export const pickRandom = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

export const pickMultipleRandom = <T>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

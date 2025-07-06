import { CHARS } from './constants.js';

// Spit out random garbage text. Computers are good at this.
export function getRandomText(length: number = 250): string {
    return Array.from({ length }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
}

// Because Math.random() is too much work.
export function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
} 
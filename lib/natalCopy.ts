/**
 * Birth chart wording (drafts, awaiting owner review like every reading text;
 * CONTENT_GUIDELINES.md). Each planet names a part of life; each sign names a
 * style, a gift and a growth area (the "gifts and challenges" framing readers
 * praise in the feature research), so "Venus in Taurus" reads as the topic of
 * Venus expressed in the style of Taurus. Growth areas are invitations, never
 * warnings.
 */
import type { AspectKind, BodyKey } from "./natal";

export const BODY_COPY: Record<BodyKey, { name: string; topic: string }> = {
  sun: { name: "Sun", topic: "Who you are at your core and what lights you up" },
  moon: { name: "Moon", topic: "What you need to feel safe, and how your feelings move" },
  mercury: { name: "Mercury", topic: "How you think, learn and talk" },
  venus: { name: "Venus", topic: "How you love, and what you find beautiful" },
  mars: { name: "Mars", topic: "How you act, compete and go after what you want" },
  jupiter: { name: "Jupiter", topic: "Where you grow, hope and find luck" },
  saturn: { name: "Saturn", topic: "Where you build patience, skill and lasting structure" },
  uranus: { name: "Uranus", topic: "Where you want freedom and do things your own way" },
  neptune: { name: "Neptune", topic: "Where you dream, imagine and feel connected to something larger" },
  pluto: { name: "Pluto", topic: "Where you change deeply and find your inner strength" },
};

/** Indexed by sign (0 = Aries). */
export const SIGN_COPY: Array<{ style: string; gift: string; growth: string }> = [
  { style: "direct, quick and brave, happiest when starting something", gift: "courage to go first", growth: "pausing long enough to bring others along" },
  { style: "steady, patient and sensual, building things that last", gift: "calm reliability", growth: "letting change in before it has to push" },
  { style: "curious, quick-witted and many-sided", gift: "making connections between ideas and people", growth: "staying with one thing long enough to go deep" },
  { style: "caring, protective and guided by feeling", gift: "making people feel at home", growth: "asking for care as easily as you give it" },
  { style: "warm, expressive and generous", gift: "bringing joy and confidence into a room", growth: "trusting you matter even when no one is watching" },
  { style: "careful, practical and helpful", gift: "noticing what needs doing and doing it well", growth: "allowing good enough to be enough" },
  { style: "fair, graceful and drawn to partnership", gift: "seeing every side and finding balance", growth: "saying what you want, not only what keeps the peace" },
  { style: "intense, private and loyal", gift: "depth, focus and staying power", growth: "letting people in before you are sure of them" },
  { style: "open, optimistic and searching for meaning", gift: "widening everyone's horizons", growth: "following through once the excitement fades" },
  { style: "ambitious, responsible and quietly determined", gift: "turning long goals into real results", growth: "resting without needing to earn it" },
  { style: "independent, inventive and thinking of the group", gift: "seeing what could be better for everyone", growth: "staying close when feelings get personal" },
  { style: "gentle, imaginative and deeply empathic", gift: "compassion and creative vision", growth: "keeping clear edges around your energy" },
];

export const HOUSE_TOPIC = [
  "self and first impressions", "money, possessions and what you value", "learning, talking and the neighbourhood",
  "home, family and roots", "creativity, play and romance", "daily work, routines and health habits",
  "partnerships and close one-to-one bonds", "shared resources, trust and deep change", "travel, study and big ideas",
  "career and public life", "friends, groups and hopes", "rest, solitude and the inner life",
];

export const ASPECT_COPY: Record<AspectKind, { name: string; meaning: string }> = {
  conjunction: { name: "conjunction", meaning: "these two work as one, blending their strengths" },
  sextile: { name: "sextile", meaning: "an easy opening between them, there when you reach for it" },
  square: { name: "square", meaning: "a creative tension that pushes you to grow" },
  trine: { name: "trine", meaning: "a natural flow between them, a talent that comes easily" },
  opposition: { name: "opposition", meaning: "two sides to balance, often learned through other people" },
};

export const ORDINAL = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];

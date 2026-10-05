/**
 * Numerology wording (draft, original text, CONTENT_GUIDELINES.md: suggest,
 * never predict; no health or money advice). `core` describes a number as a
 * trait (life path, birthday and name numbers); `cycle` describes a personal
 * year or month (1–9 only).
 */
import type { Lang } from "./i18n";

export const CORE: Record<Lang, Record<number, string>> = {
  en: {
    1: "The starter. You tend to go first, think for yourself and enjoy a fresh path.",
    2: "The partner. You notice how others feel and often do your best work alongside people.",
    3: "The storyteller. Words, play and making things come easily, and you can lift a room.",
    4: "The builder. You like a steady plan, careful work and things that last.",
    5: "The explorer. Change, travel and new people keep you curious and lively.",
    6: "The carer. Home, family and looking after others sit close to your heart.",
    7: "The thinker. You enjoy quiet, good questions and getting to the bottom of things.",
    8: "The organiser. You like to take charge, set goals and see them through.",
    9: "The giver. You care about the wider world and find meaning in helping.",
    11: "Master number 11, the intuitive. A sensitive, inspired version of 2: you often sense things before they are said.",
    22: "Master number 22, the master builder. A version of 4 with big plans: you like turning ideas into something real that others can share.",
    33: "Master number 33, the teacher. A version of 6 with a wide heart: you are drawn to encourage and guide others.",
  },
};

export const CYCLE: Record<Lang, Record<number, string>> = {
  en: {
    1: "A time for beginnings: a good moment to start something of your own.",
    2: "A time for patience and partnership: small steps and kind words go far.",
    3: "A time to express yourself: share ideas, see friends, make something.",
    4: "A time to build: steady effort and good routines tend to pay off.",
    5: "A time for change: say yes to something new and keep plans flexible.",
    6: "A time for home and care: family, friends and promises come first.",
    7: "A time to reflect: rest, read and listen to your own thoughts.",
    8: "A time to take charge: set a clear goal and work towards it.",
    9: "A time to complete: finish, tidy up and let go of what you have outgrown.",
  },
};

// src/state/sessionExpired.js
import { atom } from "jotai";

export const sessionExpiredAtom = atom(false);

export const showSessionExpired = () => {
  return sessionExpiredAtom;
};

// src/utils/validation.js

export function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
export function withinLen(v, max) {
  return (v || "").length <= max;
}
export function required(v) {
  return String(v || "").trim().length > 0;
}
export function zipOk(v) {
  return /^\d{5}(\d{4})?$/.test((v || "").trim());
}

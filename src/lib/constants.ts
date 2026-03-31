/* eslint-disable no-magic-numbers */
export const UI_CONSTANTS = {
  EARTH_RADIUS_KM: 6371,
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  MAX_PROFILE_IMAGE_SIZE: 5 * 1024 * 1024,
  MAX_PROPERTY_IMAGES: 15,
  MAX_CHAT_IMAGES: 5,
  MB_BYTES: 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
  CEBU_CENTER: { lng: 123.891, lat: 10.3157 },
  AUTH_SETTLE_GRACE_MS: 150,
  AUTH_SESSION_TIMEOUT_MS: 10000,
  ANIM_OPACITY_VISIBLE: 1,
  ANIM_DURATION_FAST: 0.2,
  COORDINATE_PRECISION: 6,
  MAP_DEFAULT_LAT: 10.3157,
  MAP_DEFAULT_LNG: 123.891,
  MAP_STYLE_LOAD_DELAY_MS: 300,
} as const;

export const RATING_STEPS = [1, 2, 3, 4, 5];
export const DEFAULT_RATING = 5;
export const MAX_VISIBLE_AMENITIES = 4;
export const AUTO_SCROLL_DELAY = 100;

export const MS_PER_MINUTE = 60000;
export const MINUTES_PER_HOUR = 60;
export const HOURS_PER_DAY = 24;

export const CHART_DELAY_BASE = 0.3;
export const CHART_DELAY_STEP = 0.03;
export const CHART_MIN_OPACITY = 15;
export const PERCENT_BASE = 100;

export const STATS_DELAY_BASE = 0.1;
export const STATS_DELAY_STEP = 0.05;

export const REVIEWS_PER_PAGE = 15;
export const ANIMATION_HOVER_SCALE = 1.01;
export const ANIMATION_TAP_SCALE = 0.98;

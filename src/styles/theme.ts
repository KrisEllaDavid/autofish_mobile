/**
 * AutoFish — token bridge for inline styles.
 *
 * Mirrors src/styles/tokens.css. Values are `var(--x)` strings so a token
 * changed in CSS changes here too: there is still exactly one source of truth.
 * Prefer a class from components.css; use this where a style must be inline.
 */

export const color = {
  brand50: "var(--brand-50)",
  brand100: "var(--brand-100)",
  brand200: "var(--brand-200)",
  brand300: "var(--brand-300)",
  brand400: "var(--brand-400)",
  brand500: "var(--brand-500)",
  brand600: "var(--brand-600)",
  brand700: "var(--brand-700)",
  brand800: "var(--brand-800)",
  brand900: "var(--brand-900)",

  brandA04: "var(--brand-a04)",
  brandA08: "var(--brand-a08)",
  brandA12: "var(--brand-a12)",
  brandA20: "var(--brand-a20)",
  brandA40: "var(--brand-a40)",

  ink900: "var(--ink-900)",
  ink800: "var(--ink-800)",
  ink700: "var(--ink-700)",
  ink600: "var(--ink-600)",
  ink500: "var(--ink-500)",
  ink400: "var(--ink-400)",
  ink300: "var(--ink-300)",
  ink200: "var(--ink-200)",
  ink100: "var(--ink-100)",
  ink50: "var(--ink-50)",

  inkA04: "var(--ink-a04)",
  inkA08: "var(--ink-a08)",
  inkA12: "var(--ink-a12)",
  inkA40: "var(--ink-a40)",
  inkA60: "var(--ink-a60)",

  text: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textTertiary: "var(--text-tertiary)",
  textDisabled: "var(--text-disabled)",
  textPlaceholder: "var(--text-placeholder)",
  textOnBrand: "var(--text-on-brand)",
  textOnDark: "var(--text-on-dark)",
  textLink: "var(--text-link)",
  textAccent: "var(--text-accent)",

  page: "var(--surface-page)",
  card: "var(--surface-card)",
  raised: "var(--surface-raised)",
  sunken: "var(--surface-sunken)",
  field: "var(--surface-field)",
  fieldFocus: "var(--surface-field-focus)",
  inverse: "var(--surface-inverse)",
  surfaceBrand: "var(--surface-brand)",
  surfaceBrandStrong: "var(--surface-brand-strong)",
  surfaceBrandSoft: "var(--surface-brand-soft)",
  scrim: "var(--surface-scrim)",

  borderSubtle: "var(--border-subtle)",
  borderDefault: "var(--border-default)",
  borderStrong: "var(--border-strong)",
  borderFocus: "var(--border-focus)",

  danger: "var(--danger-500)",
  dangerStrong: "var(--danger-600)",
  dangerSoft: "var(--danger-soft)",
  success: "var(--success-500)",
  successStrong: "var(--success-600)",
  successSoft: "var(--success-soft)",
  warning: "var(--warning-500)",
  warningStrong: "var(--warning-600)",
  warningSoft: "var(--warning-soft)",
  info: "var(--info-500)",
  infoStrong: "var(--info-600)",
  infoSoft: "var(--info-soft)",

  like: "var(--like-500)",
  likeSoft: "var(--like-soft)",
  whatsapp: "var(--whatsapp-500)",
  whatsappStrong: "var(--whatsapp-600)",
} as const;

export const space = {
  0: "var(--space-0)",
  1: "var(--space-1)",
  2: "var(--space-2)",
  3: "var(--space-3)",
  4: "var(--space-4)",
  5: "var(--space-5)",
  6: "var(--space-6)",
  7: "var(--space-7)",
  8: "var(--space-8)",
  9: "var(--space-9)",
  10: "var(--space-10)",
  11: "var(--space-11)",
  12: "var(--space-12)",
  13: "var(--space-13)",
  gutter: "var(--gutter)",
} as const;

export const radius = {
  xs: "var(--radius-xs)",
  sm: "var(--radius-sm)",
  md: "var(--radius-md)",
  lg: "var(--radius-lg)",
  xl: "var(--radius-xl)",
  xxl: "var(--radius-2xl)",
  pill: "var(--radius-pill)",
  circle: "var(--radius-circle)",
} as const;

export const font = {
  body: "var(--font-body)",
  display: "var(--font-display)",
} as const;

export const text = {
  xxs: "var(--text-2xs)",
  xs: "var(--text-xs)",
  sm: "var(--text-sm)",
  base: "var(--text-base)",
  md: "var(--text-md)",
  lg: "var(--text-lg)",
  xl: "var(--text-xl)",
  xxl: "var(--text-2xl)",
  xxxl: "var(--text-3xl)",
  display: "var(--text-display)",
} as const;

export const leading = {
  tight: "var(--leading-tight)",
  snug: "var(--leading-snug)",
  normal: "var(--leading-normal)",
  relaxed: "var(--leading-relaxed)",
} as const;

export const tracking = {
  tight: "var(--tracking-tight)",
  snug: "var(--tracking-snug)",
  normal: "var(--tracking-normal)",
  wide: "var(--tracking-wide)",
} as const;

export const weight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export const shadow = {
  xs: "var(--shadow-xs)",
  sm: "var(--shadow-sm)",
  md: "var(--shadow-md)",
  lg: "var(--shadow-lg)",
  xl: "var(--shadow-xl)",
  brand: "var(--shadow-brand)",
  focusRing: "var(--focus-ring)",
} as const;

export const motion = {
  easeOut: "var(--ease-out)",
  easeInOut: "var(--ease-in-out)",
  spring: "var(--ease-spring)",
  press: "var(--dur-press)",
  fast: "var(--dur-fast)",
  base: "var(--dur-base)",
  slow: "var(--dur-slow)",
  sheet: "var(--dur-sheet)",
} as const;

export const layout = {
  safeTop: "var(--safe-top)",
  safeRight: "var(--safe-right)",
  safeBottom: "var(--safe-bottom)",
  safeLeft: "var(--safe-left)",
  headerH: "var(--header-h)",
  headerTotal: "var(--header-total)",
  tabbarH: "var(--tabbar-h)",
  tabbarTotal: "var(--tabbar-total)",
  tabbarClearance: "var(--tabbar-clearance)",
  contentMax: "var(--content-max)",
  readingMax: "var(--reading-max)",
  tapMin: "var(--tap-min)",
} as const;

export const z = {
  base: "var(--z-base)",
  raised: "var(--z-raised)",
  sticky: "var(--z-sticky)",
  header: "var(--z-header)",
  tabbar: "var(--z-tabbar)",
  overlay: "var(--z-overlay)",
  sheet: "var(--z-sheet)",
  modal: "var(--z-modal)",
  toast: "var(--z-toast)",
} as const;

export const theme = {
  color,
  space,
  radius,
  font,
  text,
  leading,
  tracking,
  weight,
  shadow,
  motion,
  layout,
  z,
} as const;

export default theme;

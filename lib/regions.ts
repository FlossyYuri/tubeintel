/** Países prioritários (US, BR) — botões ou primeiros no select */
export const PRIMARY_REGIONS = [
  { value: "US", label: "🇺🇸 Estados Unidos", flag: "🇺🇸", name: "Estados Unidos" },
  { value: "BR", label: "🇧🇷 Brasil", flag: "🇧🇷", name: "Brasil" },
];

/** Países secundários (dropdown "Outros países") */
export const OTHER_REGIONS = [
  { value: "PT", label: "🇵🇹 Portugal" },
  { value: "GB", label: "🇬🇧 Reino Unido" },
  { value: "ES", label: "🇪🇸 Espanha" },
  { value: "FR", label: "🇫🇷 França" },
  { value: "AO", label: "🇦🇴 Angola" },
  { value: "MZ", label: "🇲🇿 Moçambique" },
];

/** Todas as regiões (search, channels) */
export const ALL_REGIONS = [
  ...PRIMARY_REGIONS.map(({ value, label }) => ({ value, label })),
  ...OTHER_REGIONS,
];

/** Regiões suportadas pelo trending (mostPopular): US, BR, PT, GB apenas */
export const TRENDING_REGIONS = [
  ...PRIMARY_REGIONS,
  { value: "PT", label: "🇵🇹 Portugal", flag: "🇵🇹", name: "Portugal" },
  { value: "GB", label: "🇬🇧 Reino Unido", flag: "🇬🇧", name: "Reino Unido" },
];

/** Regiões para selects (US, BR primeiro, depois outros) */
export const SELECT_REGIONS = [
  ...PRIMARY_REGIONS.map(({ value, label }) => ({ value, label })),
  ...OTHER_REGIONS,
];

/** Regiões para selects em páginas que usam trending (4 países apenas) */
export const TRENDING_SELECT_REGIONS = TRENDING_REGIONS.map(({ value, label }) => ({
  value,
  label,
}));

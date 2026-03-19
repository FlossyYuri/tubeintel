export const CATEGORY_NAMES: Record<string, string> = {
  "0": "Todos",
  "1": "Film & Animation",
  "2": "Autos & Vehicles",
  "10": "Música",
  "15": "Pets & Animals",
  "17": "Sports",
  "19": "Travel & Events",
  "20": "Gaming",
  "22": "People & Blogs",
  "23": "Comédia",
  "24": "Entretenimento",
  "25": "Notícias",
  "26": "How-to & Style",
  "27": "Educação",
  "28": "Ciência & Tecnologia",
};

/** Opções para selects de categoria (value/label) */
export const YOUTUBE_CATEGORY_OPTIONS = [
  { value: "", label: "Todas" },
  ...Object.entries(CATEGORY_NAMES)
    .filter(([k]) => k !== "0")
    .map(([value, label]) => ({ value, label })),
];

/** Opções para botões de categoria (id/name) */
export const YOUTUBE_CATEGORY_BUTTONS = [
  { id: "0", name: "Todos" },
  ...Object.entries(CATEGORY_NAMES)
    .filter(([k]) => k !== "0")
    .map(([id, name]) => ({ id, name })),
];

export function getCategoryName(categoryId?: string): string {
  if (!categoryId) return "";
  return CATEGORY_NAMES[categoryId] ?? categoryId;
}

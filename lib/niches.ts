export interface Niche {
  icon: string;
  name: string;
  keywords: string;
  trend: string;
  up: boolean;
  category?: string;
}

export const NICHES: Niche[] = [
  // Formatos
  { icon: "🎙️", name: "Podcasts", keywords: "podcast entrevista conversa", trend: "+35%", up: true, category: "Formatos" },
  { icon: "📺", name: "Streamers", keywords: "live stream gameplay react", trend: "+28%", up: true, category: "Formatos" },
  { icon: "📹", name: "Vlogs", keywords: "vlog dia a dia rotina", trend: "+18%", up: true, category: "Formatos" },
  { icon: "⚡", name: "Shorts", keywords: "shorts viral rápido", trend: "+42%", up: true, category: "Formatos" },
  // Curiosidades
  { icon: "🤔", name: "Curiosidades", keywords: "curiosidades factos interessante", trend: "+22%", up: true, category: "Curiosidades" },
  { icon: "📊", name: "Factos", keywords: "factos dados estatísticas", trend: "+19%", up: true, category: "Curiosidades" },
  { icon: "🔮", name: "Mistérios", keywords: "mistério enigma inexplicável", trend: "+16%", up: true, category: "Curiosidades" },
  { icon: "🕵️", name: "Conspirações", keywords: "conspiração teoria", trend: "+12%", up: true, category: "Curiosidades" },
  // Entretenimento
  { icon: "🔍", name: "True Crime", keywords: "true crime mistério investigação", trend: "+19%", up: true, category: "Entretenimento" },
  { icon: "🎬", name: "Documentários", keywords: "documentário mini doc", trend: "+15%", up: true, category: "Entretenimento" },
  { icon: "📖", name: "Storytime", keywords: "storytime história pessoal", trend: "+14%", up: true, category: "Entretenimento" },
  { icon: "😲", name: "Reactions", keywords: "reaction react reação", trend: "+21%", up: true, category: "Entretenimento" },
  { icon: "🍜", name: "Mukbang", keywords: "mukbang eating comida", trend: "+10%", up: true, category: "Entretenimento" },
  { icon: "🎵", name: "Música", keywords: "música cover tutorial", trend: "+14%", up: true, category: "Entretenimento" },
  { icon: "😂", name: "Comédia", keywords: "comédia humor standup", trend: "+9%", up: true, category: "Entretenimento" },
  // Criadores
  { icon: "👻", name: "VTubers", keywords: "vtuber virtual youtuber", trend: "+12%", up: true, category: "Criadores" },
  { icon: "😌", name: "ASMR", keywords: "asmr relaxar sleep", trend: "+8%", up: true, category: "Criadores" },
  { icon: "📦", name: "Unboxing", keywords: "unboxing haul primeira impressão", trend: "+11%", up: true, category: "Criadores" },
  { icon: "⭐", name: "Reviews", keywords: "review análise opinião", trend: "+17%", up: true, category: "Criadores" },
  { icon: "🎨", name: "Arte/DIY", keywords: "tutorial DIY criativo", trend: "+6%", up: true, category: "Criadores" },
  // Educação
  { icon: "📜", name: "História", keywords: "história documentário passado", trend: "+14%", up: true, category: "Educação" },
  { icon: "🔬", name: "Ciência", keywords: "ciência explicação científico", trend: "+18%", up: true, category: "Educação" },
  { icon: "🧠", name: "Filosofia", keywords: "filosofia pensamento reflexão", trend: "+11%", up: true, category: "Educação" },
  { icon: "📚", name: "Study With Me", keywords: "study with me pomodoro estudar", trend: "+20%", up: true, category: "Educação" },
  { icon: "📚", name: "Educação", keywords: "aprender curso online", trend: "+29%", up: true, category: "Educação" },
  { icon: "🧘", name: "Mindset", keywords: "motivação mindset sucesso", trend: "+33%", up: true, category: "Educação" },
  { icon: "🌍", name: "Idiomas", keywords: "aprender inglês idiomas", trend: "+25%", up: true, category: "Educação" },
  // Lifestyle
  { icon: "💄", name: "Moda/Beleza", keywords: "moda beleza outfit look", trend: "+17%", up: true, category: "Lifestyle" },
  { icon: "💅", name: "Maquilhagem", keywords: "maquilhagem makeup tutorial", trend: "+13%", up: true, category: "Lifestyle" },
  { icon: "🌱", name: "Minimalismo", keywords: "minimalismo organização declutter", trend: "+15%", up: true, category: "Lifestyle" },
  { icon: "🚐", name: "Van Life", keywords: "van life road trip nomad", trend: "+16%", up: true, category: "Lifestyle" },
  { icon: "💪", name: "Fitness", keywords: "fitness workout treino", trend: "+23%", up: true, category: "Lifestyle" },
  { icon: "🍕", name: "Culinária", keywords: "receita fácil rápida", trend: "+12%", up: true, category: "Lifestyle" },
  { icon: "✈️", name: "Viagens", keywords: "viagem vlog destino", trend: "+19%", up: true, category: "Lifestyle" },
  { icon: "👶", name: "Parenting", keywords: "filhos bebé dicas pais", trend: "+11%", up: true, category: "Lifestyle" },
  { icon: "🐾", name: "Pets", keywords: "cão gato animais", trend: "+18%", up: true, category: "Lifestyle" },
  { icon: "🌿", name: "Bem-estar", keywords: "saúde natural remedios", trend: "+22%", up: true, category: "Lifestyle" },
  { icon: "🏠", name: "Lifestyle", keywords: "lifestyle rotina dia a dia", trend: "+20%", up: true, category: "Lifestyle" },
  // Cultura
  { icon: "🎞️", name: "Cinema", keywords: "cinema filme crítica", trend: "+14%", up: true, category: "Cultura" },
  { icon: "📺", name: "Séries", keywords: "séries análise spoilers", trend: "+16%", up: true, category: "Cultura" },
  { icon: "🎌", name: "Anime", keywords: "anime manga otaku", trend: "+21%", up: true, category: "Cultura" },
  // Outros
  { icon: "🏡", name: "Imobiliário", keywords: "imobiliário casa apartamento", trend: "+24%", up: true, category: "Outros" },
  { icon: "⚖️", name: "Direito/Impostos", keywords: "direito impostos fiscal", trend: "+31%", up: true, category: "Outros" },
  { icon: "🗳️", name: "Política", keywords: "política actualidade análise", trend: "+8%", up: true, category: "Outros" },
  { icon: "🙏", name: "Religião", keywords: "religião espiritualidade fé", trend: "+10%", up: true, category: "Outros" },
  { icon: "🔧", name: "DIY Avançado", keywords: "DIY project construção", trend: "+9%", up: true, category: "Outros" },
  { icon: "🌾", name: "Homesteading", keywords: "homesteading off-grid autossuficiente", trend: "+13%", up: true, category: "Outros" },
  { icon: "💰", name: "Finanças", keywords: "ganhar dinheiro investimento", trend: "+41%", up: true, category: "Outros" },
  { icon: "🎮", name: "Gaming", keywords: "gameplay tutorial jogos", trend: "+8%", up: true, category: "Outros" },
  { icon: "📱", name: "Tech", keywords: "review tecnologia smartphone", trend: "+15%", up: true, category: "Outros" },
  { icon: "⚽", name: "Desporto", keywords: "desporto futebol treino", trend: "+16%", up: true, category: "Outros" },
  { icon: "💼", name: "Negócios", keywords: "negócios empreendedorismo", trend: "+27%", up: true, category: "Outros" },
  { icon: "🪙", name: "Crypto", keywords: "criptomoeda bitcoin", trend: "+5%", up: true, category: "Outros" },
  { icon: "🚗", name: "Automóveis", keywords: "carros review automóvel", trend: "+10%", up: true, category: "Outros" },
];

export const NICHE_CATEGORIES = [
  "Todos",
  "Formatos",
  "Curiosidades",
  "Entretenimento",
  "Criadores",
  "Educação",
  "Lifestyle",
  "Cultura",
  "Outros",
] as const;

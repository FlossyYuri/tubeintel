export interface Niche {
  icon: string;
  name: string;
  keywords: string;
  trend: string;
  up: boolean;
}

export const NICHES: Niche[] = [
  { icon: "💪", name: "Fitness", keywords: "fitness workout treino", trend: "+23%", up: true },
  { icon: "💰", name: "Finanças", keywords: "ganhar dinheiro investimento", trend: "+41%", up: true },
  { icon: "🍕", name: "Culinária", keywords: "receita fácil rápida", trend: "+12%", up: true },
  { icon: "🎮", name: "Gaming", keywords: "gameplay tutorial jogos", trend: "+8%", up: true },
  { icon: "✈️", name: "Viagens", keywords: "viagem vlog destino", trend: "+19%", up: true },
  { icon: "📱", name: "Tech", keywords: "review tecnologia smartphone", trend: "+15%", up: true },
  { icon: "🧘", name: "Mindset", keywords: "motivação mindset sucesso", trend: "+33%", up: true },
  { icon: "🎨", name: "Arte/DIY", keywords: "tutorial DIY criativo", trend: "+6%", up: true },
  { icon: "👶", name: "Parenting", keywords: "filhos bebé dicas pais", trend: "+11%", up: true },
  { icon: "📚", name: "Educação", keywords: "aprender curso online", trend: "+29%", up: true },
  { icon: "🐾", name: "Pets", keywords: "cão gato animais", trend: "+18%", up: true },
  { icon: "🌿", name: "Bem-estar", keywords: "saúde natural remedios", trend: "+22%", up: true },
  { icon: "🎵", name: "Música", keywords: "música cover tutorial", trend: "+14%", up: true },
  { icon: "😂", name: "Comédia", keywords: "comédia humor standup", trend: "+9%", up: true },
  { icon: "⚽", name: "Desporto", keywords: "desporto futebol treino", trend: "+16%", up: true },
  { icon: "💼", name: "Negócios", keywords: "negócios empreendedorismo", trend: "+27%", up: true },
  { icon: "🪙", name: "Crypto", keywords: "criptomoeda bitcoin", trend: "+5%", up: true },
  { icon: "🏠", name: "Lifestyle", keywords: "lifestyle rotina dia a dia", trend: "+20%", up: true },
  { icon: "🚗", name: "Automóveis", keywords: "carros review automóvel", trend: "+10%", up: true },
  { icon: "🌍", name: "Idiomas", keywords: "aprender inglês idiomas", trend: "+25%", up: true },
];

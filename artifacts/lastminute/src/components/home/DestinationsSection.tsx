import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface Destination {
  name: string;
  country: string;
  emoji: string;
  fromPrice: number;
  imageUrl: string;
  searchName: string;
}

const DESTINATIONS: Destination[] = [
  {
    name: "Анталья",
    country: "Турция",
    emoji: "🇹🇷",
    fromPrice: 32000,
    imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80",
    searchName: "Турция",
  },
  {
    name: "Хургада",
    country: "Египет",
    emoji: "🇪🇬",
    fromPrice: 28000,
    imageUrl: "https://images.unsplash.com/photo-1539768942893-daf4e237c04d?w=600&q=80",
    searchName: "Египет",
  },
  {
    name: "Пхукет",
    country: "Таиланд",
    emoji: "🇹🇭",
    fromPrice: 55000,
    imageUrl: "https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=600&q=80",
    searchName: "Таиланд",
  },
  {
    name: "Дубай",
    country: "ОАЭ",
    emoji: "🇦🇪",
    fromPrice: 48000,
    imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80",
    searchName: "ОАЭ",
  },
  {
    name: "Родос",
    country: "Греция",
    emoji: "🇬🇷",
    fromPrice: 38000,
    imageUrl: "https://images.unsplash.com/photo-1555993539-1732b0258235?w=600&q=80",
    searchName: "Греция",
  },
  {
    name: "Пафос",
    country: "Кипр",
    emoji: "🇨🇾",
    fromPrice: 35000,
    imageUrl: "https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=600&q=80",
    searchName: "Кипр",
  },
  {
    name: "Барселона",
    country: "Испания",
    emoji: "🇪🇸",
    fromPrice: 42000,
    imageUrl: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600&q=80",
    searchName: "Испания",
  },
  {
    name: "Тбилиси",
    country: "Грузия",
    emoji: "🇬🇪",
    fromPrice: 18000,
    imageUrl: "https://images.unsplash.com/photo-1565008576549-57569a49371d?w=600&q=80",
    searchName: "Грузия",
  },
];

interface DestinationsSectionProps {
  onDestinationClick: (country: string) => void;
}

export function DestinationsSection({ onDestinationClick }: DestinationsSectionProps) {
  return (
    <section className="py-28 bg-white" id="destinations">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100 text-rose-700 font-bold text-sm mb-4">
            Популярные направления
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-5">Куда полететь?</h2>
          <p className="text-lg text-muted-foreground">
            Нажмите на направление — и мы сразу найдём для вас горящие туры
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {DESTINATIONS.map((dest, i) => (
            <motion.button
              key={dest.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              onClick={() => onDestinationClick(dest.searchName)}
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <img
                src={dest.imageUrl}
                alt={dest.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors duration-300" />
              
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-lg">{dest.emoji}</span>
                  <span className="text-white font-bold text-base leading-tight">{dest.name}</span>
                </div>
                <div className="text-white/70 text-xs font-medium mb-2">{dest.country}</div>
                <div className="flex items-center justify-between">
                  <span className="text-white/90 text-xs font-bold">
                    от {dest.fromPrice.toLocaleString("ru-RU")} ₽
                  </span>
                  <ArrowRight className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}

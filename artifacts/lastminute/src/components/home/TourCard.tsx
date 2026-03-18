import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { MapPin, Calendar, Utensils, Star, Sparkles, ArrowRight, Bookmark } from "lucide-react";
import type { Tour } from "@workspace/api-client-react/src/generated/api.schemas";
import { useAuth } from "@workspace/replit-auth-web";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getApiUrl } from "@/lib/apiUrl";

interface TourCardProps {
  tour: Tour;
  index: number;
  adults: number;
}

export function TourCard({ tour, index, adults }: TourCardProps) {
  const imageUrl = tour.imageUrl || `https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80&random=${index}`;
  const { isAuthenticated } = useAuth();
  const [saved, setSaved] = useState(false);
  const queryClient = useQueryClient();

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "d MMM", { locale: ru });
    } catch {
      return dateString;
    }
  };

  const adultsLabel = adults === 1
    ? "За 1 человека"
    : adults < 5
    ? `За ${adults} человека`
    : `За ${adults} человек`;

  const bookingUrl = tour.bookingUrl || `https://level.travel/search`;

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(getApiUrl("/user/saved-tours"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tourId: tour.id, tourData: tour }),
      });
      if (!res.ok) throw new Error("Failed to save");
    },
    onSuccess: () => {
      setSaved(true);
      queryClient.invalidateQueries({ queryKey: ["saved-tours"] });
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.15, ease: "easeOut" }}
      className="bg-white rounded-3xl overflow-hidden border border-border/60 shadow-xl shadow-black/[0.03] hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-500 group flex flex-col h-full"
    >
      {/* Image Header */}
      <div className="relative h-56 overflow-hidden">
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10" />
        <img 
          src={imageUrl} 
          alt={tour.hotel} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        
        {/* Recommendation Badge */}
        <div className="absolute top-4 left-4 z-20">
          <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl text-sm font-bold text-emerald-600 shadow-lg flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            {tour.aiRecommendation || "Отличный выбор"}
          </div>
        </div>

        {/* Bookmark Button */}
        {isAuthenticated && (
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={() => !saved && saveMutation.mutate()}
              disabled={saved || saveMutation.isPending}
              className={`w-9 h-9 rounded-xl backdrop-blur-md shadow-lg flex items-center justify-center transition-all ${
                saved
                  ? "bg-primary text-white"
                  : "bg-white/95 text-muted-foreground hover:text-primary hover:bg-white"
              }`}
              title={saved ? "Сохранено" : "Сохранить тур"}
            >
              <Bookmark className={`w-4 h-4 ${saved ? "fill-white" : ""}`} />
            </button>
          </div>
        )}

        {/* Price Tag */}
        <div className="absolute bottom-4 right-4 z-20">
          <div className="bg-foreground/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl text-right">
            <div className="text-white font-display font-bold text-xl leading-none">
              {tour.totalPrice.toLocaleString('ru-RU')} ₽
            </div>
            <div className="text-white/70 text-[10px] uppercase font-bold tracking-wider mt-1">
              {adultsLabel}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 md:p-8 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="font-display text-2xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
              {tour.hotel}
            </h3>
            <div className="flex items-center gap-1.5 mt-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">{tour.destination} ({tour.country}, {tour.city})</span>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-accent/10 px-2 py-1 rounded-lg">
            <Star className="w-4 h-4 text-accent fill-accent" />
            <span className="font-bold text-accent">{tour.stars}</span>
          </div>
        </div>

        {/* Info pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <div className="flex items-center gap-1.5 bg-secondary/60 px-3 py-1.5 rounded-lg text-sm font-medium">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>{formatDate(tour.departureDate)} — {formatDate(tour.returnDate)} ({tour.nights} ночей)</span>
          </div>
          <div className="flex items-center gap-1.5 bg-secondary/60 px-3 py-1.5 rounded-lg text-sm font-medium">
            <Utensils className="w-4 h-4 text-muted-foreground" />
            <span>{tour.mealType}</span>
          </div>
        </div>

        {/* AI Insight Box */}
        <div className="mt-auto bg-gradient-to-br from-indigo-50/50 to-purple-50/50 border border-indigo-100/50 rounded-2xl p-5 mb-6 relative overflow-hidden group/ai">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Sparkles className="w-16 h-16 text-indigo-600" />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-indigo-100 p-1.5 rounded-md">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Нейросеть советует</span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed relative z-10">
            {tour.aiDescription}
          </p>
        </div>

        {/* Action area */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <div className="text-sm text-muted-foreground font-medium">За человека</div>
            <div className="font-bold text-lg text-foreground">{tour.price.toLocaleString('ru-RU')} ₽</div>
          </div>
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="h-12 px-6 bg-foreground text-background rounded-xl font-bold hover:bg-primary hover:text-white transition-all flex items-center gap-2 shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0"
          >
            Смотреть
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

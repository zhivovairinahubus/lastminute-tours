import { motion } from "framer-motion";
import { PlaneTakeoff, AlertCircle } from "lucide-react";
import { TourCard } from "./TourCard";
import type { TourSearchResponse } from "@workspace/api-client-react/src/generated/api.schemas";

interface ResultsProps {
  data?: TourSearchResponse | null;
  isPending: boolean;
  isError: boolean;
  adults: number;
}

export function Results({ data, isPending, isError, adults }: ResultsProps) {
  if (isPending) {
    return (
      <section className="py-20 bg-background" id="results">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary mb-4 animate-pulse">
              <PlaneTakeoff className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-3xl font-display font-bold mb-3">Сканируем туроператоров...</h2>
            <p className="text-muted-foreground">ИИ отбирает лучшие варианты и пишет рекомендации</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden border border-border shadow-sm p-4">
                <div className="h-48 bg-secondary/60 rounded-2xl mb-6 animate-pulse" />
                <div className="h-8 w-3/4 bg-secondary/60 rounded-lg mb-4 animate-pulse" />
                <div className="h-4 w-1/2 bg-secondary/60 rounded-lg mb-8 animate-pulse" />
                <div className="flex gap-2 mb-8">
                  <div className="h-8 w-24 bg-secondary/60 rounded-lg animate-pulse" />
                  <div className="h-8 w-24 bg-secondary/60 rounded-lg animate-pulse" />
                </div>
                <div className="h-24 bg-indigo-50/50 rounded-xl mb-6 animate-pulse" />
                <div className="flex justify-between items-center pt-4 border-t border-border">
                  <div className="h-10 w-24 bg-secondary/60 rounded-lg animate-pulse" />
                  <div className="h-12 w-32 bg-secondary/60 rounded-xl animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="py-20 bg-background" id="results">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-500 mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-display font-bold mb-2">Упс, что-то пошло не так</h2>
          <p className="text-muted-foreground">Не удалось загрузить туры. Возможно, API временно недоступно. Попробуйте изменить параметры или повторить позже.</p>
        </div>
      </section>
    );
  }

  if (data) {
    if (data.tours.length === 0) {
      return (
        <section className="py-20 bg-background" id="results">
          <div className="max-w-3xl mx-auto px-4 text-center glass-panel rounded-3xl p-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary text-muted-foreground mb-6">
              <PlaneTakeoff className="w-10 h-10 opacity-50" />
            </div>
            <h2 className="text-3xl font-display font-bold mb-4 text-foreground">Не нашли подходящих туров</h2>
            <p className="text-lg text-muted-foreground mb-8">
              К сожалению, на ближайшие 7 дней из города <span className="font-bold text-foreground">{data.departureCity}</span> с бюджетом до <span className="font-bold text-foreground">{data.budget.toLocaleString('ru-RU')} ₽</span> ничего не нашлось.
            </p>
            <p className="text-primary font-medium">Попробуйте немного увеличить бюджет или выбрать другой город.</p>
          </div>
        </section>
      );
    }

    return (
      <section className="py-24 bg-[#FAFAFA]" id="results">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
                Топ-3 предложения
              </h2>
              <p className="text-muted-foreground font-medium text-lg">
                Вылет из <span className="text-foreground font-bold">{data.departureCity}</span>, бюджет до <span className="text-foreground font-bold">{data.budget.toLocaleString('ru-RU')} ₽</span>
              </p>
            </div>
            <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl font-bold">
              Найдено {data.totalFound} вариантов
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {data.tours.map((tour, idx) => (
              <TourCard key={tour.id} tour={tour} index={idx} adults={adults} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return null;
}

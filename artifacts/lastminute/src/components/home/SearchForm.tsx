import { useState } from "react";
import { Search, MapPin, Wallet, Sparkles, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetDepartureCities } from "@/hooks/use-tours";

interface SearchFormProps {
  onSearch: (city: string, budget: number, adults: number) => void;
  isSearching: boolean;
}

export function SearchForm({ onSearch, isSearching }: SearchFormProps) {
  const { data: citiesData, isLoading: isLoadingCities } = useGetDepartureCities();
  
  const [city, setCity] = useState("Москва");
  const [budget, setBudget] = useState<string>("50000");
  const [adults, setAdults] = useState<number>(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const budgetNum = parseInt(budget.replace(/\D/g, ""), 10);
    if (city && budgetNum > 0) {
      onSearch(city, budgetNum, adults);
    }
  };

  const cities = citiesData?.cities || [
    { id: "1", name: "Москва", nameEn: "Moscow" },
    { id: "2", name: "Санкт-Петербург", nameEn: "St. Petersburg" }
  ];

  return (
    <form 
      onSubmit={handleSubmit}
      data-testid="search-form"
      className="glass-panel p-4 md:p-6 rounded-3xl max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-4 relative z-10"
    >
      <div className="flex-1 w-full relative group">
        <label className="absolute left-4 top-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Откуда летим
        </label>
        <MapPin className="absolute left-4 bottom-4 w-5 h-5 text-primary" />
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          disabled={isLoadingCities}
          data-testid="city-select"
          className="w-full h-16 pl-12 pr-4 pt-5 pb-2 bg-secondary/50 border-2 border-transparent hover:bg-secondary rounded-2xl appearance-none font-medium text-foreground focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
        >
          {cities.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="hidden md:block w-px h-12 bg-border/60"></div>

      <div className="flex-1 w-full relative group">
        <label className="absolute left-4 top-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Бюджет на человека (₽)
        </label>
        <Wallet className="absolute left-4 bottom-4 w-5 h-5 text-accent" />
        <input
          type="number"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          min="10000"
          step="5000"
          placeholder="Например, 50000"
          data-testid="budget-input"
          className="w-full h-16 pl-12 pr-4 pt-5 pb-2 bg-secondary/50 border-2 border-transparent hover:bg-secondary rounded-2xl font-medium text-foreground focus:outline-none focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/10 transition-all placeholder:text-muted-foreground/50"
        />
      </div>

      <div className="hidden md:block w-px h-12 bg-border/60"></div>

      <div className="w-full md:w-44 relative group">
        <label className="absolute left-4 top-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Путешественников
        </label>
        <Users className="absolute left-4 bottom-4 w-5 h-5 text-indigo-500" />
        <select
          value={adults}
          onChange={(e) => setAdults(Number(e.target.value))}
          data-testid="adults-select"
          className="w-full h-16 pl-12 pr-4 pt-5 pb-2 bg-secondary/50 border-2 border-transparent hover:bg-secondary rounded-2xl appearance-none font-medium text-foreground focus:outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all cursor-pointer"
        >
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>{n} {n === 1 ? "человек" : n < 5 ? "человека" : "человек"}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isSearching}
        data-testid="search-btn"
        className={cn(
          "w-full md:w-auto h-16 px-8 rounded-2xl font-bold text-lg text-white",
          "bg-gradient-brand shadow-lg shadow-primary/30",
          "hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5",
          "active:translate-y-0 active:shadow-md",
          "disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none",
          "transition-all duration-300 ease-out flex items-center justify-center gap-2 shrink-0"
        )}
      >
        {isSearching ? (
          <>
            <Sparkles className="w-5 h-5 animate-pulse" />
            Ищем магию...
          </>
        ) : (
          <>
            <Search className="w-5 h-5" />
            Найти туры
          </>
        )}
      </button>
    </form>
  );
}

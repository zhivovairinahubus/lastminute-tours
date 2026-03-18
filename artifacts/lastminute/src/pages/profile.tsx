import { motion } from "framer-motion";
import { useAuth } from "@workspace/replit-auth-web";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  User, Bookmark, LogOut, MapPin, Calendar, Star, ExternalLink,
  Loader2, History, Search, Wallet, Users,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/apiUrl";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";

interface SavedTour {
  userId: string;
  tourId: string;
  savedAt: string;
  tourData: {
    hotel: string;
    destination: string;
    country: string;
    city: string;
    stars: number;
    departureDate: string;
    nights: number;
    price: number;
    totalPrice: number;
    mealType: string;
    bookingUrl?: string;
    imageUrl?: string;
  };
}

interface SearchHistoryItem {
  id: number;
  userId: string;
  departureCity: string;
  budget: number;
  adults: number;
  searchedAt: string;
}

function formatDate(dateString: string) {
  try {
    return format(parseISO(dateString), "d MMM yyyy, HH:mm", { locale: ru });
  } catch {
    return dateString;
  }
}

export default function ProfilePage() {
  const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const queryClient = useQueryClient();

  const { data: savedData, isLoading: toursLoading } = useQuery<{ savedTours: SavedTour[] }>({
    queryKey: ["saved-tours"],
    queryFn: async () => {
      const res = await fetch(getApiUrl("/user/saved-tours"), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json() as Promise<{ savedTours: SavedTour[] }>;
    },
    enabled: isAuthenticated,
  });

  const { data: historyData, isLoading: historyLoading } = useQuery<{ searchHistory: SearchHistoryItem[] }>({
    queryKey: ["search-history"],
    queryFn: async () => {
      const res = await fetch(getApiUrl("/user/search-history"), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json() as Promise<{ searchHistory: SearchHistoryItem[] }>;
    },
    enabled: isAuthenticated,
  });

  const removeMutation = useMutation({
    mutationFn: async (tourId: string) => {
      const res = await fetch(getApiUrl(`/user/saved-tours/${tourId}`), {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to remove");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saved-tours"] }),
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-bold mb-4">Войдите в аккаунт</h1>
            <p className="text-muted-foreground mb-8">
              Войдите, чтобы сохранять туры и просматривать историю поиска.
            </p>
            <a
              href={getApiUrl(`/login?returnTo=${encodeURIComponent((import.meta.env.BASE_URL as string))}`)}
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold text-base hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
            >
              <User className="w-5 h-5" />
              Войти
            </a>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  const savedTours = savedData?.savedTours ?? [];
  const searchHistory = historyData?.searchHistory ?? [];
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Путешественник";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Profile header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 border border-border shadow-sm mb-8 flex items-center gap-6"
          >
            {user?.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt={displayName}
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-brand flex items-center justify-center text-white text-3xl font-bold shadow-md">
                {displayName[0]?.toUpperCase() ?? "U"}
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-display font-bold">{displayName}</h1>
              {user?.email && <p className="text-muted-foreground">{user.email}</p>}
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-red-500 transition-colors px-4 py-2 rounded-xl hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              Выйти
            </button>
          </motion.div>

          {/* Saved tours */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Bookmark className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-display font-bold">Сохранённые туры</h2>
              {savedTours.length > 0 && (
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
                  {savedTours.length}
                </span>
              )}
            </div>

            {toursLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-7 h-7 text-primary animate-spin" />
              </div>
            ) : savedTours.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 border border-border text-center">
                <Bookmark className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Нет сохранённых туров</h3>
                <p className="text-muted-foreground mb-6">
                  Нажмите на закладку в карточке тура, чтобы сохранить его здесь.
                </p>
                <a href={String(import.meta.env.BASE_URL)} className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors">
                  Найти туры
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedTours.map((saved, i) => {
                  const t = saved.tourData;
                  return (
                    <motion.div
                      key={saved.tourId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all group"
                    >
                      {t.imageUrl && (
                        <div className="h-40 overflow-hidden">
                          <img src={t.imageUrl} alt={t.hotel} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      )}
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <h3 className="font-bold text-base leading-tight">{t.hotel}</h3>
                            <div className="flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{t.destination}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 bg-accent/10 px-2 py-0.5 rounded shrink-0">
                            <Star className="w-3 h-3 text-accent fill-accent" />
                            <span className="text-xs font-bold text-accent">{t.stars}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{t.departureDate} · {t.nights} ночей</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-lg font-bold">{t.totalPrice.toLocaleString("ru-RU")} ₽</div>
                            <div className="text-xs text-muted-foreground">{t.price.toLocaleString("ru-RU")} ₽/чел</div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => removeMutation.mutate(saved.tourId)}
                              disabled={removeMutation.isPending}
                              className="text-xs text-muted-foreground hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
                            >
                              Удалить
                            </button>
                            {t.bookingUrl && (
                              <a
                                href={t.bookingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs bg-primary text-white px-3 py-1.5 rounded-lg font-bold hover:bg-primary/90 transition-colors"
                              >
                                Смотреть
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Search history */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <History className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-display font-bold">История поиска</h2>
              {searchHistory.length > 0 && (
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
                  {searchHistory.length}
                </span>
              )}
            </div>

            {historyLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-7 h-7 text-primary animate-spin" />
              </div>
            ) : searchHistory.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 border border-border text-center">
                <History className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Нет истории поиска</h3>
                <p className="text-muted-foreground mb-6">
                  История поиска будет появляться здесь после каждого запроса.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
                {searchHistory.map((item, i) => (
                  <motion.a
                    key={item.id}
                    href={import.meta.env.BASE_URL as string}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`flex items-center gap-5 px-6 py-4 hover:bg-secondary/40 transition-colors ${i > 0 ? "border-t border-border" : ""}`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Search className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-foreground">
                        {item.departureCity}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1">
                          <Wallet className="w-3 h-3" />
                          {item.budget.toLocaleString("ru-RU")} ₽/чел
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {item.adults} {item.adults === 1 ? "человек" : item.adults < 5 ? "человека" : "человек"}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground shrink-0">
                      {formatDate(item.searchedAt)}
                    </div>
                  </motion.a>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}

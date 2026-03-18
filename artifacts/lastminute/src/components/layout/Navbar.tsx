import { Link, useLocation } from "wouter";
import { Plane, HelpCircle, User, LogOut, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@workspace/replit-auth-web";

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

export function Navbar() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const displayName = user
    ? ([user.firstName, user.lastName].filter(Boolean).join(" ") || "Аккаунт")
    : null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/30 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-all duration-300 group-hover:-translate-y-0.5">
            <Plane className="w-5 h-5 text-white -rotate-45 ml-1" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-foreground group-hover:text-primary transition-colors">
            LastMinute
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {location === "/" && (
            <>
              <a
                href="#how-it-works"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={(e) => { e.preventDefault(); scrollTo("how-it-works"); }}
              >
                Как работает
              </a>
              <a
                href="#destinations"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={(e) => { e.preventDefault(); scrollTo("destinations"); }}
              >
                Куда полететь
              </a>
              <a
                href="#reviews"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={(e) => { e.preventDefault(); scrollTo("reviews"); }}
              >
                Отзывы
              </a>
            </>
          )}
          <Link href="/help" className={cn(
            "flex items-center gap-1.5 text-sm font-medium transition-colors",
            location === "/help" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}>
            <HelpCircle className="w-4 h-4" />
            Помощь
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors",
                  location === "/profile" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {user?.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt={displayName ?? ""} className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}
                {displayName}
              </Link>
              <button
                onClick={logout}
                className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Выйти"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <a
              href={`${import.meta.env.BASE_URL}api/login?returnTo=${import.meta.env.BASE_URL}`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
            >
              <User className="w-4 h-4" />
              Войти
            </a>
          )}

          {location === "/" && !isAuthenticated && (
            <a
              href="#search"
              className="px-5 py-2.5 rounded-full border border-primary text-primary font-bold text-sm hover:bg-primary/5 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("search");
              }}
            >
              Найти тур
            </a>
          )}
          {location === "/" && isAuthenticated && (
            <a
              href="#search"
              className="px-5 py-2.5 rounded-full bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("search");
              }}
            >
              Найти тур
            </a>
          )}
        </div>

        <div className="md:hidden flex items-center gap-3">
          {isAuthenticated ? (
            <Link href="/profile" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <User className="w-5 h-5" />
            </Link>
          ) : (
            <a
              href={`${import.meta.env.BASE_URL}api/login?returnTo=${import.meta.env.BASE_URL}`}
              className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors"
            >
              <User className="w-5 h-5" />
            </a>
          )}
          <Link href="/help" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <HelpCircle className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </nav>
  );
}

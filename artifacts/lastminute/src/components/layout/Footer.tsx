import { Link } from "wouter";
import { Plane, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white mt-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-brand flex items-center justify-center">
                <Plane className="w-4 h-4 text-white -rotate-45 ml-0.5" strokeWidth={2.5} />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">LastMinute</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Сервис для спонтанных путешественников. Находим лучшие горящие туры с вылетом в ближайшие 7 дней.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-slate-400 mb-4">Сервис</h4>
            <ul className="space-y-3">
              <li><a href="#how-it-works" className="text-slate-300 hover:text-white transition-colors text-sm">Как это работает</a></li>
              <li><a href="#benefits" className="text-slate-300 hover:text-white transition-colors text-sm">Преимущества</a></li>
              <li><a href="#reviews" className="text-slate-300 hover:text-white transition-colors text-sm">Отзывы</a></li>
              <li><Link href="/help" className="text-slate-300 hover:text-white transition-colors text-sm">Помощь</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-slate-400 mb-4">Информация</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm">Политика конфиденциальности</a></li>
              <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm">Пользовательское соглашение</a></li>
              <li><Link href="/help" className="text-slate-300 hover:text-white transition-colors text-sm">Поддержка</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} LastMinute Tours. Все права защищены.
          </p>
          <p className="text-slate-600 text-sm flex items-center gap-1.5">
            Сделано с <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> для спонтанных путешественников
          </p>
        </div>
      </div>
    </footer>
  );
}

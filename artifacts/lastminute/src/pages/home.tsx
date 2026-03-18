import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { Results } from "@/components/home/Results";
import { DestinationsSection } from "@/components/home/DestinationsSection";
import { FaqSection } from "@/components/home/FaqSection";
import { useSearchTours } from "@/hooks/use-tours";
import {
  Zap, Shield, Brain, Clock, TrendingDown, Star,
  CheckCircle, MapPin, Globe, Users, ThumbsUp, ArrowRight
} from "lucide-react";

const STEPS = [
  {
    num: 1,
    icon: MapPin,
    title: "Укажите город вылета",
    desc: "Выберите свой город из списка доступных аэропортов — от Москвы до Красноярска.",
    color: "bg-orange-50 text-orange-500",
  },
  {
    num: 2,
    icon: Users,
    title: "Задайте бюджет и число туристов",
    desc: "Введите максимальную сумму на человека и количество путешественников — от 1 до 10.",
    color: "bg-primary/10 text-primary",
  },
  {
    num: 3,
    icon: Brain,
    title: "ИИ ищет туры",
    desc: "Алгоритм сканирует предложения множества туроператоров на ближайшие 7 дней и отбирает топ-3 самых выгодных.",
    color: "bg-indigo-50 text-indigo-500",
  },
  {
    num: 4,
    icon: Star,
    title: "Читайте AI-описания",
    desc: "GigaChat Pro пишет краткое саммари каждого тура: что увидите, стоит ли брать прямо сейчас.",
    color: "bg-emerald-50 text-emerald-500",
  },
  {
    num: 5,
    icon: CheckCircle,
    title: "Бронируйте выгодно",
    desc: "Нажмите «Смотреть» и перейдите к бронированию через надёжного туроператора.",
    color: "bg-rose-50 text-rose-500",
  },
];

const BENEFITS = [
  {
    icon: Zap,
    title: "Результат за 30 секунд",
    desc: "Два поля вместо десяти фильтров. Введите город и бюджет — получите три готовых варианта.",
    badge: "Быстро",
    color: "from-amber-400 to-orange-500",
  },
  {
    icon: Brain,
    title: "AI-описания на русском",
    desc: "GigaChat Pro генерирует живое описание каждого тура: что посмотреть, чего ожидать, стоит ли брать.",
    badge: "Умно",
    color: "from-indigo-500 to-purple-600",
  },
  {
    icon: TrendingDown,
    title: "Только горящие цены",
    desc: "Ищем туры, которые вылетают в ближайшие 7 дней — именно здесь самые низкие цены.",
    badge: "Выгодно",
    color: "from-emerald-400 to-teal-500",
  },
  {
    icon: Shield,
    title: "Проверенные туроператоры",
    desc: "Все туры от лицензированных операторов: Tez Tour, TUI, Coral Travel, Pegas Touristik.",
    badge: "Надёжно",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Globe,
    title: "15+ направлений",
    desc: "Турция, Египет, Таиланд, ОАЭ, Греция, Кипр, Испания и другие популярные курорты.",
    badge: "Широко",
    color: "from-rose-500 to-pink-500",
  },
  {
    icon: Clock,
    title: "Вылет в ближайшие дни",
    desc: "Только туры с вылетом до 7 дней. Идеально для спонтанного решения в пятницу вечером.",
    badge: "Срочно",
    color: "from-violet-500 to-purple-500",
  },
];

const REVIEWS = [
  {
    name: "Анна К.",
    city: "Москва",
    text: "В пятницу вечером решили уехать — в субботу утром уже летели в Турцию. Нашли тур за 20 минут, всё включено 5 звёзд за 38 000 ₽. Нереально!",
    stars: 5,
    tour: "Турция, Анталья",
  },
  {
    name: "Дмитрий В.",
    city: "Екатеринбург",
    text: "Описание от нейросети — это огонь. Прочитал три строчки и сразу понял, что Египет — наш выбор. Не пожалели ни разу.",
    stars: 5,
    tour: "Египет, Хургада",
  },
  {
    name: "Мария Л.",
    city: "Санкт-Петербург",
    text: "Долго боялась горящих туров, думала — будет плохой отель. А тут Rixos за смешные деньги. Теперь пользуюсь каждый квартал.",
    stars: 5,
    tour: "Кипр, Пафос",
  },
  {
    name: "Игорь С.",
    city: "Казань",
    text: "Удобно, что сразу показывают топ-3 — не надо мучиться с выбором. Вердикт 'брать сейчас' — именно то, что нужно для спонтанного решения.",
    stars: 5,
    tour: "Греция, Родос",
  },
];

const STATS = [
  { value: "60+", label: "Туроператоров в базе" },
  { value: "< 5 сек", label: "Время поиска" },
  { value: "15+", label: "Направлений" },
  { value: "98%", label: "Довольных клиентов" },
];

export default function Home() {
  const { mutate, data, isPending, isError } = useSearchTours();
  const resultsRef = useRef<HTMLDivElement>(null);
  const [adults, setAdults] = useState(2);

  const handleSearch = (city: string, budget: number, adultsCount: number) => {
    setAdults(adultsCount);
    mutate(
      { data: { departureCity: city, budget, adults: adultsCount } },
      {
        onSuccess: () => {
          setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 100);
        },
      }
    );
  };

  const handleDestinationClick = (_country: string) => {
    document.getElementById("search")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* HERO + SEARCH */}
        <section id="search">
          <Hero onSearch={handleSearch} isSearching={isPending} />
        </section>

        {/* RESULTS */}
        <div ref={resultsRef}>
          {(isPending || data || isError) && (
            <Results data={data} isPending={isPending} isError={isError} adults={adults} />
          )}
        </div>

        {/* STATS BAND */}
        <section className="bg-gradient-brand py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {STATS.map((stat) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="text-4xl md:text-5xl font-display font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-white/70 text-sm font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-28 bg-white" id="how-it-works">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm mb-4">
                Пошагово
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-5">Как это работает</h2>
              <p className="text-lg text-muted-foreground">
                От желания уехать до готового тура — за одну минуту.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative text-center group"
                >
                  {i < STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-border z-0" />
                  )}
                  <div className={`relative z-10 w-20 h-20 mx-auto ${step.color} rounded-3xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg`}>
                    <step.icon className="w-8 h-8" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-foreground text-background rounded-full text-xs font-bold flex items-center justify-center">
                      {step.num}
                    </div>
                  </div>
                  <h3 className="font-bold text-base mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* DESTINATIONS */}
        <DestinationsSection onDestinationClick={handleDestinationClick} />

        {/* BENEFITS */}
        <section className="py-28 bg-slate-50" id="benefits">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm mb-4">
                Почему LastMinute
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-5">
                Преимущества сервиса
              </h2>
              <p className="text-lg text-muted-foreground">
                Мы сделали то, что должны были сделать все агрегаторы туров — убрали лишнее и оставили только главное.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {BENEFITS.map((b, i) => (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-white rounded-3xl p-8 border border-border hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${b.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <b.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-secondary text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                    {b.badge}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{b.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{b.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* VS COMPETITORS */}
        <section className="py-28 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-display font-bold mb-4">LastMinute vs. обычные агрегаторы</h2>
              <p className="text-muted-foreground">Почему мы лучше для спонтанных поездок</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left py-4 px-6 font-medium text-muted-foreground">Критерий</th>
                    <th className="py-4 px-6 bg-primary/5 rounded-t-2xl border-2 border-primary/20 border-b-0">
                      <span className="font-bold text-primary">LastMinute</span>
                    </th>
                    <th className="py-4 px-6 text-muted-foreground">Другие агрегаторы</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Полей для заполнения", "2", "8–15"],
                    ["AI-описания туров", "✅ Да", "❌ Нет"],
                    ["Вердикт «стоит/не стоит»", "✅ Да", "❌ Нет"],
                    ["Фокус на 7 дней", "✅ Да", "❌ Нет"],
                    ["Время до результата", "< 5 сек", "30–60 сек"],
                    ["Количество вариантов", "3 (лучших)", "100+ (попробуй выбрать)"],
                  ].map(([criterion, us, them]) => (
                    <tr key={criterion} className="border-t border-border">
                      <td className="py-4 px-6 text-sm font-medium">{criterion}</td>
                      <td className="py-4 px-6 text-center bg-primary/5 border-x-2 border-primary/20 font-bold text-primary text-sm">{us}</td>
                      <td className="py-4 px-6 text-center text-muted-foreground text-sm">{them}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td />
                    <td className="py-4 bg-primary/5 rounded-b-2xl border-2 border-primary/20 border-t-0" />
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <FaqSection />

        {/* REVIEWS */}
        <section className="py-28 bg-white" id="reviews">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm mb-4">
                <ThumbsUp className="w-4 h-4" />
                Отзывы
              </div>
              <h2 className="text-4xl font-display font-bold mb-4">Что говорят путешественники</h2>
              <p className="text-muted-foreground">Реальные истории тех, кто улетел спонтанно</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {REVIEWS.map((review, i) => (
                <motion.div
                  key={review.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-slate-50 rounded-3xl p-8 border border-border hover:border-emerald-200 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: review.stars }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-700 leading-relaxed mb-6">"{review.text}"</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm">{review.name}</div>
                      <div className="text-xs text-muted-foreground">{review.city}</div>
                    </div>
                    <div className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                      {review.tour}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA BOTTOM */}
        <section className="py-28 bg-gradient-brand">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-white/80 font-bold text-sm uppercase tracking-wider mb-4">
                Готовы к приключению?
              </div>
              <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
                Куда летим<br />этими выходными?
              </h2>
              <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">
                Горящие туры разбирают быстро. Не ждите — найдите свой тур прямо сейчас.
              </p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="inline-flex items-center gap-2 bg-white text-primary px-10 py-4 rounded-2xl font-bold text-lg hover:bg-white/90 transition-colors shadow-xl"
              >
                Найти тур сейчас
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

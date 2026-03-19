import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  HelpCircle, ChevronDown, Search, MapPin, Wallet,
  Brain, Shield, Phone, Mail, Clock, CheckCircle,
  AlertCircle, Star, Plane, CreditCard, RefreshCw,
  Globe, Zap
} from "lucide-react";
import { Link } from "wouter";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    category: "Общие вопросы",
    question: "Что такое LastMinute Tours?",
    answer: "LastMinute Tours — это сервис для поиска горящих туров с вылетом в ближайшие 7 дней. Вы вводите только город вылета и бюджет, а наш ИИ находит топ-3 самых выгодных предложения и генерирует для каждого персонализированное описание.",
  },
  {
    category: "Общие вопросы",
    question: "Чем LastMinute отличается от обычных агрегаторов?",
    answer: "Главное отличие — простота и скорость. Обычные агрегаторы требуют заполнить 10–15 фильтров. У нас — всего 2 поля. Кроме того, мы добавляем AI-описание от нейросети для каждого тура: что увидите, стоит ли брать прямо сейчас.",
  },
  {
    category: "Поиск туров",
    question: "Как работает поиск туров?",
    answer: "После ввода города и бюджета наш алгоритм запрашивает базу туров Level.Travel, фильтрует предложения с вылетом в ближайшие 7 дней, сортирует по цене и возвращает 3 самых выгодных варианта. Для каждого тура нейросеть генерирует описание.",
  },
  {
    category: "Поиск туров",
    question: "Откуда берутся данные о турах?",
    answer: "Данные предоставляются партнёрской базой Level.Travel — крупнейшего российского агрегатора туров. В базе представлены более 60 туроператоров, включая Tez Tour, TUI, Coral Travel, Pegas Touristik.",
  },
  {
    category: "Поиск туров",
    question: "Почему показываются только 3 тура?",
    answer: "Мы специально ограничиваем выдачу тремя вариантами — это снижает «парадокс выбора». Вместо того чтобы часами листать 100 предложений, вы сразу видите лучшие три и можете принять решение за минуты.",
  },
  {
    category: "Поиск туров",
    question: "Почему не нашлись туры в моём бюджете?",
    answer: "Горящие туры с минимальным бюджетом (ниже 25 000 ₽ на человека) встречаются редко. Попробуйте увеличить бюджет на 10–20%, выбрать другой город вылета или повторить поиск позже — база обновляется ежедневно.",
  },
  {
    category: "ИИ и описания",
    question: "Кто пишет описания туров?",
    answer: "Описания генерирует нейросеть. Она анализирует параметры тура (направление, отель, количество ночей, тип питания) и создаёт персонализированное описание: что успеете увидеть и стоит ли брать.",
  },
  {
    category: "ИИ и описания",
    question: "Насколько точны описания от ИИ?",
    answer: "Описания генерируются на основе общедоступной информации о направлениях и отелях. Они носят информационный характер и помогают сориентироваться. Перед бронированием рекомендуем ознакомиться с подробными отзывами об отеле на Booking или TripAdvisor.",
  },
  {
    category: "Бронирование",
    question: "Можно ли забронировать тур прямо на сайте?",
    answer: "LastMinute Tours — это поисковый сервис. При нажатии «Смотреть» вы перейдёте на сайт туроператора для бронирования. Оплата и оформление документов происходят напрямую через туроператора.",
  },
  {
    category: "Бронирование",
    question: "Гарантированы ли показанные цены?",
    answer: "Цены актуальны на момент поиска, однако горящие туры — это динамический рынок: цена может измениться за несколько минут. Рекомендуем бронировать сразу после нахождения понравившегося варианта.",
  },
  {
    category: "Бронирование",
    question: "Туроператоры надёжные?",
    answer: "Да. Все туроператоры в нашей базе имеют лицензии, работают на российском рынке много лет и входят в реестр Ростуризма: Tez Tour, TUI, Coral Travel, Pegas Touristik.",
  },
  {
    category: "Технические вопросы",
    question: "Почему поиск занимает несколько секунд?",
    answer: "Поиск включает два этапа: запрос к базе туров и генерацию AI-описаний для каждого из трёх туров. AI-генерация занимает 2–4 секунды на тур. Всего процесс занимает 5–10 секунд.",
  },
  {
    category: "Технические вопросы",
    question: "Сервис работает на мобильных устройствах?",
    answer: "Да, сайт полностью адаптирован под мобильные устройства. Работает в любом современном браузере: Chrome, Safari, Firefox, Яндекс.Браузер.",
  },
  {
    category: "Технические вопросы",
    question: "Что делать, если возникла ошибка?",
    answer: "Попробуйте обновить страницу и повторить поиск. Если ошибка повторяется — напишите нам на support@lastminute-tours.ru, опишите проблему и мы исправим её в течение дня.",
  },
];

const CATEGORIES = ["Все", ...Array.from(new Set(FAQ_ITEMS.map((f) => f.category)))];

function FAQAccordion({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-slate-50 transition-colors gap-4"
      >
        <span className="font-semibold text-sm md:text-base">{item.question}</span>
        <ChevronDown className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-5 pt-0 text-sm text-muted-foreground leading-relaxed bg-white border-t border-border">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState("Все");
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const filteredFAQ = FAQ_ITEMS.filter((item) => {
    const matchesCategory = activeCategory === "Все" || item.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleItem = (idx: number) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20">
        {/* Hero */}
        <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full text-sm font-bold mb-6">
              <HelpCircle className="w-4 h-4" />
              Центр помощи
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              Как мы можем помочь?
            </h1>
            <p className="text-slate-400 text-lg mb-8">
              Ответы на частые вопросы, инструкции и контакты поддержки
            </p>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Поиск по вопросам..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:outline-none focus:border-white/50 focus:bg-white/20 transition-all"
              />
            </div>
          </div>
        </section>

        {/* Quick help cards */}
        <section className="py-14 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Search,
                  title: "Как найти тур",
                  desc: "Пошаговая инструкция по поиску горящего тура за 30 секунд",
                  color: "bg-primary/10 text-primary",
                  link: "#how-to-search",
                },
                {
                  icon: Brain,
                  title: "О нейросети",
                  desc: "Как нейросеть помогает выбрать тур и что означают её рекомендации",
                  color: "bg-indigo-100 text-indigo-600",
                  link: "#about-ai",
                },
                {
                  icon: Phone,
                  title: "Связаться с нами",
                  desc: "Напишите в поддержку — ответим в течение часа в рабочее время",
                  color: "bg-emerald-100 text-emerald-600",
                  link: "#contact",
                },
              ].map((card) => (
                <a
                  key={card.title}
                  href={card.link}
                  className="bg-white rounded-3xl p-6 border border-border hover:border-primary/30 hover:shadow-lg transition-all flex items-start gap-4"
                >
                  <div className={`p-3 rounded-xl ${card.color} shrink-0`}>
                    <card.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">{card.title}</h3>
                    <p className="text-sm text-muted-foreground">{card.desc}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Step-by-step guide */}
        <section className="py-20 bg-white" id="how-to-search">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-display font-bold mb-12 text-center">Пошаговая инструкция</h2>

            <div className="space-y-6">
              {[
                {
                  icon: MapPin,
                  step: 1,
                  title: "Выберите город вылета",
                  desc: "На главной странице в форме поиска нажмите на поле «Откуда летим» и выберите ваш город из выпадающего списка. Доступны 15 городов России с международными аэропортами.",
                  tip: "Совет: если в вашем городе нет прямых рейсов, выберите ближайший крупный город.",
                },
                {
                  icon: Wallet,
                  step: 2,
                  title: "Введите бюджет на человека",
                  desc: "Укажите максимальную сумму, которую вы готовы потратить на одного человека в рублях. Минимальный бюджет — 20 000 ₽. Рекомендуем указывать 50 000–80 000 ₽ для лучшего выбора.",
                  tip: "Совет: цена указана за человека, итоговая стоимость умножается на количество путешественников.",
                },
                {
                  icon: Search,
                  step: 3,
                  title: "Нажмите «Найти туры»",
                  desc: "Нажмите кнопку поиска — система запросит базу горящих туров с вылетом в ближайшие 7 дней. Поиск занимает 5–10 секунд.",
                  tip: "Совет: поиск лучше всего работает в четверг-пятницу — туроператоры публикуют горящие предложения на выходные.",
                },
                {
                  icon: Brain,
                  step: 4,
                  title: "Изучите результаты и AI-описания",
                  desc: "Вы увидите топ-3 тура, отсортированных по цене. Для каждого — описание от нейросети: что увидите, какая атмосфера, и главное — вердикт «стоит брать прямо сейчас» или нет.",
                  tip: "Совет: вердикт нейросети учитывает соотношение цена/качество для данного направления и сезона.",
                },
                {
                  icon: CheckCircle,
                  step: 5,
                  title: "Перейдите к бронированию",
                  desc: "Нажмите кнопку «Смотреть» на понравившемся туре — вы перейдёте на сайт туроператора для оформления и оплаты.",
                  tip: "Совет: горящие туры разбирают быстро. Если тур понравился — бронируйте сразу.",
                },
              ].map((step) => (
                <div key={step.step} className="flex gap-6">
                  <div className="shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center relative">
                      <step.icon className="w-6 h-6 text-primary" />
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-white rounded-full text-xs font-bold flex items-center justify-center">
                        {step.step}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-3">{step.desc}</p>
                    <div className="flex items-start gap-2 bg-amber-50 rounded-xl p-3 text-xs text-amber-800">
                      <Star className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      {step.tip}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About AI */}
        <section className="py-20 bg-slate-50" id="about-ai">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-display font-bold mb-4 text-center">О нейросети</h2>
            <p className="text-center text-muted-foreground mb-12">
              Как ИИ помогает выбрать лучший тур
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {[
                {
                  icon: Globe,
                  title: "Что делает нейросеть",
                  desc: "Нейросеть анализирует параметры тура (направление, отель, питание, количество ночей) и генерирует краткое, но информативное описание на русском языке.",
                },
                {
                  icon: Star,
                  title: "Как читать вердикт",
                  desc: "Фраза-вердикт — краткое мнение нейросети. «Берите прямо сейчас» означает хорошее соотношение цена/качество для данного сезона и направления.",
                },
                {
                  icon: AlertCircle,
                  title: "Ограничения",
                  desc: "AI-описания носят информационный характер. Мы рекомендуем дополнительно читать отзывы об отеле на Booking.com и TripAdvisor перед бронированием.",
                },
                {
                  icon: RefreshCw,
                  title: "Обновление",
                  desc: "Описания генерируются в режиме реального времени при каждом поиске — вы всегда получаете актуальную информацию.",
                },
              ].map((item) => (
                <div key={item.title} className="bg-white rounded-2xl p-6 border border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-indigo-100 rounded-xl">
                      <item.icon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="font-bold">{item.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-display font-bold mb-4 text-center">Частые вопросы</h2>
            <p className="text-center text-muted-foreground mb-10">Нашли ответ не нашли — напишите нам</p>

            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === cat
                      ? "bg-primary text-white"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredFAQ.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  По запросу «{searchQuery}» ничего не найдено. Попробуйте другой запрос.
                </div>
              ) : (
                filteredFAQ.map((item, idx) => (
                  <FAQAccordion
                    key={idx}
                    item={item}
                    isOpen={openItems.has(idx)}
                    onToggle={() => toggleItem(idx)}
                  />
                ))
              )}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-20 bg-slate-50" id="contact">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-display font-bold mb-4 text-center">Связаться с нами</h2>
            <p className="text-center text-muted-foreground mb-12">
              Не нашли ответ? Мы готовы помочь
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <a href="mailto:support@lastminute-tours.ru" className="bg-white rounded-3xl p-8 border border-border text-center hover:border-primary/30 hover:shadow-lg transition-all group">
                <div className="w-14 h-14 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Mail className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-bold mb-2">Email</h3>
                <p className="text-sm text-muted-foreground mb-3">Ответим в течение 2 часов</p>
                <span className="text-primary font-medium text-sm">support@lastminute-tours.ru</span>
              </a>

              <div className="bg-white rounded-3xl p-8 border border-border text-center">
                <div className="w-14 h-14 mx-auto bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
                  <Clock className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="font-bold mb-2">Время работы</h3>
                <p className="text-sm text-muted-foreground mb-3">Техподдержка работает</p>
                <span className="text-foreground font-medium text-sm">Пн–Пт: 9:00–20:00 МСК<br />Сб–Вс: 10:00–18:00 МСК</span>
              </div>

              <div className="bg-white rounded-3xl p-8 border border-border text-center">
                <div className="w-14 h-14 mx-auto bg-amber-100 rounded-2xl flex items-center justify-center mb-4">
                  <Zap className="w-7 h-7 text-amber-600" />
                </div>
                <h3 className="font-bold mb-2">Быстрый ответ</h3>
                <p className="text-sm text-muted-foreground mb-3">Для срочных вопросов</p>
                <span className="text-foreground font-medium text-sm">Telegram: @lastminute_support</span>
              </div>
            </div>
          </div>
        </section>

        {/* Back to search CTA */}
        <section className="py-14 bg-primary">
          <div className="text-center">
            <h2 className="text-2xl font-display font-bold text-white mb-4">Готовы искать тур?</h2>
            <Link href="/" className="inline-flex items-center gap-2 bg-white text-primary px-8 py-3 rounded-2xl font-bold hover:bg-white/90 transition-colors">
              <Plane className="w-5 h-5 -rotate-45" />
              На главную
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

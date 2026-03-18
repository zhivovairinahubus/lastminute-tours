import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  CreditCard,
  ShieldCheck,
  Clock,
  Phone,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { useState } from "react";

const steps = [
  {
    num: "01",
    title: "Найдите тур",
    desc: "Введите город вылета, бюджет и количество туристов. Наш ИИ подберёт лучшие горящие предложения за 30 секунд.",
    icon: "🔍",
  },
  {
    num: "02",
    title: "Выберите и перейдите к бронированию",
    desc: "Нажмите «Смотреть» на понравившемся туре — вы перейдёте на страницу туроператора или агрегатора для оформления.",
    icon: "🎯",
  },
  {
    num: "03",
    title: "Оплатите у туроператора",
    desc: "Оплата производится напрямую на сайте туроператора. Принимаются карты, онлайн-банкинг и рассрочка.",
    icon: "💳",
  },
  {
    num: "04",
    title: "Получите документы",
    desc: "После оплаты туроператор вышлет ваучер, билеты и всю информацию для поездки на email.",
    icon: "📄",
  },
];

const partners = [
  {
    name: "Level.Travel",
    desc: "Крупнейший онлайн-агрегатор туров в России. Более 2 млн туристов ежегодно.",
    url: "https://level.travel",
    tag: "Агрегатор",
  },
  {
    name: "Coral Travel",
    desc: "Один из крупнейших туроператоров России. Работает с 1994 года.",
    url: "https://www.coral.ru",
    tag: "Туроператор",
  },
  {
    name: "Anex Tour",
    desc: "Ведущий туроператор с широкой сетью и собственной авиационной группой.",
    url: "https://www.anextour.com",
    tag: "Туроператор",
  },
  {
    name: "TUI Russia",
    desc: "Международный туристический концерн, представленный в России.",
    url: "https://www.tui.ru",
    tag: "Туроператор",
  },
];

const faqs = [
  {
    q: "Принимает ли LastMinute платежи напрямую?",
    a: "Нет. LastMinute — это сервис поиска и подбора туров. Оплата производится напрямую у туроператора или на платформе-партнёре. Это гарантирует вам полную защиту как при покупке у лицензированного туроператора.",
  },
  {
    q: "Безопасно ли бронировать через партнёров?",
    a: "Да. Все наши партнёры имеют лицензии Ростуризма, финансовые гарантии и многолетнюю историю работы. Ваши деньги защищены механизмами страхования ответственности туроператора.",
  },
  {
    q: "Можно ли отменить тур после оплаты?",
    a: "Условия отмены зависят от конкретного туроператора и тарифа. Горящие туры, как правило, имеют ограниченные возможности для возврата — уточняйте условия перед оплатой на сайте туроператора.",
  },
  {
    q: "Есть ли рассрочка или кредит?",
    a: "Многие туроператоры предлагают рассрочку через банки-партнёры (Тинькофф, Сбер, ВТБ). Также возможна оплата частями через сервис «Долями». Уточняйте наличие этой опции на странице конкретного тура.",
  },
  {
    q: "Когда придут документы?",
    a: "Обычно в течение 24 часов после подтверждения оплаты. При горящих турах — в течение нескольких часов. Вы получите ваучер, авиабилеты и подтверждение отеля на email.",
  },
  {
    q: "Что делать, если возникла проблема с туром?",
    a: "Свяжитесь напрямую с туроператором — он несёт полную ответственность за услугу. Если проблема не решается, обратитесь в Роспотребнадзор или Ростуризм.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <button
        className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 hover:bg-secondary/40 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <HelpCircle className="w-5 h-5 text-primary shrink-0" />
          <span className="font-semibold text-base">{q}</span>
        </div>
        {open ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-6 pb-5 pt-1 text-muted-foreground leading-relaxed border-t border-border bg-secondary/20">
          {a}
        </div>
      )}
    </div>
  );
}

export default function BookingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-28 pb-20">
        {/* Hero */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold mb-6">
              <CreditCard className="w-4 h-4" />
              Как происходит бронирование
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 leading-tight">
              Тур за 4 простых шага
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              LastMinute находит лучшие горящие туры. Оплата и бронирование — у проверенных туроператоров с лицензиями Ростуризма.
            </p>
          </motion.div>
        </div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-white rounded-3xl p-8 border border-border shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-5">
                  <div className="text-4xl shrink-0">{step.icon}</div>
                  <div>
                    <div className="text-xs font-bold text-primary uppercase tracking-wider mb-2">
                      Шаг {step.num}
                    </div>
                    <h3 className="text-xl font-display font-bold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Trust badges */}
        <div className="bg-gradient-to-br from-primary/5 to-indigo-50 py-16 mb-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-display font-bold text-center mb-12">
              Ваши гарантии
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: ShieldCheck,
                  title: "Лицензированные операторы",
                  desc: "Все туроператоры в реестре Ростуризма с финансовыми гарантиями.",
                },
                {
                  icon: CreditCard,
                  title: "Безопасная оплата",
                  desc: "Оплата на защищённых сайтах с SSL и платёжными системами.",
                },
                {
                  icon: Phone,
                  title: "Поддержка туроператора",
                  desc: "Круглосуточная горячая линия по всем вопросам вашего тура.",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="bg-white rounded-2xl p-6 border border-border shadow-sm text-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Partners */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <h2 className="text-3xl font-display font-bold text-center mb-4">
            Наши партнёры
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            Туры, которые мы показываем, бронируются у этих проверенных операторов
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {partners.map((p, i) => (
              <motion.a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-md hover:border-primary/20 transition-all flex items-start gap-5 group"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-brand flex items-center justify-center text-white text-2xl font-display font-bold shrink-0 shadow-md shadow-primary/20">
                  {p.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{p.name}</h3>
                    <span className="bg-secondary px-2 py-0.5 rounded-md text-xs text-muted-foreground font-medium">{p.tag}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
              </motion.a>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-display font-bold text-center mb-4">
            Вопросы об оплате
          </h2>
          <p className="text-center text-muted-foreground mb-10">
            Ответы на самые частые вопросы о покупке тура
          </p>
          <div className="space-y-3">
            {faqs.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16 bg-gradient-to-br from-primary to-indigo-600 rounded-3xl p-10 text-center text-white"
          >
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="w-12 h-12 text-white/80" />
            </div>
            <h3 className="text-2xl font-display font-bold mb-3">
              Готовы найти свой тур?
            </h3>
            <p className="text-white/80 mb-8 text-base">
              Введите бюджет и город — ИИ подберёт лучшие горящие туры прямо сейчас.
            </p>
            <a
              href="/"
              className="inline-flex items-center gap-2 bg-white text-primary px-8 py-3 rounded-xl font-bold text-base hover:bg-white/90 transition-colors shadow-lg"
            >
              Найти тур
            </a>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

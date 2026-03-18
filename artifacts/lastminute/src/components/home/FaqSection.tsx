import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Что такое горящий тур и почему он дешевле?",
    answer: "Горящий тур — это путёвка с вылетом в ближайшие 7 дней, которую туроператор продаёт с большой скидкой, чтобы не лететь с незаполненными местами. Экономия по сравнению со стандартной ценой обычно составляет 30–60%. Идеально для тех, кто может уехать спонтанно.",
  },
  {
    question: "Нужно ли заранее оформлять визу?",
    answer: "Большинство направлений в нашей подборке — безвизовые для граждан России: Турция, Египет, ОАЭ, Грузия, Таиланд (до 30 дней), Кипр. Для Греции и Испании нужен шенген. При выборе тура всегда проверяйте визовые требования вашей страны проживания.",
  },
  {
    question: "Как происходит бронирование тура?",
    answer: "После того как вы нажали «Смотреть» и перешли на страницу туроператора, бронирование происходит напрямую через него. LastMinute — это поисковик, который помогает найти лучшие предложения. Оплата и оформление документов выполняются на стороне туроператора: Tez Tour, TUI, Coral Travel или Pegas Touristik.",
  },
  {
    question: "Что включено в цену тура?",
    answer: "Обычно в пакетный тур входит: перелёт туда и обратно, трансфер аэропорт–отель–аэропорт, проживание в отеле с выбранным типом питания (BB — завтрак, HB — полупансион, AI — всё включено), медицинская страховка. Визовый сбор и дополнительные экскурсии оплачиваются отдельно.",
  },
  {
    question: "Можно ли доверять турам из поиска?",
    answer: "Да. Мы показываем только туры от лицензированных туроператоров, входящих в реестр Ростуризма: Tez Tour, TUI Russia, Coral Travel, Pegas Touristik и других. Все они имеют финансовые гарантии и страхование ответственности.",
  },
  {
    question: "Что делать, если подходящих туров нет?",
    answer: "Попробуйте немного увеличить бюджет (на 5–10 тысяч рублей) или выбрать другой город вылета — иногда из соседнего города предложения выгоднее. Также можно попробовать поиск завтра: наличие туров меняется ежедневно, новые горящие предложения появляются постоянно.",
  },
];

function FaqItem({ item, isOpen, onToggle }: { item: FaqItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className={cn(
      "border border-border rounded-2xl overflow-hidden transition-all duration-200",
      isOpen ? "border-primary/30 shadow-md shadow-primary/5" : "hover:border-border/80"
    )}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 p-6 text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset rounded-2xl"
      >
        <span className={cn(
          "font-bold text-base md:text-lg transition-colors",
          isOpen ? "text-primary" : "text-foreground"
        )}>
          {item.question}
        </span>
        <ChevronDown className={cn(
          "w-5 h-5 shrink-0 transition-transform duration-300",
          isOpen ? "rotate-180 text-primary" : "text-muted-foreground"
        )} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="px-6 pb-6 text-muted-foreground leading-relaxed text-sm md:text-base border-t border-border pt-4">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-28 bg-slate-50" id="faq">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 text-violet-700 font-bold text-sm mb-4">
            Частые вопросы
          </div>
          <h2 className="text-4xl font-display font-bold mb-4">FAQ</h2>
          <p className="text-muted-foreground text-lg">
            Всё, что нужно знать перед первым спонтанным путешествием
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {FAQ_ITEMS.map((item, i) => (
            <FaqItem
              key={i}
              item={item}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

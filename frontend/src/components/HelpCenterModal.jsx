import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTour } from '../context/TourContext';
import { ALL_TOURS, FAQ_ITEMS, SUPPORT_CONTACT } from '../data/tourSteps';
import {
  X, Compass, HelpCircle, Phone, Mail, Clock, Search,
  CheckCircle2, BookOpen, Sparkles
} from 'lucide-react';

const TABS = [
  { id: 'tours',    label: 'Tours guiados',   icon: Compass },
  { id: 'faq',      label: 'Preguntas',         icon: HelpCircle },
  { id: 'contacto', label: 'Contacto',          icon: Phone },
];

export default function HelpCenterModal({ open, onClose }) {
  const [tab, setTab] = useState('tours');
  const [faqSearch, setFaqSearch] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const { start, isCompleted, resetTour } = useTour();

  // Cerrar con Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Bloquear scroll del body cuando el modal esta abierto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Resetear tab al abrir
  useEffect(() => {
    if (open) setTab('tours');
  }, [open]);

  if (!open) return null;

  const handleStartTour = (tourId) => {
    onClose();
    // Esperar a que se cierre el modal antes de iniciar el tour
    setTimeout(() => start(tourId), 200);
  };

  const filteredFaq = FAQ_ITEMS.filter((item) => {
    if (!faqSearch.trim()) return true;
    const q = faqSearch.toLowerCase();
    return item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" role="dialog" aria-modal="true">
      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-dark-border bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-dark-text">Centro de Ayuda</h2>
              <p className="text-xs text-slate-500 dark:text-dark-text-muted">¿Como podemos ayudarte hoy?</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors p-1" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 dark:border-dark-border px-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-dark-bg">
          {tab === 'tours' && (
            <ToursTab onStart={handleStartTour} isCompleted={isCompleted} onReset={resetTour} />
          )}
          {tab === 'faq' && (
            <FaqTab
              faqSearch={faqSearch}
              setFaqSearch={setFaqSearch}
              filteredFaq={filteredFaq}
              expandedFaq={expandedFaq}
              setExpandedFaq={setExpandedFaq}
            />
          )}
          {tab === 'contacto' && <ContactoTab />}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-dark-border text-xs text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-mono">Esc</kbd>
            para cerrar
          </span>
          <span>Presiona <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-mono">?</kbd> cuando quieras</span>
        </div>
      </div>
    </div>
  );
}

HelpCenterModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

function ToursTab({ onStart, isCompleted, onReset }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600 mb-4">
        Recorridos guiados paso a paso por las funciones principales. Toman menos de 1 minuto.
      </p>
      {ALL_TOURS.map((tour) => {
        const completed = isCompleted(tour.id);
        return (
          <div key={tour.id} className="bg-white dark:bg-dark-card rounded-xl border border-slate-100 dark:border-dark-border p-4 flex items-center gap-4 hover-lift">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <Compass size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 dark:text-dark-text">{tour.title}</p>
              <p className="text-xs text-slate-500 dark:text-dark-text-muted mt-0.5">{tour.description}</p>
              <p className="text-[10px] text-slate-400 mt-1">
                {tour.steps.length} pasos · {completed ? '✓ Completado' : 'No completado'}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {completed && (
                <button
                  onClick={() => onReset(tour.id)}
                  className="text-xs text-slate-400 hover:text-slate-700 underline"
                  title="Marcar como no completado"
                >
                  Reiniciar
                </button>
              )}
              <button
                onClick={() => onStart(tour.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-red-600 press-feedback transition-colors"
              >
                {completed ? 'Ver de nuevo' : 'Empezar'}
                <Compass size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

ToursTab.propTypes = {
  onStart: PropTypes.func.isRequired,
  isCompleted: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
};

function FaqTab({ faqSearch, setFaqSearch, filteredFaq, expandedFaq, setExpandedFaq }) {
  return (
    <div>
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar pregunta..."
          value={faqSearch}
          onChange={(e) => setFaqSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      {filteredFaq.length === 0 ? (
        <p className="text-center text-slate-400 text-sm py-8">
          No se encontraron preguntas con "{faqSearch}"
        </p>
      ) : (
        <div className="space-y-2">
          {filteredFaq.map((item, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div key={idx} className="bg-white dark:bg-dark-card rounded-xl border border-slate-100 dark:border-dark-border overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  className="w-full px-4 py-3 flex items-center justify-between gap-2 text-left hover:bg-slate-50 dark:hover:bg-dark-hover transition-colors"
                >
                  <span className="text-sm font-semibold text-slate-900 dark:text-dark-text">{item.q}</span>
                  <span className={`text-slate-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
                    ▾
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-3 text-sm text-slate-600 dark:text-dark-text-muted border-t border-slate-100 dark:border-dark-border bg-slate-50 dark:bg-dark-hover">
                    <p className="pt-3 leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

FaqTab.propTypes = {
  faqSearch: PropTypes.string.isRequired,
  setFaqSearch: PropTypes.func.isRequired,
  filteredFaq: PropTypes.array.isRequired,
  expandedFaq: PropTypes.number,
  setExpandedFaq: PropTypes.func.isRequired,
};

function ContactoTab() {
  return (
    <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-100 dark:border-dark-border p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
          <Phone size={22} />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-dark-text">{SUPPORT_CONTACT.titulo}</h3>
          <p className="text-xs text-slate-500 dark:text-dark-text-muted">{SUPPORT_CONTACT.responsable}</p>
        </div>
      </div>

      <div className="space-y-3 mt-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
            <Mail size={16} className="text-slate-500" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Correo</p>
            <a href={`mailto:${SUPPORT_CONTACT.email}`} className="text-sm text-primary hover:underline font-semibold">
              {SUPPORT_CONTACT.email}
            </a>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
            <Phone size={16} className="text-slate-500" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Telefono</p>
            <p className="text-sm text-slate-700 font-semibold">{SUPPORT_CONTACT.telefono}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
            <Clock size={16} className="text-slate-500" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Horario</p>
            <p className="text-sm text-slate-700">{SUPPORT_CONTACT.horario}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
        <BookOpen size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800">{SUPPORT_CONTACT.nota}</p>
      </div>
    </div>
  );
}

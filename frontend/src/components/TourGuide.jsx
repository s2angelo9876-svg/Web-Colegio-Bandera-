import { useEffect, useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react';
import { useTour } from '../context/TourContext';
import { ALL_TOURS } from '../data/tourSteps';

/**
 * TourGuide: motor visual con spotlight SVG + tarjeta de dialogo.
 *
 * Renderiza un overlay oscuro con un "hueco" recortado sobre el
 * elemento objetivo del paso actual. La tarjeta de dialogo se posiciona
 * cerca del objetivo (top/bottom/left/right segun configuracion).
 *
 * Manejo de edge cases:
 *   - Si el target no existe, skip automatico al siguiente paso
 *   - Si el target esta fuera de pantalla, scroll automatico
 *   - Atajos: Esc = salir, -> = siguiente, <- = anterior
 *   - En mobile (<640px) usa un bottom sheet simplificado
 */
export default function TourGuide() {
  const {
    activeTour, currentStep, isActive,
    nextStep, prevStep, skip, complete,
  } = useTour();

  const [targetRect, setTargetRect] = useState(null);
  const [targetExists, setTargetExists] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const cardRef = useRef(null);

  const tour = activeTour ? ALL_TOURS.find((t) => t.id === activeTour) : null;
  const step = tour?.steps?.[currentStep];

  // Detectar mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Encontrar el elemento objetivo y calcular su posicion
  useEffect(() => {
    if (!isActive || !step) return;

    // Reintentar hasta encontrar el elemento (puede aparecer despues de un fetch)
    let cancelled = false;
    let attempts = 0;

    const findTarget = () => {
      if (cancelled) return;
      const el = document.querySelector(`[data-tour="${step.id}"]`);
      if (el) {
        setTargetExists(true);
        // Scroll al elemento si no esta visible
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Esperar un momento para que el scroll termine y recalcular
        setTimeout(() => {
          if (cancelled) return;
          const rect = el.getBoundingClientRect();
          setTargetRect({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          });
        }, 350);
      } else if (attempts < 5) {
        attempts++;
        setTimeout(findTarget, 300);
      } else {
        setTargetExists(false);
        // No hay target: skip automatico al siguiente paso
        if (currentStep < (tour.steps.length - 1)) {
          nextStep();
        } else {
          complete();
        }
      }
    };

    findTarget();
    return () => { cancelled = true; };
  }, [activeTour, currentStep, step, nextStep, complete, tour]);

  // Reposicionar cuando se redimensiona la ventana
  useEffect(() => {
    if (!isActive || !step) return;
    const onResize = () => {
      const el = document.querySelector(`[data-tour="${step.id}"]`);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
      }
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [isActive, step]);

  // Atajos de teclado
  useEffect(() => {
    if (!isActive) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        skip();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevStep();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isActive, nextStep, prevStep, skip]);

  // Calcular posicion de la tarjeta
  const getCardStyle = () => {
    if (!targetRect || isMobile) return {};
    const margin = 16;
    const cardWidth = 360;
    const cardHeightEstimate = 200;
    const padding = 8;

    let top, left;
    const placement = step?.placement || 'bottom';

    // Calcular posicion basada en placement
    switch (placement) {
      case 'top':
        top = targetRect.top - cardHeightEstimate - margin;
        left = targetRect.left + targetRect.width / 2 - cardWidth / 2;
        break;
      case 'left':
        top = targetRect.top + targetRect.height / 2 - cardHeightEstimate / 2;
        left = targetRect.left - cardWidth - margin;
        break;
      case 'right':
        top = targetRect.top + targetRect.height / 2 - cardHeightEstimate / 2;
        left = targetRect.left + targetRect.width + margin;
        break;
      case 'bottom':
      default:
        top = targetRect.top + targetRect.height + margin;
        left = targetRect.left + targetRect.width / 2 - cardWidth / 2;
        break;
    }

    // Ajustar para que no se salga de la pantalla
    if (left < padding) left = padding;
    if (left + cardWidth > window.innerWidth - padding) {
      left = window.innerWidth - cardWidth - padding;
    }
    if (top < padding) top = padding;
    if (top + cardHeightEstimate > window.innerHeight - padding) {
      top = Math.max(padding, targetRect.top - cardHeightEstimate - margin);
    }

    return { top, left, width: cardWidth };
  };

  const handleNext = useCallback(() => {
    if (tour && currentStep >= tour.steps.length - 1) {
      complete();
    } else {
      nextStep();
    }
  }, [tour, currentStep, complete, nextStep]);

  if (!isActive || !tour || !step) return null;

  const isLastStep = currentStep >= tour.steps.length - 1;
  const isFirstStep = currentStep === 0;

  // En mobile: bottom sheet
  if (isMobile) {
    return (
      <>
        <div className="fixed inset-0 z-[9998] bg-black/60 animate-fade-in" onClick={skip} />
        <div className="fixed inset-x-0 bottom-0 z-[9999] bg-white rounded-t-2xl shadow-2xl animate-fade-in-up">
          <div className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {tour.title} - Paso {currentStep + 1} de {tour.steps.length}
              </span>
              <button onClick={skip} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
            <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
            <p className="text-sm text-slate-600 mt-2">{step.content}</p>
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={skip}
                className="text-sm font-semibold text-slate-500 hover:text-slate-700"
              >
                Saltar tour
              </button>
              <div className="flex items-center gap-2">
                {!isFirstStep && (
                  <button
                    onClick={prevStep}
                    className="inline-flex items-center gap-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold"
                  >
                    <ChevronLeft size={14} /> Atras
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="inline-flex items-center gap-1 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold press-feedback"
                >
                  {isLastStep ? <><Sparkles size={14} /> Entendido</> : <>Siguiente <ChevronRight size={14} /></>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Desktop: spotlight SVG + tarjeta flotante
  return (
    <>
      {/* SVG con spotlight (hueco sobre el elemento) */}
      <svg
        className="fixed inset-0 z-[9998] pointer-events-none"
        style={{ width: '100vw', height: '100vh' }}
      >
        <defs>
          <mask id="tour-spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left - 6}
                y={targetRect.top - 6}
                width={targetRect.width + 12}
                height={targetRect.height + 12}
                rx="8"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0" y="0" width="100%" height="100%"
          fill="rgba(0,0,0,0.65)"
          mask="url(#tour-spotlight-mask)"
          style={{ pointerEvents: 'auto' }}
          onClick={skip}
        />
      </svg>

      {/* Borde resaltado sobre el target */}
      {targetRect && (
        <div
          className="fixed z-[9998] pointer-events-none rounded-lg ring-4 ring-primary/60 animate-fade-in"
          style={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
        />
      )}

      {/* Tarjeta de dialogo */}
      <div
        ref={cardRef}
        className="fixed z-[9999] bg-white rounded-2xl shadow-2xl p-5 animate-fade-in-up border border-slate-200"
        style={getCardStyle()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-step-title"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {tour.title} · Paso {currentStep + 1} de {tour.steps.length}
          </span>
          <button onClick={skip} className="text-slate-400 hover:text-slate-700" aria-label="Cerrar tour">
            <X size={16} />
          </button>
        </div>

        {/* Barra de progreso */}
        <div className="w-full h-1 bg-slate-100 rounded-full mb-3 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-[width] duration-300"
            style={{ width: `${((currentStep + 1) / tour.steps.length) * 100}%` }}
          />
        </div>

        <h3 id="tour-step-title" className="text-base font-bold text-slate-900">
          {step.title}
        </h3>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">{step.content}</p>

        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={skip}
            className="text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors"
          >
            Saltar tour
          </button>
          <div className="flex items-center gap-1.5">
            {!isFirstStep && (
              <button
                onClick={prevStep}
                className="inline-flex items-center gap-0.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors"
              >
                <ChevronLeft size={12} /> Atras
              </button>
            )}
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-0.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-red-600 press-feedback transition-colors"
            >
              {isLastStep ? (<><Sparkles size={12} /> Entendido</>) : (<>Siguiente <ChevronRight size={12} /></>)}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

TourGuide.propTypes = {};

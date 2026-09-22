import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react';

/**
 * Wizard: formulario multi-paso amigable para no-tecnicos.
 *
 * Uso:
 *   <Wizard
 *     steps={[
 *       { id: 'basico', title: 'Informacion basica', description: '...' },
 *       { id: 'imagen', title: 'Imagen', description: '...' },
 *       { id: 'final',  title: 'Revisar y publicar' },
 *     ]}
 *     currentStep={currentStep}
 *     onStepChange={setCurrentStep}
 *     onSubmit={handleSubmit}
 *     onCancel={resetForm}
 *     canSubmit={isValid}
 *     submitting={enviando}
 *     submitLabel="Publicar"
 *   >
 *     {currentStep === 0 && <Step1 />}
 *     {currentStep === 1 && <Step2 />}
 *     {currentStep === 2 && <Step3 />}
 *   </Wizard>
 */
export default function Wizard({
  steps,
  currentStep,
  onStepChange,
  onSubmit,
  onCancel,
  canSubmit = true,
  submitting = false,
  submitLabel = 'Guardar',
  title = '',
  editMode = false,
}) {
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  const handleNext = useCallback(() => {
    if (!isLast) onStepChange(currentStep + 1);
  }, [currentStep, isLast, onStepChange]);

  const handlePrev = useCallback(() => {
    if (!isFirst) onStepChange(currentStep - 1);
  }, [currentStep, isFirst, onStepChange]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (canSubmit) onSubmit(e);
  }, [canSubmit, onSubmit]);

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-100 dark:border-dark-border shadow-sm mb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-dark-border">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 bg-primary rounded-full" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-dark-text uppercase tracking-wider">
              {title || (editMode ? 'Editar' : 'Nuevo')}
            </h3>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
              Paso {currentStep + 1} de {steps.length}
            </p>
          </div>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-dark-text transition-colors"
            aria-label="Cerrar formulario"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Stepper visual */}
      <div className="px-5 pt-4 pb-2 border-b border-slate-100 dark:border-dark-border">
        <ol className="flex items-center justify-between gap-2">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            return (
              <li key={step.id} className="flex-1 flex items-center gap-2">
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isActive
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check size={14} /> : index + 1}
                </div>
                <div className="hidden sm:block flex-1">
                  <p className={`text-[11px] font-bold uppercase tracking-wider ${
                    isActive || isCompleted ? 'text-slate-700 dark:text-dark-text' : 'text-slate-400'
                  }`}>
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-[10px] text-slate-400 truncate">{step.description}</p>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden sm:block h-0.5 flex-1 ${
                    isCompleted ? 'bg-emerald-500' : 'bg-slate-100 dark:bg-slate-700'
                  }`} />
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Body (paso actual) */}
      <form onSubmit={handleSubmit} className="p-5">
        <div className="min-h-[280px]">{steps[currentStep]?.content}</div>

        {/* Footer con navegación */}
        <div className="flex items-center justify-between gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-dark-border">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-dark-text text-sm font-semibold transition-colors"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={handlePrev}
                disabled={submitting}
                className="inline-flex items-center gap-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-dark-text rounded-lg text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
              >
                <ChevronLeft size={16} />
                Anterior
              </button>
            )}

            {!isLast && (
              <button
                type="button"
                onClick={handleNext}
                disabled={submitting}
                className="inline-flex items-center gap-1 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors press-feedback"
              >
                Siguiente
                <ChevronRight size={16} />
              </button>
            )}

            {isLast && (
              <button
                type="submit"
                disabled={submitting || !canSubmit}
                className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors press-feedback disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Guardando...' : submitLabel}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

Wizard.propTypes = {
  steps: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    content: PropTypes.node,
  })).isRequired,
  currentStep: PropTypes.number.isRequired,
  onStepChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  canSubmit: PropTypes.bool,
  submitting: PropTypes.bool,
  submitLabel: PropTypes.string,
  title: PropTypes.string,
  editMode: PropTypes.bool,
};

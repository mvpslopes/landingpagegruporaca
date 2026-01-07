import { useEffect, useRef, useCallback } from 'react';

interface UseInactivityOptions {
  timeout: number; // em milissegundos
  onInactive: () => void;
  onActive?: () => void;
  events?: string[];
  enabled?: boolean;
}

/**
 * Hook para detectar inatividade do usuário
 * @param timeout Tempo em milissegundos antes de considerar inativo (padrão: 5 minutos)
 * @param onInactive Callback quando usuário fica inativo
 * @param onActive Callback quando usuário volta a ser ativo
 * @param events Eventos a serem monitorados (padrão: mousemove, keypress, scroll, touchstart, click)
 * @param enabled Se o hook está habilitado (padrão: true)
 */
export function useInactivity({
  timeout = 5 * 60 * 1000, // 5 minutos padrão
  onInactive,
  onActive,
  events = ['mousemove', 'keypress', 'scroll', 'touchstart', 'click'],
  enabled = true
}: UseInactivityOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const wasInactive = Date.now() - lastActivityRef.current > timeout;
    lastActivityRef.current = Date.now();

    // Se estava inativo e agora está ativo, chamar callback
    if (wasInactive && onActive) {
      onActive();
    }

    // Configurar novo timeout
    timeoutRef.current = setTimeout(() => {
      onInactive();
    }, timeout);
  }, [timeout, onInactive, onActive]);

  useEffect(() => {
    if (!enabled) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return;
    }

    // Iniciar timer
    resetTimer();

    // Adicionar listeners para eventos
    events.forEach(event => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [enabled, events, resetTimer]);

  // Retornar função para resetar manualmente
  return {
    reset: resetTimer,
    getLastActivity: () => lastActivityRef.current
  };
}


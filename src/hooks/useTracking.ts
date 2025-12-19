import { useEffect, useRef } from 'react';

/**
 * Hook para rastreamento de eventos do site
 * Coleta dados de visualizações, cliques e navegação
 */

interface TrackingEvent {
  action: 'pageview' | 'click' | 'session_start' | 'session_end' | 'navigation';
  data?: Record<string, any>;
}

// Função para obter ou criar session ID
function getSessionId(): string {
  let sessionId = localStorage.getItem('gruporaca_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('gruporaca_session_id', sessionId);
  }
  return sessionId;
}

function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Função para enviar evento de tracking
async function trackEvent(event: TrackingEvent): Promise<void> {
  try {
    const response = await fetch(`/api/tracking.php?action=${event.action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event.data || {}),
    });

    if (!response.ok) {
      console.warn('Erro ao enviar evento de tracking:', event.action);
    }
  } catch (error) {
    // Silenciosamente falhar - não queremos que tracking quebre o site
    console.warn('Erro ao enviar tracking:', error);
  }
}

// Função para rastrear visualização de página
export function trackPageView(pagePath: string, pageTitle?: string): void {
  trackEvent({
    action: 'pageview',
    data: {
      page_path: pagePath,
      page_title: pageTitle || document.title,
      referrer: document.referrer || null,
      time_on_page: null, // Será calculado quando sair da página
    },
  });
}

// Função para rastrear clique
export function trackClick(
  elementType: string,
  elementId?: string,
  elementText?: string,
  clickX?: number,
  clickY?: number
): void {
  trackEvent({
    action: 'click',
    data: {
      element_type: elementType,
      element_id: elementId,
      element_text: elementText,
      page_path: window.location.pathname,
      click_position_x: clickX,
      click_position_y: clickY,
    },
  });
}

// Função para rastrear navegação
export function trackNavigation(fromPage: string, toPage: string, actionType: string = 'click'): void {
  trackEvent({
    action: 'navigation',
    data: {
      from_page: fromPage,
      to_page: toPage,
      action_type: actionType,
    },
  });
}

/**
 * Hook principal de tracking
 * Inicializa sessão e rastreia visualizações de página
 */
export function useTracking() {
  const pageStartTime = useRef<number>(Date.now());
  const currentPath = useRef<string>(window.location.pathname);

  useEffect(() => {
    // Iniciar sessão
    trackEvent({
      action: 'session_start',
      data: {
        first_page: window.location.pathname,
        referrer: document.referrer || null,
      },
    });

    // Rastrear visualização inicial da página
    trackPageView(window.location.pathname, document.title);

    // Rastrear quando usuário sai da página
    const handleBeforeUnload = () => {
      const timeOnPage = Math.floor((Date.now() - pageStartTime.current) / 1000);
      
      trackEvent({
        action: 'pageview',
        data: {
          page_path: currentPath.current,
          time_on_page: timeOnPage,
        },
      });

      // Finalizar sessão (opcional - pode ser feito no servidor)
      // trackEvent({ action: 'session_end' });
    };

    // Rastrear mudanças de rota (se usar React Router)
    const handlePopState = () => {
      const newPath = window.location.pathname;
      if (newPath !== currentPath.current) {
        const timeOnPage = Math.floor((Date.now() - pageStartTime.current) / 1000);
        
        // Atualizar tempo na página anterior
        trackEvent({
          action: 'pageview',
          data: {
            page_path: currentPath.current,
            time_on_page: timeOnPage,
          },
        });

        // Rastrear navegação
        trackNavigation(currentPath.current, newPath, 'navigation');

        // Iniciar tracking da nova página
        currentPath.current = newPath;
        pageStartTime.current = Date.now();
        trackPageView(newPath, document.title);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // NOTA: Removido o intervalo que criava pageviews a cada 30 segundos
  // Isso estava inflando os números. O tempo na página será calculado apenas
  // quando o usuário sair da página (beforeunload) ou mudar de rota
}

/**
 * Hook para rastrear cliques em elementos específicos
 */
export function useClickTracking(
  elementType: string,
  elementId?: string,
  elementText?: string
) {
  const handleClick = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clickX = Math.floor(e.clientX - rect.left);
    const clickY = Math.floor(e.clientY - rect.top);

    trackClick(elementType, elementId, elementText, clickX, clickY);
  };

  return handleClick;
}


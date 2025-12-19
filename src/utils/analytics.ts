/**
 * Utilitário para Google Analytics 4 (GA4)
 * Funções para rastrear eventos customizados
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

/**
 * Verificar se Google Analytics está carregado
 */
export function isGALoaded(): boolean {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
}

/**
 * Rastrear evento customizado no Google Analytics
 */
export function trackEvent(
  eventName: string,
  parameters?: Record<string, any>
): void {
  if (!isGALoaded()) {
    console.warn('Google Analytics não está carregado');
    return;
  }

  try {
    window.gtag('event', eventName, parameters);
  } catch (error) {
    console.error('Erro ao rastrear evento:', error);
  }
}

/**
 * Rastrear clique em botão
 */
export function trackButtonClick(
  buttonName: string,
  location?: string,
  additionalParams?: Record<string, any>
): void {
  trackEvent('click_button', {
    button_name: buttonName,
    location: location || 'unknown',
    ...additionalParams,
  });
}

/**
 * Rastrear clique em link
 */
export function trackLinkClick(
  linkText: string,
  linkUrl: string,
  location?: string
): void {
  trackEvent('click_link', {
    link_text: linkText,
    link_url: linkUrl,
    location: location || 'unknown',
  });
}

/**
 * Rastrear clique no WhatsApp
 */
export function trackWhatsAppClick(phone?: string): void {
  trackEvent('click_whatsapp', {
    phone: phone || 'unknown',
  });
}

/**
 * Rastrear visualização de página
 * Nota: O GA4 rastreia automaticamente as visualizações de página
 * Esta função é útil apenas para rastreamento manual de navegação SPA
 */
export function trackPageView(pagePath: string, pageTitle?: string): void {
  if (!isGALoaded()) {
    return;
  }

  try {
    // O GA4 já rastreia automaticamente, mas podemos enviar eventos customizados
    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle || document.title,
    });
  } catch (error) {
    console.error('Erro ao rastrear visualização de página:', error);
  }
}

/**
 * Rastrear conversão (ex: cadastro, download, etc)
 */
export function trackConversion(
  conversionType: string,
  value?: number,
  currency?: string
): void {
  trackEvent('conversion', {
    conversion_type: conversionType,
    value: value,
    currency: currency || 'BRL',
  });
}


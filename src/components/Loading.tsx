interface LoadingProps {
  message?: string;
  variant?: 'default' | 'splash';
}

export default function Loading({ message = 'Carregando...', variant = 'default' }: LoadingProps) {
  if (variant === 'splash') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center z-50 overflow-hidden">
        {/* Efeito de partículas/brilho no fundo */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="flex flex-col items-center justify-center relative z-10">
          {/* Logo redonda, com efeito de brilho */}
          <div className="logo-shine splash-logo-container">
            <img
              src="/logo-splash.png"
              alt="Grupo Raça"
              className="w-32 h-32 sm:w-40 sm:h-40 object-contain relative z-10 splash-logo"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
            <div
              className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-black/30 rounded-full animate-spin"
              style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}
            ></div>
          </div>
          <p className="text-gray-700 font-semibold text-lg">{message}</p>
        </div>
      </div>
    </div>
  );
}


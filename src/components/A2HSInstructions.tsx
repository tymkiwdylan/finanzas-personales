'use client';

import React, { useState } from 'react';

export default function A2HSInstructions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-20 right-4 z-40">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded-lg shadow-lg transition-colors"
      >
        <span className="text-sm">💡 Cómo instalar</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-12 right-0 p-4 bg-white rounded-lg shadow-lg border border-gray-200 w-72">
          <h3 className="font-medium text-gray-900 mb-2">Instalar como aplicación</h3>
          <p className="text-sm text-gray-700 mb-3">
            En Chrome o Edge, puedes instalar esta aplicación siguiendo estos pasos:
          </p>
          <ol className="text-xs text-gray-700 space-y-1 list-decimal pl-4 mb-3">
            <li>Haz clic en los tres puntos (⋮) en la esquina superior derecha</li>
            <li>Selecciona &ldquo;Instalar Mi Presupuesto Personal&rdquo;</li>
            <li>Sigue las instrucciones en pantalla</li>
          </ol>
          <p className="text-xs text-gray-500 mt-2">
            Una vez instalada, funcionará incluso sin conexión a internet.
          </p>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-xs text-gray-500 hover:text-gray-700 mt-2 underline"
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
}

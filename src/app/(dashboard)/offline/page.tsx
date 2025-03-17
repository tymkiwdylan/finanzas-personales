import React from 'react';
import OfflineContent from './OfflineContent';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Sin conexión</h2>
          <p className="mt-2 text-sm text-gray-600">
            No pudimos cargar el contenido debido a un problema de conexión.
          </p>
        </div>
        <div className="mt-8 space-y-4">
          <p className="text-sm text-gray-500">
            Puedes intentar:
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-500 space-y-2">
            <li>Verificar tu conexión a internet</li>
            <li>Recargar la página</li>
          </ul>
          <OfflineContent />
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';

export default function OfflineContent() {
  return (
    <>
      <div className="mt-6 text-center">
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
        >
          Intentar nuevamente
        </button>
      </div>
      <div className="mt-4 text-center">
        <Link href="/" className="text-sm text-sky-600 hover:text-sky-500">
          Volver al inicio
        </Link>
      </div>
    </>
  );
}

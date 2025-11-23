'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="mt-4 text-xl text-gray-600">Página no encontrada</p>
        <p className="mt-2 text-sm text-gray-500">
          La página que buscas no existe o ha sido movida.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center btn btn-primary"
        >
          <Home className="mr-2 h-5 w-5" />
          Volver al Dashboard
        </Link>
      </div>
    </div>
  );
}


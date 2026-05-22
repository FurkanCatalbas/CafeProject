import React from 'react';

const MusicPage: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Müzik Kataloğu</h1>
        <p className="text-slate-500">Müzik listesini ve çalma sırasını buradan yönetebilirsiniz.</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-slate-700 mb-2">Henüz Müzik Yok</h2>
        <p className="text-slate-500 max-w-md">
          Müzik kataloğu yakında burada olacak. Şu an için bu sayfa hazırlık aşamasındadır.
        </p>
      </div>
    </div>
  );
};

export default MusicPage;

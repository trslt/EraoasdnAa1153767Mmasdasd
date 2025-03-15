import React from 'react';
import { Button } from 'konsta/react';

interface MediaHeaderProps {
  title: string;
  subtitle: string;
  duration: string;
  backgroundImage: string;
  progress: number; // valore da 0 a 100
  ctaText?: string,
  showActionBar?: boolean,
  onContinue: () => void;
  onShare: () => void;
  onBookmark: () => void;
  onInfo: () => void;
  onDownload: () => void;
}

export default function CourseHeader({
  title,
  subtitle,
  duration,
  backgroundImage,
  progress,
  ctaText = "Scopri il corso",
  showActionBar = false,
  onContinue,
  onShare,
  onBookmark,
  onInfo,
  onDownload,
}: MediaHeaderProps) {
  return (
    <div className="relative w-full h-screen max-h-96 overflow-hidden">
      {/* Immagine di sfondo */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      
      {/* Gradiente scuro che sfuma verso il basso */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/90" />
      
      {/* Barra di progresso */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-700">
        <div 
          className="h-full bg-blue-500" 
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Contenuto principale */}
      <div className="relative z-10 flex flex-col h-full justify-between p-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="p-2">
            {/* Spazio per eventuali pulsanti di navigazione o altri elementi */}
          </div>
          <div className="flex space-x-4">
            <button className="text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Contenuto centrale - titolo, sottotitolo, durata */}
        <div className="flex-grow flex flex-col justify-end mb-6">
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="text-sm text-gray-300 mb-1">{subtitle}</p>
          <p className="text-xs text-gray-400">{duration}</p>
        </div>
        
        {/* Pulsante principale */}
        <div className="mb-6">
          <Button
            className="w-full py-3 bg-blue-500 text-white font-medium rounded-lg"
            onClick={onContinue}
          >
            {ctaText}
          </Button>
        </div>
        
        {/* Azioni in basso */}
        {showActionBar  && (
        <div className="flex justify-between px-4">
          <button onClick={onDownload} className="flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          <button onClick={onBookmark} className="flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
          <button onClick={onShare} className="flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
          <button onClick={onInfo} className="flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
        )}
      </div>
    </div>
  );
};



// Esempio di utilizzo:
/*
import MediaHeader from './MediaHeader';

function App() {
  return (
    <MediaHeader
      title="Game of Thrones"
      subtitle="S1:Episode 2 'Dark Wings, Dark Words'"
      duration="45 min"
      backgroundImage="/path/to/got-image.jpg"
      progress={75}
      onContinue={() => console.log('Continue watching')}
      onShare={() => console.log('Share')}
      onBookmark={() => console.log('Bookmark')}
      onInfo={() => console.log('Info')}
      onDownload={() => console.log('Download')}
    />
  );
}
*/
import { JSX } from 'react';
import MushroomMood from './features/mushroom-mood/MushroomMood';

export default function Page(): JSX.Element {
  return (
    <div className="min-h-screen bg-stone-50 py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-stone-800 mb-2">
          Mushroom Mood
        </h1>
        <p className="text-center text-stone-500 mb-10">
          Weather signals for when your mushroom spot is worth checking.
        </p>
        <MushroomMood />
      </div>
    </div>
  );
}
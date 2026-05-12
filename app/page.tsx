import { JSX } from 'react';
import MushroomReadiness from './features/mushroom-readiness/MushroomReadiness';

export default function Page(): JSX.Element {
  return (
    <div className="min-h-screen bg-stone-50 py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-stone-800 mb-2">
          Mushroom Readiness
        </h1>
        <p className="text-center text-stone-500 mb-10">
          Is now a good time to check your spot?
        </p>
        <MushroomReadiness />
      </div>
    </div>
  );
}
// client/src/pages/Home.tsx

import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="hero min-h-[60vh] bg-base-100">
      <div className="hero-content flex-col text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to SoundTribe</h1>
        <p className="text-lg text-base-content/70 max-w-xl">
          Connect with musicians and find opportunities in the music industry. Discover events, artists, and more.
        </p>
      </div>
    </div>
  );
};

export default Home;
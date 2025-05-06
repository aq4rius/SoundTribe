import React from 'react';

const ThemeSwitcher: React.FC = () => {
  React.useEffect(() => {
    // On mount, set the theme from localStorage or default to 'light'
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    document.documentElement.setAttribute('data-theme', e.target.value);
    localStorage.setItem('theme', e.target.value);
  };

  return (
    <select
      className="select select-bordered select-sm"
      onChange={handleThemeChange}
      value={localStorage.getItem('theme') || 'light'}
      aria-label="Theme selector"
    >
      <option value="light">Light</option>
      <option value="cupcake">Cupcake</option>
      <option value="emerald">Emerald</option>
      <option value="corporate">Corporate</option>
      <option value="synthwave">Synthwave</option>
    </select>
  );
};

export default ThemeSwitcher;
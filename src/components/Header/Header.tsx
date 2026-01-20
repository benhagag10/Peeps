import { useEffect } from 'react';
import { Plus, Users, Moon, Sun } from 'lucide-react';
import { useStore } from '../../store/useStore';
import SearchBox from './SearchBox';

function Header() {
  const { openAddPersonModal, darkMode, toggleDarkMode } = useStore();

  // Global keyboard shortcut for adding person
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        openAddPersonModal();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [openAddPersonModal]);

  return (
    <header className={`h-14 px-4 flex items-center justify-between shrink-0 border-b ${
      darkMode
        ? 'bg-gray-900 border-gray-700'
        : 'bg-white border-gray-200'
    }`}>
      {/* Logo / Title */}
      <div className="flex items-center gap-2">
        <Users className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
        <h1 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Peeps
        </h1>
      </div>

      {/* Search, Dark mode toggle and Add button */}
      <div className="flex items-center gap-3">
        <SearchBox />

        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-lg transition-colors ${
            darkMode
              ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
          }`}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button
          onClick={openAddPersonModal}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white
                     bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Person</span>
          <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-xs bg-blue-500 rounded">
            ⌘N
          </kbd>
        </button>
      </div>
    </header>
  );
}

export default Header;

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useReactFlow } from '@xyflow/react';
import { getInitials, getAvatarColor } from '../../utils/avatar';

function SearchBox() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { people, selectPerson } = useStore();
  const { setCenter } = useReactFlow();

  // Filter people by name or affiliation
  const filteredPeople = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return people.filter(
      (person) =>
        person.name.toLowerCase().includes(lowerQuery) ||
        person.affiliation?.toLowerCase().includes(lowerQuery)
    );
  }, [people, query]);

  // Handle selecting a person from search results
  const handleSelect = useCallback(
    (personId: string) => {
      const person = people.find((p) => p.id === personId);
      if (person) {
        selectPerson(personId);
        setCenter(person.position.x, person.position.y, { duration: 500, zoom: 1.5 });
        setQuery('');
        setIsOpen(false);
      }
    },
    [people, selectPerson, setCenter]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setQuery('');
        setIsOpen(false);
        inputRef.current?.blur();
      }
      if (e.key === 'Enter' && filteredPeople.length > 0) {
        handleSelect(filteredPeople[0].id);
      }
    },
    [filteredPeople, handleSelect]
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global keyboard shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search people... (⌘F)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-64 pl-10 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     placeholder-gray-400"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200"
          >
            <X className="w-3 h-3 text-gray-400" />
          </button>
        )}
      </div>

      {/* Search results dropdown */}
      {isOpen && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
          {filteredPeople.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">No people found</div>
          ) : (
            <ul className="max-h-64 overflow-y-auto">
              {filteredPeople.map((person) => (
                <li key={person.id}>
                  <button
                    onClick={() => handleSelect(person.id)}
                    className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                  >
                    {person.photoUrl ? (
                      <img
                        src={person.photoUrl}
                        alt={person.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
                        style={{ backgroundColor: getAvatarColor(person.name) }}
                      >
                        {getInitials(person.name)}
                      </div>
                    )}
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900">{person.name}</div>
                      {person.affiliation && (
                        <div className="text-xs text-gray-500">{person.affiliation}</div>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBox;

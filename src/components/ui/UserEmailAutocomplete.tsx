import { useState, useEffect, useRef } from 'react';
import { auth } from '../../lib/firebase';

interface User {
  _id: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

interface UserEmailAutocompleteProps {
  value: User | null;
  onChange: (user: User | null) => void;
  placeholder?: string;
  error?: string;
}

export function UserEmailAutocomplete({
  value,
  onChange,
  placeholder = 'Digite o e-mail...',
  error,
}: UserEmailAutocompleteProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      setInputValue(value.email);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchUsers = async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const token = await currentUser.getIdToken();
      const response = await fetch(
        `http://localhost:3001/auth/search-users?email=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to search users');
      }

      const users = await response.json();
      setSuggestions(users);
      setIsOpen(true);
    } catch (error) {
      console.error('Error searching users:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Clear selection if user is typing
    if (value) {
      onChange(null);
    }

    // Search when user types @ symbol
    if (newValue.includes('@')) {
      searchUsers(newValue);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const handleSelectUser = (user: User) => {
    setInputValue(user.email);
    onChange(user);
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleClear = () => {
    setInputValue('');
    onChange(null);
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 ${
            error ? 'outline-red-500' : 'outline-white/10'
          } placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6`}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Selected user display */}
      {value && (
        <div className="mt-2 flex items-center gap-2 rounded-md bg-indigo-500/10 px-3 py-2">
          {value.photoURL && (
            <img
              src={value.photoURL}
              alt={value.displayName}
              className="h-8 w-8 rounded-full"
            />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium text-white">{value.displayName}</p>
            <p className="text-xs text-gray-400">{value.email}</p>
          </div>
        </div>
      )}

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md bg-gray-900 shadow-lg outline outline-1 outline-white/10">
          <ul className="max-h-60 overflow-auto rounded-md py-1">
            {suggestions.map((user) => (
              <li key={user._id}>
                <button
                  type="button"
                  onClick={() => handleSelectUser(user)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-white/5"
                >
                  {user.photoURL && (
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      className="h-8 w-8 rounded-full"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{user.displayName}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
        </div>
      )}

      {/* No results */}
      {isOpen && !loading && inputValue.includes('@') && suggestions.length === 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md bg-gray-900 px-3 py-2 text-sm text-gray-400 shadow-lg outline outline-1 outline-white/10">
          Nenhum usuário encontrado
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}

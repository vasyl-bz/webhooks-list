import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from 'react';

interface SearchFieldProps {
  value: string;
  onSearch: (value: string) => void;
  delayMs?: number;
}

export function SearchField({ value, onSearch, delayMs = 400 }: SearchFieldProps) {
  const [term, setTerm] = useState(value);
  const committed = useRef(value);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (value === committed.current) return;
    committed.current = value;
    window.clearTimeout(timer.current);
    setTerm(value);
  }, [value]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const commit = (next: string) => {
    window.clearTimeout(timer.current);
    const normalized = next.trim();
    if (normalized === committed.current) return;
    committed.current = normalized;
    onSearch(normalized);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    setTerm(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => commit(next), delayMs);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    commit(term);
  };

  const handleClear = () => {
    setTerm('');
    commit('');
  };

  return (
    <form role="search" className="search" onSubmit={handleSubmit}>
      <svg className="search__icon" viewBox="0 0 20 20" aria-hidden="true">
        <circle cx="9" cy="9" r="5.5" />
        <path d="m13.5 13.5 3 3" />
      </svg>
      <input
        type="search"
        className="search__input"
        placeholder="Пошук за назвою"
        aria-label="Пошук за назвою"
        value={term}
        onChange={handleChange}
      />
      {term && (
        <button type="button" className="search__clear" aria-label="Очистити пошук" onClick={handleClear}>
          ×
        </button>
      )}
    </form>
  );
}

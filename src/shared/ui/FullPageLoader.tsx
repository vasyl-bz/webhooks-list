import { Spinner } from './Spinner';

export function FullPageLoader() {
  return (
    <div className="full-page">
      <Spinner label="Завантаження" />
    </div>
  );
}

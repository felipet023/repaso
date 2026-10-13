import { PackageSearch } from 'lucide-react';

export default function EmptyState({ title = 'No se encontraron resultados', message = '' }) {
  return (
    <div className="state-block">
      <PackageSearch size={40} strokeWidth={1.5} />
      <h3>{title}</h3>
      {message && <p>{message}</p>}
    </div>
  );
}

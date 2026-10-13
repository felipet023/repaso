export default function ProductFilters({ filtros, valores, onChange, resultado }) {
  function set(key, value) {
    onChange({ ...valores, [key]: value });
  }

  return (
    <aside className="filters">
      <div className="filters-header">
        <h3>Filtros</h3>
        {resultado !== undefined && <span className="muted">{resultado} resultados</span>}
      </div>

      <div className="filter-group">
        <label htmlFor="f-search">Buscar</label>
        <input
          id="f-search"
          value={valores.search || ''}
          onChange={(event) => set('search', event.target.value)}
          placeholder="Nombre o marca"
        />
      </div>

      <div className="filter-group">
        <label htmlFor="f-categoria">Categoría</label>
        <select
          id="f-categoria"
          value={valores.categoria || ''}
          onChange={(event) => set('categoria', event.target.value ? Number(event.target.value) : '')}
        >
          <option value="">Todas</option>
          {(filtros?.categorias || []).map((categoria) => (
            <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="f-marca">Marca</label>
        <select
          id="f-marca"
          value={valores.marca || ''}
          onChange={(event) => set('marca', event.target.value ? Number(event.target.value) : '')}
        >
          <option value="">Todas</option>
          {(filtros?.marcas || []).map((marca) => (
            <option key={marca.id} value={marca.id}>{marca.nombre}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Precio (COP)</label>
        <div className="price-range">
          <input
            type="number"
            min="0"
            placeholder="Mín"
            value={valores.min ?? ''}
            onChange={(event) => set('min', event.target.value === '' ? '' : Number(event.target.value))}
          />
          <span>—</span>
          <input
            type="number"
            min="0"
            placeholder="Máx"
            value={valores.max ?? ''}
            onChange={(event) => set('max', event.target.value === '' ? '' : Number(event.target.value))}
          />
        </div>
      </div>

      <div className="filter-group">
        <label htmlFor="f-rating">Valación mínima</label>
        <select
          id="f-rating"
          value={valores.rating ?? ''}
          onChange={(event) => set('rating', event.target.value === '' ? '' : Number(event.target.value))}
        >
          <option value="">Cualquiera</option>
          <option value="4.5">4.5 ★ o más</option>
          <option value="4">4.0 ★ o más</option>
          <option value="3">3.0 ★ o más</option>
        </select>
      </div>

      <label className="filter-check">
        <input
          type="checkbox"
          checked={Boolean(valores.disponible)}
          onChange={(event) => set('disponible', event.target.checked)}
        />
        Solo disponibles
      </label>

      <div className="filter-group">
        <label htmlFor="f-orden">Ordenar por</label>
        <select
          id="f-orden"
          value={valores.orden || 'mas_vendidos'}
          onChange={(event) => set('orden', event.target.value)}
        >
          <option value="mas_vendidos">Más vendidos</option>
          <option value="precio_asc">Precio: menor a mayor</option>
          <option value="precio_desc">Precio: mayor a menor</option>
          <option value="nombre_asc">Nombre A-Z</option>
        </select>
      </div>
    </aside>
  );
}

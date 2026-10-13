import { useEffect, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { urlImagen } from '../utils/format';

export default function ProductForm({ initial = {}, filtros = {}, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    id_marca: '',
    id_categoria: '',
    precio: '',
    descuento: 0,
    stock: 0,
    ...initial
  });
  const [imagenFile, setImagenFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setForm({
      nombre: initial.nombre || '',
      descripcion: initial.descripcion || '',
      id_marca: initial.marca?.id || initial.id_marca || '',
      id_categoria: initial.categoria?.id || initial.id_categoria || '',
      precio: initial.precio ?? '',
      descuento: initial.descuento ?? 0,
      stock: initial.stock ?? 0
    });
    setImagenFile(null);
    setPreview(initial.imagen ? urlImagen(initial.imagen) : null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [initial]);

  function change(event) {
    const { name, value } = event.target;
    setForm((actual) => ({ ...actual, [name]: value }));
  }

  function changeImagen(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImagenFile(file);
    setPreview(URL.createObjectURL(file));
  }

  function submit(event) {
    event.preventDefault();
    onSubmit({ ...form, imagenFile });
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <form onSubmit={submit} className="card form-grid">
      <div className="form-row">
        <div className="field">
          <label htmlFor="nombre">Nombre *</label>
          <input id="nombre" name="nombre" value={form.nombre} onChange={change} required maxLength={120} />
        </div>
        <div className="field">
          <label htmlFor="id_marca">Marca *</label>
          <select id="id_marca" name="id_marca" value={form.id_marca} onChange={change} required>
            <option value="">Selecciona una marca</option>
            {(filtros.marcas || []).map((marca) => (
              <option key={marca.id} value={marca.id}>{marca.nombre}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="id_categoria">Categoría *</label>
          <select id="id_categoria" name="id_categoria" value={form.id_categoria} onChange={change} required>
            <option value="">Selecciona una categoría</option>
            {(filtros.categorias || []).map((categoria) => (
              <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="descripcion">Descripción</label>
        <textarea id="descripcion" name="descripcion" value={form.descripcion} onChange={change} rows={3} maxLength={1000} />
      </div>

      <div className="form-row form-row-3">
        <div className="field">
          <label htmlFor="precio">Precio (COP) *</label>
          <input id="precio" name="precio" type="number" min="1" step="0.01" value={form.precio} onChange={change} required />
        </div>
        <div className="field">
          <label htmlFor="descuento">Descuento (%)</label>
          <input id="descuento" name="descuento" type="number" min="0" max="100" step="0.01" value={form.descuento} onChange={change} />
        </div>
        <div className="field">
          <label htmlFor="stock">Existencia *</label>
          <input id="stock" name="stock" type="number" min="0" step="1" value={form.stock} onChange={change} required />
        </div>
      </div>

      <div className="field">
        <label className="image-upload-field">
          <span><ImagePlus size={16} /> Imagen del producto (jpg, png o webp, máx. 2 MB)</span>
          <input ref={fileInputRef} type="file" accept="image/jpeg, image/png, image/webp" onChange={changeImagen} />
        </label>
        {preview && (
          <div className="image-preview-wrap">
            <div className="image-preview"><img src={preview} alt="Vista previa" /></div>
            <button type="button" className="btn-secondary btn-sm" onClick={() => { setPreview(null); setImagenFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}>
              <X size={14} /> Quitar
            </button>
          </div>
        )}
      </div>

      <div className="actions">
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Guardando…' : initial.id ? 'Actualizar producto' : 'Crear producto'}
        </button>
        {onCancel && (
          <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
        )}
      </div>
    </form>
  );
}

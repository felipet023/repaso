const pool = require('../config/db');
const AppError = require('../utils/AppError');
const adminService = require('./admin.service');
const reportService = adminService;

// Exporta el informe en Excel (.xlsx) o PDF (.pdf).
async function exportReport(query) {
  const formato = String(query.formato || 'excel').toLowerCase();
  const data = await reportService.report(query);
  const nombreArchivo = `reporte-bike-store.${formato === 'pdf' ? 'pdf' : 'xlsx'}`;

  if (formato === 'pdf') {
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ size: 'letter', margin: 50 });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    const done = new Promise((resolve) => doc.on('end', resolve));

    doc.fontSize(20).text('TUKI BIKES — Informe de ventas', { align: 'center' });
    doc.fontSize(10).text(
      `Filtros: desde ${data.filtros.desde || '—'} hasta ${data.filtros.hasta || '—'} · categoría ${data.filtros.categoria || 'todas'}`,
      { align: 'center' }
    );
    doc.moveDown();
    doc.fontSize(13).text(`Ventas totales: $${data.resumen.ventas_totales.toLocaleString('es-CO')} · Pedidos: ${data.resumen.total_pedidos}`);
    doc.moveDown();
    doc.fontSize(12).text('Ventas por categoría');
    doc.fontSize(10);
    data.ventas_por_categoria.forEach((fila) => {
      doc.text(`${fila.categoria}: ${fila.pedidos} pedidos · ${fila.unidades} unidades · $${fila.ventas.toLocaleString('es-CO')}`);
    });
    doc.moveDown();
    doc.fontSize(12).text('Productos estrella (top 10)');
    doc.fontSize(10);
    data.productos_estrella.forEach((fila, i) => {
      doc.text(`${i + 1}. ${fila.nombre} (${fila.marca}): ${fila.unidades} unidades · $${fila.ventas.toLocaleString('es-CO')}`);
    });
    doc.end();
    await done;
    return { filename: nombreArchivo, contentType: 'application/pdf', buffer: Buffer.concat(chunks) };
  }

  if (formato === 'excel') {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();

    const hojaResumen = workbook.addWorksheet('Resumen');
    hojaResumen.addRow(['TUKI BIKES — Informe de ventas']);
    hojaResumen.addRow(['Desde', data.filtros.desde || '—']);
    hojaResumen.addRow(['Hasta', data.filtros.hasta || '—']);
    hojaResumen.addRow(['Categoría', data.filtros.categoria || 'Todas']);
    hojaResumen.addRow([]);
    hojaResumen.addRow(['Ventas totales', data.resumen.ventas_totales]);
    hojaResumen.addRow(['Total de pedidos', data.resumen.total_pedidos]);

    const hojaCategorias = workbook.addWorksheet('Ventas por categoría');
    hojaCategorias.addRow(['Categoría', 'Pedidos', 'Unidades', 'Ventas (COP)']);
    data.ventas_por_categoria.forEach((fila) => {
      hojaCategorias.addRow([fila.categoria, fila.pedidos, fila.unidades, fila.ventas]);
    });

    const hojaProductos = workbook.addWorksheet('Productos estrella');
    hojaProductos.addRow(['#', 'Producto', 'Marca', 'Unidades', 'Ventas (COP)']);
    data.productos_estrella.forEach((fila, i) => {
      hojaProductos.addRow([i + 1, fila.nombre, fila.marca, fila.unidades, fila.ventas]);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return { filename: nombreArchivo, contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer: Buffer.from(buffer) };
  }

  throw new AppError('Formato de exportación inválido. Usa excel o pdf.', 400);
}

module.exports = { exportReport };

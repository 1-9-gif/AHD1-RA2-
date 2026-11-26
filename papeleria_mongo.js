// papeleria_mongo.js · AHD1 (RA2) · Base de datos "papeleria" en MongoDB
// Ing. Guilmar Urizar, Instructor Intecap CQH

// ── 1. Crear / seleccionar la base de datos ─────────────────────────────
use('papeleria');                       
db.dropDatabase();                      

// ── 2. Colecciones (con un esquema de validación en productos) ────
db.createCollection('categorias');
db.createCollection('productos', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['codigo', 'nombre', 'precio', 'stock', 'categoria_id'],
      properties: {
        codigo:       { bsonType: 'string', description: 'obligatorio, texto' },
        nombre:       { bsonType: 'string' },
        precio:       { bsonType: ['double', 'int'], minimum: 0 },
        stock:        { bsonType: 'int', minimum: 0 },
        categoria_id: { bsonType: 'objectId', description: 'referencia a categorias' }
      }
    }
  }
});
db.createCollection('clientes');
db.createCollection('ventas');
printjson(db.getCollectionNames());

// Índices únicos
db.productos.createIndex({ codigo: 1 }, { unique: true });
db.categorias.createIndex({ nombre: 1 }, { unique: true });

// ── 3. Agregar documentos (CREATE) ──────────────────────────────────────
// 4 categorías
const cat = db.categorias.insertMany([
  { nombre: 'Cuadernos', descripcion: 'Cuadernos y libretas' },
  { nombre: 'Escritura', descripcion: 'Lápices, lapiceros y marcadores' },
  { nombre: 'Arte',      descripcion: 'Colores, crayones y pinturas' },
  { nombre: 'Oficina',   descripcion: 'Artículos de escritorio y archivo' }
]).insertedIds;

// 10 productos (todos con NumberInt en stock)
db.productos.insertMany([
  { codigo: 'CUA-001', nombre: 'Cuaderno espiral 100 hojas',    precio: 18.50, stock: NumberInt(40),  categoria_id: cat[0] },
  { codigo: 'CUA-002', nombre: 'Libreta de bolsillo',           precio: 7.00,  stock: NumberInt(25),  categoria_id: cat[0] },
  { codigo: 'CUA-003', nombre: 'Cuaderno universitario cuadros',precio: 22.00, stock: NumberInt(35),  categoria_id: cat[0] },
  { codigo: 'ESC-001', nombre: 'Lápiz HB',                      precio: 1.50,  stock: NumberInt(200), categoria_id: cat[1] },
  { codigo: 'ESC-002', nombre: 'Lapicero azul',                 precio: 2.25,  stock: NumberInt(150), categoria_id: cat[1] },
  { codigo: 'ESC-003', nombre: 'Marcador permanente negro',     precio: 6.50,  stock: NumberInt(60),  categoria_id: cat[1] },
  { codigo: 'ESC-004', nombre: 'Borrador blanco',               precio: 2.00,  stock: NumberInt(90),  categoria_id: cat[1] },
  { codigo: 'ART-001', nombre: 'Caja de crayones 12',           precio: 12.00, stock: NumberInt(8),   categoria_id: cat[2],
    etiquetas: ['infantil', 'colores'] },
  { codigo: 'ART-002', nombre: 'Témperas 6 colores',            precio: 16.50, stock: NumberInt(9),   categoria_id: cat[2],
    etiquetas: ['pintura', 'escolar'] },
  { codigo: 'OFI-001', nombre: 'Engrapadora metálica',          precio: 35.00, stock: NumberInt(6),   categoria_id: cat[3],
    etiquetas: ['oficina', 'metal'] }
]);

// 4 clientes (incluye documentos embebidos en direccion)
db.clientes.insertMany([
  { nombre: 'Consumidor Final', nit: 'CF' },
  { nombre: 'Ana López',        nit: '1234567-8', telefono: '5555-1234',
    direccion: { zona: 1, ciudad: 'Quetzaltenango' } },
  { nombre: 'Colegio San José', nit: '9876543-2', telefono: '7755-1020',
    direccion: { zona: 2, ciudad: 'Quetzaltenango' } },
  { nombre: 'Carlos Méndez',    nit: '4567890-1', telefono: '5555-5678',
    direccion: { zona: 3, ciudad: 'Santa Cruz del Quiché' } }
]);

// 3 ventas (cliente por referencia, detalle items embebido)
const ana      = db.clientes.findOne({ nit: '1234567-8' });
const colegio  = db.clientes.findOne({ nit: '9876543-2' });
const carlos   = db.clientes.findOne({ nit: '4567890-1' });

const cua001   = db.productos.findOne({ codigo: 'CUA-001' });
const cua003   = db.productos.findOne({ codigo: 'CUA-003' });
const esc001   = db.productos.findOne({ codigo: 'ESC-001' });
const esc002   = db.productos.findOne({ codigo: 'ESC-002' });
const esc003   = db.productos.findOne({ codigo: 'ESC-003' });
const esc004   = db.productos.findOne({ codigo: 'ESC-004' });
const art001   = db.productos.findOne({ codigo: 'ART-001' });
const ofi001   = db.productos.findOne({ codigo: 'OFI-001' });

db.ventas.insertMany([
  {
    cliente_id: ana._id,
    fecha: new Date(),
    items: [
      { producto_id: cua001._id, nombre: cua001.nombre, cantidad: 2, precio: cua001.precio, subtotal: 37.00 },
      { producto_id: esc001._id, nombre: esc001.nombre, cantidad: 5, precio: esc001.precio, subtotal: 7.50 }
    ],
    total: 44.50
  },
  {
    cliente_id: colegio._id,
    fecha: new Date(),
    items: [
      { producto_id: cua003._id, nombre: cua003.nombre, cantidad: 10, precio: cua003.precio, subtotal: 220.00 },
      { producto_id: esc002._id, nombre: esc002.nombre, cantidad: 20, precio: esc002.precio, subtotal: 45.00 },
      { producto_id: esc003._id, nombre: esc003.nombre, cantidad: 4,  precio: esc003.precio, subtotal: 26.00 }
    ],
    total: 291.00
  },
  {
    cliente_id: carlos._id,
    fecha: new Date(),
    items: [
      { producto_id: art001._id, nombre: art001.nombre, cantidad: 2, precio: art001.precio, subtotal: 24.00 },
      { producto_id: ofi001._id, nombre: ofi001.nombre, cantidad: 1, precio: ofi001.precio, subtotal: 35.00 },
      { producto_id: esc004._id, nombre: esc004.nombre, cantidad: 3, precio: esc004.precio, subtotal: 6.00 }
    ],
    total: 65.00
  }
]);

// ── 4. Buscar y extraer documentos (READ) ───────────────────────────────
db.productos.find();                                                         // todos
db.productos.findOne({ codigo: 'ESC-002' });                                 // uno
db.productos.find({ precio: { $lt: 10 } });                                  // precio menor a 10
db.productos.find({ stock: { $lte: 10 } }, { nombre: 1, stock: 1, _id: 0 }); // poco stock, solo 2 campos
db.productos.find({ nombre: { $regex: 'cuaderno', $options: 'i' } });        // contiene "cuaderno"
db.productos.find({ codigo: { $in: ['CUA-001', 'ART-001'] } });
db.productos.find().sort({ precio: -1 }).limit(3);                           // los 3 más caros
db.productos.countDocuments({ categoria_id: cat[1] });                       // cuántos de Escritura

// ── 5. Modificar documentos (UPDATE) ────────────────────────────────────
db.productos.updateOne({ codigo: 'ESC-002' }, { $set: { precio: 2.50 } });
db.productos.updateOne({ codigo: 'ART-001' }, { $inc: { stock: NumberInt(20) } });  // +20 unidades
db.productos.updateMany({ categoria_id: cat[0] }, { $set: { proveedor: 'Distribuidora Escolar' } });
db.clientes.updateOne({ nit: '1234567-8' }, { $set: { 'direccion.zona': 3 } });     // campo embebido

// ── 6. Eliminar documentos (DELETE) ─────────────────────────────────────
db.productos.insertOne({ codigo: 'TMP-001', nombre: 'Producto de prueba', precio: 1, stock: NumberInt(1), categoria_id: cat[0] });
db.productos.deleteOne({ codigo: 'TMP-001' });

// ── 7. Relaciones: unir ventas con clientes ($lookup) ───────────────────
db.ventas.aggregate([
  { $lookup: { from: 'clientes', localField: 'cliente_id', foreignField: '_id', as: 'cliente' } },
  { $unwind: '$cliente' },
  { $project: { _id: 0, fecha: 1, total: 1, 'cliente.nombre': 1, productos: { $size: '$items' } } }
]);

// Total vendido por producto (lee el detalle embebido)
db.ventas.aggregate([
  { $unwind: '$items' },
  { $group: { _id: '$items.nombre', unidades: { $sum: '$items.cantidad' }, total: { $sum: '$items.subtotal' } } },
  { $sort: { total: -1 } }
]);

// ── 8. Probar la validación del esquema (este insert DEBE fallar) ───────
try {
  db.productos.insertOne({ codigo: 'MAL-001', nombre: 'Sin precio', stock: NumberInt(1), categoria_id: cat[0] });
} catch (e) {
  print('Validación funcionando: ' + e.message);
}
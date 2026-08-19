/**
 * Script para geocodificar las direcciones de los establecimientos usando Nominatim (OpenStreetMap).
 * Genera un archivo JSON con las coordenadas para cada establecimiento (por id).
 * 
 * Uso: node scripts/geocode-establecimientos.js
 * 
 * Respeta el rate limit de Nominatim: 1 request por segundo.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://gyhihuovussdauehmeuk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5aGlodW92dXNzZGF1ZWhtZXVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NjA2NTksImV4cCI6MjA2ODMzNjY1OX0.d70DaieRw-zHAhug1ZmEn7aDBEH5k6uFBc2I2eOOP30';

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const OUTPUT_FILE = path.join(__dirname, '..', 'public', 'js', 'coordenadas-establecimientos.json');

// Valparaíso bounding box para validar que las coordenadas estén en tierra
const VALPO_BOUNDS = {
  latMin: -33.10,
  latMax: -33.00,
  lngMin: -71.68,
  lngMax: -71.55
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function limpiarDireccion(direccion) {
  if (!direccion) return '';
  // Limpiar N° y caracteres especiales, agregar contexto
  let d = direccion
    .replace(/N°/g, '')
    .replace(/n°/g, '')
    .replace(/Nº/g, '')
    .replace(/,\s*$/, '')
    .trim();
  
  // Asegurar que tenga Valparaíso, Chile
  if (!d.toLowerCase().includes('valparaíso') && !d.toLowerCase().includes('valparaiso')) {
    d += ', Valparaíso';
  }
  if (!d.toLowerCase().includes('chile')) {
    d += ', Chile';
  }
  return d;
}

async function geocodificar(direccion) {
  const query = encodeURIComponent(direccion);
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=cl`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'SLEP-Valparaiso-Geocoder/1.0 (slepvalparaiso.gob.cl)'
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (data.length === 0) return null;
  
  const lat = parseFloat(data[0].lat);
  const lng = parseFloat(data[0].lon);
  
  // Validar que esté dentro del área de Valparaíso (no en el mar)
  if (lat < VALPO_BOUNDS.latMin || lat > VALPO_BOUNDS.latMax ||
      lng < VALPO_BOUNDS.lngMin || lng > VALPO_BOUNDS.lngMax) {
    // Fuera del área esperada pero puede ser válido (ej: Laguna Verde, Juan Fernández)
    // Aceptar si está en Chile continental
    if (lat < -56 || lat > -17 || lng < -76 || lng > -66) {
      return null; // Definitivamente fuera de Chile
    }
  }
  
  return { lat, lng };
}

async function main() {
  console.log('Cargando establecimientos desde Supabase...');
  
  const { data: establecimientos, error } = await sb
    .from('slep_establecimientos')
    .select('id, nombre_establecimiento, direccion')
    .order('nombre_establecimiento');
  
  if (error) {
    console.error('Error cargando datos:', error);
    process.exit(1);
  }
  
  console.log(`Total: ${establecimientos.length} establecimientos`);
  
  // Cargar coordenadas existentes si hay (para no re-geocodificar)
  let coordenadas = {};
  if (fs.existsSync(OUTPUT_FILE)) {
    coordenadas = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
    console.log(`Coordenadas existentes: ${Object.keys(coordenadas).length}`);
  }
  
  let geocodificados = 0;
  let fallidos = [];
  
  for (const est of establecimientos) {
    // Skip si ya tenemos coordenadas
    if (coordenadas[est.id] && coordenadas[est.id].lat) {
      continue;
    }
    
    const direccionLimpia = limpiarDireccion(est.direccion);
    
    if (!direccionLimpia) {
      fallidos.push({ id: est.id, nombre: est.nombre_establecimiento, razon: 'Sin dirección' });
      continue;
    }
    
    console.log(`  [${geocodificados + 1}] Geocodificando: ${est.nombre_establecimiento}`);
    console.log(`       Dirección: ${direccionLimpia}`);
    
    try {
      const coords = await geocodificar(direccionLimpia);
      
      if (coords) {
        coordenadas[est.id] = { lat: coords.lat, lng: coords.lng };
        geocodificados++;
        console.log(`       ✓ ${coords.lat}, ${coords.lng}`);
      } else {
        // Intentar solo con el nombre del establecimiento + Valparaíso
        const fallback = `${est.nombre_establecimiento}, Valparaíso, Chile`;
        console.log(`       × Sin resultado. Intentando: ${fallback}`);
        await sleep(1100);
        
        const coords2 = await geocodificar(fallback);
        if (coords2) {
          coordenadas[est.id] = { lat: coords2.lat, lng: coords2.lng };
          geocodificados++;
          console.log(`       ✓ (fallback) ${coords2.lat}, ${coords2.lng}`);
        } else {
          fallidos.push({ id: est.id, nombre: est.nombre_establecimiento, direccion: est.direccion });
          console.log(`       ✗ NO ENCONTRADO`);
        }
      }
    } catch (err) {
      console.error(`       ERROR: ${err.message}`);
      fallidos.push({ id: est.id, nombre: est.nombre_establecimiento, direccion: est.direccion, error: err.message });
    }
    
    // Rate limit: 1 req/seg
    await sleep(1100);
  }
  
  // Guardar resultados
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(coordenadas, null, 2), 'utf8');
  
  console.log('\n===== RESUMEN =====');
  console.log(`Geocodificados exitosamente: ${geocodificados}`);
  console.log(`Total con coordenadas: ${Object.keys(coordenadas).length}`);
  console.log(`Fallidos: ${fallidos.length}`);
  
  if (fallidos.length > 0) {
    console.log('\nEstablecimientos sin coordenadas:');
    fallidos.forEach(f => {
      console.log(`  - [id:${f.id}] ${f.nombre} | ${f.direccion || f.razon}`);
    });
  }
  
  console.log(`\nArchivo generado: ${OUTPUT_FILE}`);
}

main().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});

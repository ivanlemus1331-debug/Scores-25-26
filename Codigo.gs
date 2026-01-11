
/**
 * EduGrade Pro - Backend (Google Apps Script)
 */

const SPREADSHEET_ID = '1gYLoZpz8G_1DEUrsoA-SwsCt3HksTtqT8jDODXihXao';

const SHEETS = {
  ESTUDIANTES: 'Estudiantes',
  REGISTROS: 'Registros'
};

function setup() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    if (!ss.getSheetByName(SHEETS.ESTUDIANTES)) {
      ss.insertSheet(SHEETS.ESTUDIANTES).appendRow(['ID', 'Apellidos', 'Nombres', 'Grado']);
    }
    if (!ss.getSheetByName(SHEETS.REGISTROS)) {
      // Actualizada cabecera para incluir Maestro
      ss.insertSheet(SHEETS.REGISTROS).appendRow(['ID', 'Fecha', 'Estudiante ID', 'Nombre Completo', 'Grado', 'Materia', 'Categoría', 'Puntaje', 'Maestro(a)']);
    }
  } catch (e) {
    Logger.log("Error en setup: " + e.toString());
  }
}

function doGet() {
  setup();
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('EduGrade Pro')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function obtenerDatosCompletos() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheetEst = ss.getSheetByName(SHEETS.ESTUDIANTES);
  const dataEst = sheetEst.getDataRange().getValues();
  const estudiantes = dataEst.length > 1 ? dataEst.slice(1).map(row => ({
    id: String(row[0]),
    lastName: String(row[1]),
    firstName: String(row[2]),
    grade: String(row[3])
  })) : [];

  const sheetReg = ss.getSheetByName(SHEETS.REGISTROS);
  const dataReg = sheetReg.getDataRange().getValues();
  const registros = dataReg.length > 1 ? dataReg.slice(1).map(row => ({
    id: String(row[0]),
    date: row[1] instanceof Date ? row[1].toISOString().split('T')[0] : String(row[1]),
    studentId: String(row[2]),
    fullName: String(row[3]),
    grade: String(row[4]),
    subject: String(row[5]),
    category: String(row[6]),
    score: Number(row[7]),
    teacher: String(row[8] || 'N/A')
  })) : [];

  return { estudiantes, registros };
}

function guardarRegistroBatch(datos) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheetReg = ss.getSheetByName(SHEETS.REGISTROS);
  const timestamp = new Date().getTime();
  
  // Mapeo incluyendo el maestro desde el payload del frontend
  const nuevasFilas = datos.puntuaciones.map((item, index) => [
    'REG-' + timestamp + '-' + index,
    datos.fecha,
    item.studentId,
    item.fullName,
    datos.grado,
    datos.materia,
    datos.categoria,
    item.score,
    item.teacher || 'Sin Maestro'
  ]);

  if (nuevasFilas.length > 0) {
    sheetReg.getRange(sheetReg.getLastRow() + 1, 1, nuevasFilas.length, 9).setValues(nuevasFilas);
  }
  return { success: true };
}

function gestionarEstudiantesGAS(accion, datos) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheetEst = ss.getSheetByName(SHEETS.ESTUDIANTES);
  if (accion === 'crear_individual') {
    const id = 'STU-' + new Date().getTime();
    sheetEst.appendRow([id, datos.lastName, datos.firstName, datos.grade]);
    return { success: true };
  }
  if (accion === 'crear_lote') {
    const lineas = datos.texto.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const timestamp = new Date().getTime();
    const filas = lineas.map((linea, index) => {
      const id = 'STU-' + (timestamp + index);
      let apellido = '', nombre = '';
      if (linea.includes(',')) {
        [apellido, nombre] = linea.split(',').map(s => s.trim());
      } else {
        const partes = linea.split(' ');
        nombre = partes[0] || '---';
        apellido = partes.slice(1).join(' ') || '---';
      }
      return [id, apellido, nombre, datos.grade];
    });
    if (filas.length > 0) {
      sheetEst.getRange(sheetEst.getLastRow() + 1, 1, filas.length, 4).setValues(filas);
    }
    return { success: true, count: filas.length };
  }
}

function editarNotaGAS(id, nuevoPuntaje) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheetReg = ss.getSheetByName(SHEETS.REGISTROS);
  const ids = sheetReg.getRange("A:A").getValues();
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === id) {
      sheetReg.getRange(i + 1, 8).setValue(nuevoPuntaje);
      return { success: true };
    }
  }
  return { success: false };
}

function eliminarNotaGAS(id) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheetReg = ss.getSheetByName(SHEETS.REGISTROS);
  const ids = sheetReg.getRange("A:A").getValues();
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === id) {
      sheetReg.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false };
}

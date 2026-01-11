
import { Student, GradeRecord } from '../types';

/**
 * Puente entre el Frontend y el Backend (Google Apps Script / LocalStorage)
 */

declare const google: any;

const isGAS = typeof google !== 'undefined' && google.script && google.script.run;

// Wrapper para llamar a funciones de GAS con Promesas
const runGAS = (functionName: string, ...args: any[]): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!isGAS) {
      console.warn(`GAS no detectado. Modo LocalStorage activo para: ${functionName}`);
      resolve(null);
      return;
    }
    (google.script.run as any)
      .withSuccessHandler((result: any) => {
        console.log(`GAS Success [${functionName}]:`, result);
        resolve(result);
      })
      .withFailureHandler((error: any) => {
        console.error(`GAS Error [${functionName}]:`, error);
        reject(error);
      })[functionName](...args);
  });
};

export const dataService = {
  // Sincronización inicial
  getAllData: async (): Promise<{ estudiantes: Student[], registros: GradeRecord[] }> => {
    if (!isGAS) {
      const st = localStorage.getItem('edugrade_students');
      const re = localStorage.getItem('edugrade_records');
      return {
        estudiantes: st ? JSON.parse(st) : [],
        registros: re ? JSON.parse(re) : []
      };
    }
    const result = await runGAS('obtenerDatosCompletos');
    return result || { estudiantes: [], registros: [] };
  },

  getStudents: async (): Promise<Student[]> => {
    const data = await dataService.getAllData();
    return data.estudiantes;
  },

  getRecords: async (): Promise<GradeRecord[]> => {
    const data = await dataService.getAllData();
    return data.registros;
  },

  addStudent: async (lastName: string, firstName: string, grade: string): Promise<void> => {
    if (!isGAS) {
      const students = JSON.parse(localStorage.getItem('edugrade_students') || '[]');
      students.push({ id: 'STU-'+Date.now(), lastName, firstName, grade });
      localStorage.setItem('edugrade_students', JSON.stringify(students));
      return;
    }
    await runGAS('gestionarEstudiantesGAS', 'crear_individual', { lastName, firstName, grade });
  },

  addStudentsBulk: async (text: string, grade: string): Promise<number> => {
    if (!isGAS) {
      const lines = text.split('\n').filter(l => l.trim().length > 0);
      const students = JSON.parse(localStorage.getItem('edugrade_students') || '[]');
      const news = lines.map((l, i) => ({ id: 'STU-'+Date.now()+i, lastName: l, firstName: '---', grade }));
      localStorage.setItem('edugrade_students', JSON.stringify([...students, ...news]));
      return news.length;
    }
    const res = await runGAS('gestionarEstudiantesGAS', 'crear_lote', { texto: text, grade });
    return res?.count || 0;
  },

  saveGradeBatch: async (date: string, grade: string, subject: string, category: string, scores: any[]): Promise<void> => {
    if (!isGAS) {
      const records = JSON.parse(localStorage.getItem('edugrade_records') || '[]');
      const news = scores.map(s => ({ id: 'REG-'+Date.now()+Math.random(), date, studentId: s.studentId, fullName: s.fullName, grade, subject, category, score: s.score }));
      localStorage.setItem('edugrade_records', JSON.stringify([...records, ...news]));
      return;
    }
    await runGAS('guardarRegistroBatch', { fecha: date, grado: grade, materia: subject, categoria: category, puntuaciones: scores });
  },

  editRecord: async (id: string, newScore: number): Promise<void> => {
    if (!isGAS) {
      const records = JSON.parse(localStorage.getItem('edugrade_records') || '[]');
      const updated = records.map((r: any) => r.id === id ? { ...r, score: newScore } : r);
      localStorage.setItem('edugrade_records', JSON.stringify(updated));
      return;
    }
    await runGAS('editarNotaGAS', id, newScore);
  },

  deleteRecord: async (id: string): Promise<void> => {
    if (!isGAS) {
      const records = JSON.parse(localStorage.getItem('edugrade_records') || '[]');
      localStorage.setItem('edugrade_records', JSON.stringify(records.filter((r: any) => r.id !== id)));
      return;
    }
    await runGAS('eliminarNotaGAS', id);
  }
};

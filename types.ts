
export interface Student {
  id: string;
  lastName: string;
  firstName: string;
  grade: string;
}

export interface GradeRecord {
  id: string;
  date: string;
  studentId: string;
  fullName: string;
  grade: string;
  subject: string;
  category: string;
  score: number;
  teacher: string; // Nuevo campo
}

export type TabType = 'entry' | 'students' | 'reports';

export const TEACHERS = [
  'Aarón Alvarenga', 'Adriana Rossell', 'Alejandra Flores', 'Alex Sura',
  'Alfredo Castrillo', 'Armando Rodriguez', 'Cruz María Hidalgo',
  'Dinora Segundo', 'Elvis Paredes', 'Fryda Sales', 'Gabriel Chicas',
  'Gabriela López', 'Gustavo Ramírez', 'Inés Escobar', 'Iván Lemus',
  'Josué Mejía', 'Karen Orellana', 'Luis Aparicio', 'Max Hernández',
  'Nidia Santana', 'Patricia de García', 'Patricia Urrutia',
  'Rebeca Umaña', 'Ricardo Hernández', 'Roberto Flores', 'Sonia Flores',
  'Verónica Martínez', 'Victoria Corado', 'Yandy de Carranza'
];

export const GRADES = [
  '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade',
  '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'
];

export const ALL_SUBJECTS = [
  'Algebra and Geometry I', 'Algebra and Geometry II', 'AP Economics', 'AP English Language',
  'AP Environmental Science', 'AP History', 'AP Precalculus I', 'AP Precalculus II',
  'AP Spanish', 'Arte', 'Artes Gráficas', 'Biology', 'Careers', 'Chemistry',
  'Ciudadanía y Valores', 'College Writing', 'Comunicación', 'Comunicación y Literatura',
  'Deportes', 'Dibujo Técnico I', 'Dibujo Técnico II', 'Economics', 'Français',
  'Geography', 'Habilidades para la Vida', 'History', 'IT', 'Language Arts',
  'Lectura Comprensiva', 'Lengua y Literatura', 'Math', 'Music', 'Natación',
  'Physics', 'Reading', 'Science', 'Taller Espacial', 'TOEFL'
];

export const SUBJECTS_BY_GRADE: Record<string, string[]> = {
  '1st Grade': ['Math', 'Language Arts', 'Science', 'Music', 'Arte', 'Deportes', 'Reading'],
  '2nd Grade': ['Math', 'Language Arts', 'Science', 'Music', 'Arte', 'Deportes', 'Reading'],
  '3rd Grade': ['Math', 'Language Arts', 'Science', 'Music', 'Arte', 'Deportes', 'Reading'],
  '4th Grade': ['Math', 'Language Arts', 'Science', 'Music', 'Arte', 'Deportes', 'Reading'],
  '5th Grade': ['Math', 'Language Arts', 'Science', 'Music', 'Arte', 'Deportes', 'Reading'],
  '6th Grade': ['Math', 'Language Arts', 'Science', 'Music', 'Arte', 'Deportes', 'Reading'],
  '7th Grade': ['Math', 'Language Arts', 'Science', 'History', 'Geography', 'Music', 'Arte', 'Deportes', 'Physics'],
  '8th Grade': ['Math', 'Language Arts', 'Science', 'History', 'Geography', 'Music', 'Arte', 'Deportes', 'Physics', 'Chemistry'],
  '9th Grade': ['Algebra and Geometry I', 'Biology', 'History', 'Language Arts', 'Français', 'IT', 'Deportes', 'Ciudadanía y Valores'],
  '10th Grade': ['Algebra and Geometry II', 'Chemistry', 'History', 'Language Arts', 'Français', 'IT', 'Deportes', 'Ciudadanía y Valores'],
  '11th Grade': ['AP Precalculus I', 'Physics', 'AP History', 'AP English Language', 'AP Spanish', 'Economics', 'Careers'],
  '12th Grade': ['AP Precalculus II', 'AP Environmental Science', 'College Writing', 'AP Economics', 'TOEFL', 'Habilidades para la Vida']
};

export const CATEGORIES = [
  'Actividad 1', 'Actividad 2', 'Actividad 3', 'Examen de Período',
  'Actividad Integradora', 'Proyecto de Trimestre', 'Puntos Extra (Participación)',
  'Puntos Extra (Actitudinal)', 'Tareas'
];

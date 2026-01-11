
import React, { useState, useEffect, useRef } from 'react';
import { GRADES, SUBJECTS_BY_GRADE, CATEGORIES, TEACHERS, Student } from '../types';
import { dataService } from '../services/dataService';

interface Props {
  onNotify: (msg: string, type?: 'success' | 'error') => void;
  onDirtyChange: (dirty: boolean) => void;
}

const GradeEntryTab: React.FC<Props> = ({ onNotify, onDirtyChange }) => {
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<Student[]>([]);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Informar al padre si hay datos escritos
  // Fix: Cast unknown value to string before calling trim() to satisfy TypeScript
  useEffect(() => {
    const hasScores = Object.values(scores).some(val => String(val ?? '').trim() !== '');
    onDirtyChange(hasScores);
  }, [scores, onDirtyChange]);

  // Lógica para cerrar calendario al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTeacherChange = (val: string) => {
    setSelectedTeacher(val);
    setSelectedSubject('');
    setSelectedGrade('');
    setSelectedCategory('');
  };

  const handleSubjectChange = (val: string) => {
    setSelectedSubject(val);
    setSelectedGrade('');
    setSelectedCategory('');
  };

  const handleGradeChange = (val: string) => {
    setSelectedGrade(val);
    setSelectedCategory('');
  };

  useEffect(() => {
    const fetchStudents = async () => {
      if (selectedGrade) {
        setLoading(true);
        try {
          const allStudents = await dataService.getStudents();
          const filtered = allStudents.filter(s => s.grade === selectedGrade);
          setStudents(filtered);
          
          const initialScores: Record<string, string> = {};
          filtered.forEach(s => { initialScores[s.id] = ''; });
          setScores(initialScores);
        } catch (e) {
          onNotify('Error al cargar estudiantes', 'error');
        } finally {
          setLoading(false);
        }
      } else {
        setStudents([]);
      }
    };
    fetchStudents();
  }, [selectedGrade]);

  const handleScoreChange = (id: string, value: string) => {
    setScores(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    if (!selectedTeacher || !selectedSubject || !selectedGrade || !selectedCategory) {
      onNotify('Completa toda la configuración requerida', 'error');
      return;
    }

    const payload = students.map(s => ({
      studentId: s.id,
      fullName: `${s.lastName}, ${s.firstName}`,
      score: parseFloat(scores[s.id]) || 0,
      teacher: selectedTeacher
    }));

    setLoading(true);
    try {
      await dataService.saveGradeBatch(date, selectedGrade, selectedSubject, selectedCategory, payload);
      onNotify('Sincronizado con Google Sheets');
      onDirtyChange(false); // Resetear dirty inmediatamente al guardar
      const reset: Record<string, string> = {};
      students.forEach(s => reset[s.id] = '');
      setScores(reset);
    } catch (e) {
      onNotify('Error de sincronización', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Helper para renderizar el calendario personalizado
  const CalendarPicker = () => {
    const [viewDate, setViewDate] = useState(new Date(date + 'T12:00:00'));
    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const changeMonth = (offset: number) => {
      setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
    };

    const selectDay = (day: number) => {
      const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
      setDate(selected.toISOString().split('T')[0]);
      setShowCalendar(false);
    };

    const currentDay = new Date(date + 'T12:00:00').getDate();
    const isCurrentMonth = new Date(date + 'T12:00:00').getMonth() === viewDate.getMonth() && 
                          new Date(date + 'T12:00:00').getFullYear() === viewDate.getFullYear();

    return (
      <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[110] p-4 animate-slideUp">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"><i className="fas fa-chevron-left text-xs"></i></button>
          <span className="text-sm font-black text-slate-700 uppercase tracking-tighter">{monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}</span>
          <button onClick={() => changeMonth(1)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"><i className="fas fa-chevron-right text-xs"></i></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map(d => <span key={d} className="text-[10px] font-black text-slate-300">{d}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array(firstDay).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
            <button
              key={day}
              onClick={() => selectDay(day)}
              className={`text-xs py-2 rounded-lg font-bold transition-all ${isCurrentMonth && day === currentDay ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'hover:bg-indigo-50 text-slate-600'}`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const ALL_UNIQUE_SUBJECTS = Array.from(new Set(Object.values(SUBJECTS_BY_GRADE).flat())).sort();

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <i className="fas fa-tasks text-indigo-500"></i>
          Configuración de Clase
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              <span className="bg-indigo-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px]">1</span>
              Maestro(a)
            </label>
            <select 
              value={selectedTeacher}
              onChange={(e) => handleTeacherChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            >
              <option value="">Seleccionar...</option>
              {TEACHERS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className={`text-xs font-bold uppercase flex items-center gap-2 ${!selectedTeacher ? 'text-slate-300' : 'text-slate-500'}`}>
              <span className={`${!selectedTeacher ? 'bg-slate-200' : 'bg-indigo-600'} text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px]`}>2</span>
              Materia
            </label>
            <select 
              value={selectedSubject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              disabled={!selectedTeacher}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <option value="">Seleccionar...</option>
              {ALL_UNIQUE_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className={`text-xs font-bold uppercase flex items-center gap-2 ${!selectedSubject ? 'text-slate-300' : 'text-slate-500'}`}>
              <span className={`${!selectedSubject ? 'bg-slate-200' : 'bg-indigo-600'} text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px]`}>3</span>
              Grado
            </label>
            <select 
              value={selectedGrade}
              onChange={(e) => handleGradeChange(e.target.value)}
              disabled={!selectedSubject}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <option value="">Seleccionar...</option>
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className={`text-xs font-bold uppercase flex items-center gap-2 ${!selectedGrade ? 'text-slate-300' : 'text-slate-500'}`}>
              <span className={`${!selectedGrade ? 'bg-slate-200' : 'bg-indigo-600'} text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px]`}>4</span>
              Categoría
            </label>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={!selectedGrade}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <option value="">Seleccionar...</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-1.5 relative" ref={calendarRef}>
            <label className={`text-xs font-bold uppercase flex items-center gap-2 ${!selectedCategory ? 'text-slate-300' : 'text-slate-500'}`}>
              <span className={`${!selectedCategory ? 'bg-slate-200' : 'bg-indigo-600'} text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px]`}>5</span>
              Fecha
            </label>
            <div 
              onClick={() => !loading && selectedCategory && setShowCalendar(!showCalendar)}
              className={`w-full bg-slate-50 border border-slate-200 rounded-xl p-3 flex justify-between items-center cursor-pointer transition-all ${!selectedCategory ? 'opacity-50 cursor-not-allowed' : 'hover:border-indigo-300 hover:bg-indigo-50/10'}`}
            >
              <span className={`font-bold text-sm ${!selectedCategory ? 'text-slate-300' : 'text-indigo-600'}`}>{date}</span>
              <i className="fas fa-calendar-alt text-slate-400 text-xs"></i>
            </div>
            {showCalendar && <CalendarPicker />}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-20 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <i className="fas fa-spinner fa-spin text-3xl mb-4 text-indigo-500"></i>
          <p className="font-medium tracking-tight">Cargando lista de estudiantes...</p>
        </div>
      ) : selectedGrade && students.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-slideUp">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estudiante</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Calificación (0-10)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map(student => (
                <tr key={student.id} className="hover:bg-indigo-50/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{student.lastName}, {student.firstName}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <input 
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={scores[student.id] || ''}
                      onChange={(e) => handleScoreChange(student.id, e.target.value)}
                      placeholder="Puntaje (0-10)"
                      className="w-32 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-right focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-600 placeholder:text-slate-300 placeholder:font-normal placeholder:text-sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-6 bg-slate-50 border-t flex justify-between items-center">
             <p className="text-xs text-slate-400 italic">Se guardará bajo el maestro: <strong>{selectedTeacher}</strong></p>
            <button 
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-10 rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
            >
              Guardar Calificaciones
            </button>
          </div>
        </div>
      ) : selectedGrade ? (
         <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
            <i className="fas fa-user-slash text-slate-200 text-5xl mb-4"></i>
            <p className="text-slate-500 font-medium">No se encontraron alumnos registrados en {selectedGrade}.</p>
         </div>
      ) : (
        <div className="p-20 text-center text-slate-300 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center gap-4">
          <i className="fas fa-mouse-pointer text-4xl"></i>
          <p className="font-medium text-slate-400">Completa la configuración superior para visualizar la lista de alumnos.</p>
        </div>
      )}
    </div>
  );
};

export default GradeEntryTab;

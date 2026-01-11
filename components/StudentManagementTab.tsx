
import React, { useState } from 'react';
import { GRADES } from '../types';
import { dataService } from '../services/dataService';

interface Props {
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}

const StudentManagementTab: React.FC<Props> = ({ onNotify }) => {
  const [loading, setLoading] = useState(false);
  
  // Individual Form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [grade, setGrade] = useState(GRADES[0]);

  // Bulk Form
  const [bulkGrade, setBulkGrade] = useState(GRADES[0]);
  const [bulkText, setBulkText] = useState('');

  const handleCreateIndividual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName) {
      onNotify('Por favor completa todos los campos', 'error');
      return;
    }
    
    setLoading(true);
    try {
      await dataService.addStudent(lastName, firstName, grade);
      onNotify('Estudiante guardado en Google Sheets');
      setFirstName('');
      setLastName('');
    } catch (err) {
      onNotify('Error al guardar estudiante', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBulk = async () => {
    if (!bulkText.trim()) {
      onNotify('La lista está vacía', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const count = await dataService.addStudentsBulk(bulkText, bulkGrade);
      onNotify(`¡Éxito! Se han importado ${count} estudiantes a la hoja`);
      setBulkText('');
    } catch (err) {
      onNotify('Error en la carga masiva', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
      {/* Individual Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 flex flex-col relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <i className="fas fa-circle-notch fa-spin text-indigo-600 text-3xl"></i>
          </div>
        )}
        
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600">
            <i className="fas fa-user-plus text-xl"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Registro Individual</h2>
            <p className="text-xs text-slate-500 font-medium">Agrega un alumno a la base de datos</p>
          </div>
        </div>
        
        <form onSubmit={handleCreateIndividual} className="space-y-5 flex-grow">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Apellidos</label>
            <input 
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Ej. Perez Garcia"
              disabled={loading}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300 font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombres</label>
            <input 
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Ej. Juan Jose"
              disabled={loading}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300 font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asignar a Grado</label>
            <select 
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              disabled={loading}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-700 cursor-pointer"
            >
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-2xl transition-all shadow-lg shadow-indigo-100 active:scale-[0.98] mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-check-circle'}`}></i>
            {loading ? 'Guardando...' : 'Confirmar Registro'}
          </button>
        </form>
      </div>

      {/* Bulk Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 flex flex-col relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <i className="fas fa-circle-notch fa-spin text-amber-600 text-3xl"></i>
          </div>
        )}

        <div className="flex items-center gap-4 mb-8">
          <div className="bg-amber-100 p-3 rounded-2xl text-amber-600">
            <i className="fas fa-file-import text-xl"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Importación Masiva</h2>
            <p className="text-xs text-slate-500 font-medium">Carga listas completas desde Excel o Texto</p>
          </div>
        </div>

        <div className="space-y-6 flex-grow">
          {/* GRADO SELECCIONABLE PARA EL LOTE */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest ml-1">1. Seleccionar Grado de Destino</label>
            <select 
              value={bulkGrade}
              onChange={(e) => setBulkGrade(e.target.value)}
              disabled={loading}
              className="w-full bg-amber-50/30 border border-amber-100 rounded-2xl p-4 focus:ring-2 focus:ring-amber-500 outline-none transition-all font-bold text-amber-900 cursor-pointer"
            >
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">2. Pegar Lista de Alumnos</label>
              <span className="text-[9px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-black tracking-tighter uppercase">Formato: Apellido, Nombre</span>
            </div>
            <textarea 
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              disabled={loading}
              rows={7}
              placeholder="Ejemplo:&#10;Alvarenga, Juan&#10;Flores, Maria&#10;Lemus, Ricardo"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 focus:ring-2 focus:ring-amber-500 outline-none transition-all font-mono text-sm leading-relaxed placeholder:text-slate-300 resize-none disabled:opacity-50 shadow-inner"
            ></textarea>
          </div>

          <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50 flex gap-4">
            <i className="fas fa-info-circle text-amber-500 mt-1"></i>
            <p className="text-[11px] text-amber-800 leading-normal font-medium">
              Escribe un nombre por cada línea. Si usas comas, el sistema separará automáticamente apellidos de nombres.
            </p>
          </div>

          <button 
            onClick={handleCreateBulk}
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-5 rounded-2xl transition-all shadow-lg shadow-amber-100 active:scale-[0.98] mt-auto flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-cloud-upload-alt'}`}></i>
            {loading ? 'Procesando...' : 'Iniciar Importación Masiva'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentManagementTab;

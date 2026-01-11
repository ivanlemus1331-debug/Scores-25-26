
import React, { useState, useEffect } from 'react';
import { GRADES, TEACHERS, GradeRecord } from '../types';
import { dataService } from '../services/dataService';

interface Props {
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}

const ReportsTab: React.FC<Props> = ({ onNotify }) => {
  const [records, setRecords] = useState<GradeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterGrade, setFilterGrade] = useState('');
  const [filterTeacher, setFilterTeacher] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await dataService.getAllData();
      if (data && data.registros) {
        setRecords(data.registros);
      } else {
        setRecords([]);
      }
    } catch (e) {
      onNotify('Error al leer de la hoja de cálculo', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadData(); 
  }, []);

  // Agrupamos por estudiante para simular la vista de sábana de notas
  const filteredRecords = records.filter(r => {
    const matchesGrade = filterGrade ? r.grade === filterGrade : true;
    const matchesTeacher = filterTeacher ? r.teacher === filterTeacher : true;
    return matchesGrade && matchesTeacher;
  });

  const handleEdit = async (id: string, current: number) => {
    const val = prompt("Nuevo puntaje (0.00 - 10.00):", current.toFixed(2));
    if (val !== null) {
      const parsedVal = parseFloat(val);
      if (isNaN(parsedVal) || parsedVal < 0 || parsedVal > 10) {
        onNotify('Puntaje inválido', 'error');
        return;
      }
      setLoading(true);
      try {
        await dataService.editRecord(id, parsedVal);
        onNotify('Nota actualizada correctamente');
        await loadData();
      } catch (err) {
        onNotify('Error al actualizar nota', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1.5 min-w-[180px]">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Grado</label>
          <select 
            value={filterGrade} 
            onChange={e => setFilterGrade(e.target.value)} 
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-slate-700 transition-all"
          >
            <option value="">Todos los grados</option>
            {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 min-w-[180px]">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Maestro(a)</label>
          <select 
            value={filterTeacher} 
            onChange={e => setFilterTeacher(e.target.value)} 
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-slate-700 transition-all"
          >
            <option value="">Todos los maestros</option>
            {TEACHERS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <button 
          onClick={loadData} 
          disabled={loading}
          className="bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-slate-900 transition-all flex items-center gap-2 text-sm disabled:opacity-50"
        >
          <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
          {loading ? 'Sincronizando...' : 'Refrescar'}
        </button>
      </div>

      {/* Tabla Formato Solicitado */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[#2D2E3E] text-white">
                <th className="px-4 py-4 text-[11px] font-bold uppercase border-r border-slate-600/50 w-12 text-center">#</th>
                <th className="px-4 py-4 text-[11px] font-bold uppercase border-r border-slate-600/50 w-32">Carné</th>
                <th className="px-4 py-4 text-[11px] font-bold uppercase border-r border-slate-600/50">Nombre</th>
                <th className="px-4 py-4 text-[11px] font-bold uppercase border-r border-slate-600/50 text-center w-36">Actividad 1</th>
                <th className="px-4 py-4 text-[11px] font-bold uppercase border-r border-slate-600/50 text-center w-36">Actividad 2</th>
                <th className="px-4 py-4 text-[11px] font-bold uppercase border-r border-slate-600/50 text-center w-36">Actividad 3</th>
                <th className="px-4 py-4 text-[11px] font-bold uppercase border-r border-slate-600/50 text-center w-48">Actividad Integradora</th>
                <th className="px-4 py-4 text-[11px] font-bold uppercase text-center w-36">Examen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-24 text-center text-slate-400 italic font-medium bg-slate-50">
                    {loading ? 'Buscando registros en la nube...' : 'No hay datos para mostrar con los filtros seleccionados.'}
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record, index) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 py-3 text-sm text-slate-500 text-center border-r border-slate-200">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-slate-600 border-r border-slate-200 font-mono uppercase">
                      {record.studentId.substring(0, 8)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-700 border-r border-slate-200">
                      {record.fullName}
                    </td>
                    
                    {/* Renderización de columnas de notas con formato de input solicitado */}
                    <td className="px-3 py-2 border-r border-slate-200">
                      <div 
                        onClick={() => handleEdit(record.id, record.score)}
                        className="cursor-pointer bg-white border border-slate-300 rounded-lg p-3 text-sm font-bold text-slate-600 text-center shadow-sm hover:border-indigo-400 transition-all"
                      >
                        {record.category === 'Actividad 1' ? record.score.toFixed(2) : '0.00'}
                      </div>
                    </td>
                    <td className="px-3 py-2 border-r border-slate-200">
                      <div className="bg-white border border-slate-300 rounded-lg p-3 text-sm font-bold text-slate-600 text-center shadow-sm">
                        {record.category === 'Actividad 2' ? record.score.toFixed(2) : '0.00'}
                      </div>
                    </td>
                    <td className="px-3 py-2 border-r border-slate-200">
                      <div className="bg-white border border-slate-300 rounded-lg p-3 text-sm font-bold text-slate-600 text-center shadow-sm">
                        {record.category === 'Actividad 3' ? record.score.toFixed(2) : '0.00'}
                      </div>
                    </td>
                    <td className="px-3 py-2 border-r border-slate-200">
                      <div className="bg-white border border-slate-300 rounded-lg p-3 text-sm font-bold text-slate-600 text-center shadow-sm">
                        {record.category === 'Actividad Integradora' ? record.score.toFixed(2) : '0.00'}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="bg-white border border-slate-300 rounded-lg p-3 text-sm font-bold text-slate-600 text-center shadow-sm">
                        {record.category === 'Examen de Período' ? record.score.toFixed(2) : '0.00'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-[#2D2E3E] text-white/70 px-6 py-3 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
          <span>Mostrando {filteredRecords.length} estudiantes</span>
          <div className="flex gap-4">
             <span className="flex items-center gap-1"><i className="fas fa-info-circle text-indigo-400"></i> Haz clic en "Actividad 1" para editar</span>
             <span className="text-white">Cloud Sincronizado</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsTab;

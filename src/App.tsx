import React, { useEffect, useState } from 'react';
import { Screen, TeaRecord } from './types';
import { loadRecords, saveRecords } from './services/storageService';
import { Navigation } from './components/Navigation';
import { CalendarView } from './components/CalendarView';
import { RecordForm } from './components/RecordForm';
import { StatsView } from './components/StatsView';
import { LibraryView } from './components/LibraryView';
import { RecordDetailModal } from './components/RecordDetailModal';

export default function App() {
  const [screen, setScreen] = useState<Screen>('calendar');
  const [records, setRecords] = useState<TeaRecord[]>([]);
  const [editingRecord, setEditingRecord] = useState<TeaRecord | undefined>(undefined);
  const [viewingRecord, setViewingRecord] = useState<TeaRecord | null>(null);

  // Initialize Data - Load from localStorage
  useEffect(() => {
    const storedRecords = loadRecords();
    setRecords(storedRecords);
  }, []);

  const handleSaveRecord = (newRecordData: Omit<TeaRecord, 'id'>) => {
    let updatedRecords;
    
    if (editingRecord) {
      // Update existing
      updatedRecords = records.map(r => 
        r.id === editingRecord.id 
          ? { ...newRecordData, id: editingRecord.id } 
          : r
      );
      setEditingRecord(undefined);
    } else {
      // Create new
      const record: TeaRecord = {
        ...newRecordData,
        id: crypto.randomUUID(),
      };
      updatedRecords = [...records, record];
    }
    
    setRecords(updatedRecords);
    saveRecords(updatedRecords);
    setScreen('calendar');
  };

  const handleDeleteRecord = (id: string) => {
    // Removed window.confirm to resolve "no reaction" issue on some devices/environments
    const updated = records.filter(r => r.id !== id);
    setRecords(updated);
    saveRecords(updated);
    // Close detail view if deleting the currently viewed record
    if (viewingRecord?.id === id) {
        setViewingRecord(null);
    }
  };

  const handleEditRecord = (record: TeaRecord) => {
    setEditingRecord(record);
    setScreen('record');
    setViewingRecord(null); // Close detail view if open
  };

  const handleCancelRecord = () => {
    setEditingRecord(undefined);
    setScreen('calendar');
  };

  return (
    <div className="min-h-screen bg-cream relative max-w-lg mx-auto shadow-2xl overflow-hidden font-sans">
      
      {/* Main Content Area */}
      <main className="h-full overflow-y-auto no-scrollbar pb-32">
         {screen === 'calendar' && (
            <CalendarView 
                records={records} 
                onDelete={handleDeleteRecord} 
                onEdit={handleEditRecord} 
                onViewRecord={setViewingRecord}
            />
         )}
         {screen === 'record' && (
            <CalendarView 
                records={records} 
                onDelete={handleDeleteRecord} 
                onEdit={handleEditRecord}
            />
         )}
         {screen === 'stats' && <StatsView records={records} />}
         {screen === 'library' && <LibraryView records={records} />}
      </main>

      {/* Record Overlay Modal (Edit/New) */}
      {screen === 'record' && (
        <div className="fixed inset-0 z-50 bg-cream animate-slide-up overflow-y-auto">
            <RecordForm 
                initialData={editingRecord}
                onSave={handleSaveRecord} 
                onCancel={handleCancelRecord} 
                onDelete={(id) => {
                    handleDeleteRecord(id);
                    setScreen('calendar');
                    setEditingRecord(undefined);
                }}
            />
        </div>
      )}

      {/* View Detail Modal (Read Only) */}
      {viewingRecord && (
          <RecordDetailModal 
            record={viewingRecord} 
            onClose={() => setViewingRecord(null)} 
            onEdit={() => handleEditRecord(viewingRecord)}
          />
      )}

      {/* Navigation - Hide when in record mode */}
      {screen !== 'record' && (
        <Navigation 
            currentScreen={screen} 
            onNavigate={setScreen} 
            onAdd={() => {
                setEditingRecord(undefined);
                setScreen('record');
            }}
        />
      )}
      
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.4s ease-out forwards;
        }
        .animate-slide-up {
            animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
'use client';
import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { CheckCircle, X, Trash2 } from 'lucide-react';

interface SessionData {
  booked: boolean;
  name?: string;
}

type SlotKey = string;

const ScheduleTable = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 12 }, (_, i) => 8 + i); // 8 AM to 8 PM

  const [slots, setSlots] = useState<Record<SlotKey, SessionData>>({});
  const [modalData, setModalData] = useState<{ key: SlotKey; day: string; hour: number } | null>(null);
  const [sessionName, setSessionName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSlotClick = (day: string, hour: number) => {
    const key = `${day}-${hour}`;
    const current = slots[key];
    setModalData({ key, day, hour });
    setSessionName(current?.name || '');
  };

  const handleSaveSession = () => {
    if (!modalData) return;
    setSlots((prev) => {
      const updated = {
        ...prev,
        [modalData.key]: {
          booked: true,
          name: sessionName,
        },
      };
      localStorage.setItem('scheduleSlots', JSON.stringify(updated));
      return updated;
    });
    showToast('Session saved successfully', 'success');
    setModalData(null);
    setSessionName('');
  };

  const handleCancelSession = () => {
    if (!modalData) return;
    setSlots((prev) => {
      const updated = { ...prev };
      delete updated[modalData.key];
      localStorage.setItem('scheduleSlots', JSON.stringify(updated));
      return updated;
    });
    showToast('Session removed', 'info');
    setModalData(null);
    setSessionName('');
  };

  const handleDragEnter = (day: string, hour: number) => {
    if (!isDragging) return;
    const key = `${day}-${hour}`;
    setSlots((prev) => {
      const updated = {
        ...prev,
        [key]: {
          booked: true,
          name: 'Session',
        },
      };
      localStorage.setItem('scheduleSlots', JSON.stringify(updated));
      return updated;
    });
  };

  const confirmReset = () => {
    if (confirm('Are you sure you want to reset the entire schedule? This cannot be undone.')) {
      setSlots({});
      localStorage.removeItem('scheduleSlots');
      showToast('Schedule reset successfully', 'error');
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('scheduleSlots');
    if (stored) {
      setSlots(JSON.parse(stored));
    }
  }, []);

  const summary = days.map((day) => {
    return hours.reduce((acc, hour) => {
      const key = `${day}-${hour}`;
      return acc + (slots[key]?.booked ? 1 : 0);
    }, 0);
  });

  return (
    <section className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Weekly Teaching Schedule</h2>
        <button
          onClick={confirmReset}
          className="flex items-center gap-1 px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 text-sm cursor-pointer hover:transition-all hover:px-4 hover:py-1"
        >
          <Trash2 className="w-4 h-4" /> Reset
        </button>
      </div>

      <div className="overflow-x-auto border rounded-xl bg-white shadow-sm">
        <table className="min-w-full text-sm text-center select-none" onMouseLeave={() => setIsDragging(false)}>
          <thead className="bg-gray-100 text-xs text-gray-600 uppercase tracking-wide">
            <tr>
              <th className="border px-2 py-2 w-20">Time</th>
              {days.map((day, i) => (
                <th key={day} className="border px-2 py-2">
                  {day}
                  <br />
                  <span className="text-xs text-blue-600">{summary[i]} booked</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map((hour) => (
              <tr key={hour}>
                <td className="border px-2 py-2 font-medium">{hour}:00</td>
                {days.map((day) => {
                  const key = `${day}-${hour}`;
                  const slot = slots[key];
                  const isBooked = slot?.booked;

                  return (
                    <td
                      key={key}
                      onClick={() => handleSlotClick(day, hour)}
                      onMouseDown={() => setIsDragging(true)}
                      onMouseUp={() => setIsDragging(false)}
                      onMouseEnter={() => handleDragEnter(day, hour)}
                      className={clsx(
                        'border px-2 py-2 cursor-pointer transition-all duration-150',
                        isBooked ? 'bg-green-600 text-white font-semibold' : 'hover:bg-blue-100 text-gray-700'
                      )}
                    >
                      {slot?.name || (isBooked ? 'Booked' : '')}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-80 p-6">
            <h3 className="text-lg font-semibold mb-4">Set Session Name</h3>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md p-2 mb-4"
              placeholder="e.g. Vocal Class"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={handleCancelSession}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                onClick={handleSaveSession}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={clsx(
            'fixed top-4 right-4 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 transition-all duration-300',
            toast.type === 'success' && 'bg-green-500',
            toast.type === 'info' && 'bg-yellow-500',
            toast.type === 'error' && 'bg-red-500'
          )}
        >
          {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {toast.type === 'info' && <Trash2 className="w-5 h-5" />}
          {toast.type === 'error' && <X className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}
    </section>
  );
};

export default ScheduleTable;

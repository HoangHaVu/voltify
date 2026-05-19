import { useState } from 'react';

interface KanbanColumnProps {
  title: string;
  count?: number;
  color: string;
  columnKey: string;
  onCardDrop: (itemId: string, newStatus: string) => void;
  children: React.ReactNode;
  done?: boolean;
}

export function KanbanColumn({
  title,
  count,
  color,
  columnKey,
  onCardDrop,
  children,
  done,
}: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div
      className={`flex-shrink-0 w-[300px] flex flex-col max-h-full rounded-xl transition-all duration-150 ${
        isDragOver ? 'ring-2 ring-[#F5A623] scale-[1.01]' : ''
      }`}
      onDragOver={(e) => {
        if (done) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      }}
      onDragEnter={(e) => {
        if (done) return;
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={(e) => {
        if (done) return;
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsDragOver(false);
        }
      }}
      onDrop={(e) => {
        if (done) return;
        e.preventDefault();
        const leadId = e.dataTransfer.getData('leadId');
        if (leadId) onCardDrop(leadId, columnKey);
        setIsDragOver(false);
      }}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${color}`} />
          <h3 className="font-bold text-white text-sm">{title}</h3>
          {count !== undefined && (
            <span className="bg-[#252525] text-gray-400 text-xs font-bold px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </div>
      </div>

      {/* Cards Container */}
      <div
        className={`flex-1 overflow-y-auto pr-1 space-y-3 pb-6 min-h-[100px] rounded-lg transition-colors ${
          isDragOver ? 'bg-[#F5A623]/5' : ''
        }`}
      >
        {children}
      </div>
    </div>
  );
}

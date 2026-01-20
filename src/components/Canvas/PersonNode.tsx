import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { getInitials, getAvatarColor } from '../../utils/avatar';

export interface PersonNodeData extends Record<string, unknown> {
  name: string;
  affiliation?: string;
  photoUrl?: string;
  isSelected: boolean;
}

function PersonNode({ data }: NodeProps) {
  const { name, affiliation, photoUrl, isSelected } = data as PersonNodeData;
  const initials = getInitials(name);
  const bgColor = getAvatarColor(name);

  return (
    <div
      className={`
        flex flex-col items-center p-3 bg-white rounded-lg shadow-md
        transition-all duration-150 hover:shadow-lg
        ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
      `}
    >
      {/* Connection handles */}
      <Handle type="target" position={Position.Top} className="!bg-gray-400 !w-2 !h-2" />
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400 !w-2 !h-2" />
      <Handle type="target" position={Position.Left} className="!bg-gray-400 !w-2 !h-2" />
      <Handle type="source" position={Position.Right} className="!bg-gray-400 !w-2 !h-2" />

      {/* Avatar */}
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center text-white font-semibold text-lg overflow-hidden"
        style={{ backgroundColor: photoUrl ? 'transparent' : bgColor }}
      >
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.style.backgroundColor = bgColor;
              e.currentTarget.parentElement!.innerHTML = initials;
            }}
          />
        ) : (
          initials
        )}
      </div>

      {/* Name */}
      <div className="mt-2 text-sm font-medium text-gray-900 text-center max-w-[120px] truncate">
        {name}
      </div>

      {/* Affiliation */}
      {affiliation && (
        <div className="text-xs text-gray-500 text-center max-w-[120px] truncate">{affiliation}</div>
      )}
    </div>
  );
}

export default memo(PersonNode);

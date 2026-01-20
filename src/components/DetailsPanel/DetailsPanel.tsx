import { useMemo } from 'react';
import { X, Edit2, Trash2, ExternalLink, Link2, User } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { getInitials, getAvatarColor } from '../../utils/avatar';
import { LINK_TYPE_LABELS, LINK_TYPE_COLORS } from '../../utils/constants';

function DetailsPanel() {
  const {
    selectedPersonId,
    selectedLinkId,
    getPersonById,
    getLinkById,
    getLinksForPerson,
    clearSelection,
    openEditPersonModal,
    openEditLinkModal,
    openConfirmDialog,
    deletePerson,
    deleteLink,
    openAddLinkModal,
    darkMode,
  } = useStore();

  const selectedPerson = selectedPersonId ? getPersonById(selectedPersonId) : undefined;
  const selectedLink = selectedLinkId ? getLinkById(selectedLinkId) : undefined;

  const personLinks = useMemo(() => {
    if (!selectedPersonId) return [];
    return getLinksForPerson(selectedPersonId);
  }, [selectedPersonId, getLinksForPerson]);

  const sourcePerson = selectedLink ? getPersonById(selectedLink.sourceId) : undefined;
  const targetPerson = selectedLink ? getPersonById(selectedLink.targetId) : undefined;

  // No selection - show empty state
  if (!selectedPerson && !selectedLink) {
    return (
      <div className={`w-80 h-full border-l flex flex-col items-center justify-center text-center p-6 ${
        darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
          darkMode ? 'bg-gray-800' : 'bg-gray-100'
        }`}>
          <User className={`w-8 h-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
        </div>
        <h3 className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>No selection</h3>
        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
          Click on a person or connection to see details
        </p>
      </div>
    );
  }

  // Person selected
  if (selectedPerson) {
    const initials = getInitials(selectedPerson.name);
    const bgColor = getAvatarColor(selectedPerson.name);

    const handleDelete = () => {
      openConfirmDialog(
        `Are you sure you want to delete "${selectedPerson.name}"? This will also remove all their connections.`,
        () => deletePerson(selectedPerson.id)
      );
    };

    return (
      <div className={`w-80 h-full border-l flex flex-col ${
        darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-4 py-3 border-b ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h3 className={`text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Person Details</h3>
          <button
            onClick={clearSelection}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Avatar and name */}
          <div className="p-4 flex flex-col items-center text-center border-b border-gray-100">
            {selectedPerson.photoUrl ? (
              <img
                src={selectedPerson.photoUrl}
                alt={selectedPerson.name}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-semibold"
                style={{ backgroundColor: bgColor }}
              >
                {initials}
              </div>
            )}
            <h2 className="mt-3 text-lg font-semibold text-gray-900">{selectedPerson.name}</h2>
            {selectedPerson.affiliation && (
              <p className="text-sm text-gray-500">{selectedPerson.affiliation}</p>
            )}
            {selectedPerson.stream && (
              <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800">
                {selectedPerson.stream}
              </span>
            )}
            {selectedPerson.interests && selectedPerson.interests.length > 0 && (
              <div className="mt-2 flex flex-wrap justify-center gap-1">
                {selectedPerson.interests.map((interest) => (
                  <span
                    key={interest}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            )}
            {selectedPerson.peeps && (
              <a
                href={selectedPerson.peeps}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="w-3 h-3" />
                Peeps
              </a>
            )}
          </div>

          {/* Actions */}
          <div className="p-4 flex gap-2 border-b border-gray-100">
            <button
              onClick={openEditPersonModal}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Connections */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900">
                Connections ({personLinks.length})
              </h4>
              <button
                onClick={() => openAddLinkModal(selectedPerson.id)}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                + Add
              </button>
            </div>

            {personLinks.length === 0 ? (
              <p className="text-sm text-gray-500">No connections yet</p>
            ) : (
              <ul className="space-y-2">
                {personLinks.map((link) => {
                  const otherPersonId =
                    link.sourceId === selectedPerson.id ? link.targetId : link.sourceId;
                  const otherPerson = getPersonById(otherPersonId);

                  return (
                    <li
                      key={link.id}
                      className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => useStore.getState().selectLink(link.id)}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: LINK_TYPE_COLORS[link.type] }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {otherPerson?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{link.description}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Link selected
  if (selectedLink) {
    const handleDelete = () => {
      openConfirmDialog(
        `Are you sure you want to delete this connection?`,
        () => deleteLink(selectedLink.id)
      );
    };

    return (
      <div className={`w-80 h-full border-l flex flex-col ${
        darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-4 py-3 border-b ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h3 className={`text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Connection Details</h3>
          <button
            onClick={clearSelection}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Connection visualization */}
          <div className="p-4 flex items-center justify-center gap-3 border-b border-gray-100">
            {sourcePerson && (
              <div className="flex flex-col items-center">
                {sourcePerson.photoUrl ? (
                  <img
                    src={sourcePerson.photoUrl}
                    alt={sourcePerson.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium"
                    style={{ backgroundColor: getAvatarColor(sourcePerson.name) }}
                  >
                    {getInitials(sourcePerson.name)}
                  </div>
                )}
                <span className="mt-1 text-xs text-gray-600 max-w-[80px] truncate">
                  {sourcePerson.name}
                </span>
              </div>
            )}

            <div className="flex flex-col items-center">
              <div
                className="w-8 h-0.5 rounded-full"
                style={{ backgroundColor: LINK_TYPE_COLORS[selectedLink.type] }}
              />
              <Link2
                className="w-4 h-4 my-1"
                style={{ color: LINK_TYPE_COLORS[selectedLink.type] }}
              />
              <div
                className="w-8 h-0.5 rounded-full"
                style={{ backgroundColor: LINK_TYPE_COLORS[selectedLink.type] }}
              />
            </div>

            {targetPerson && (
              <div className="flex flex-col items-center">
                {targetPerson.photoUrl ? (
                  <img
                    src={targetPerson.photoUrl}
                    alt={targetPerson.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium"
                    style={{ backgroundColor: getAvatarColor(targetPerson.name) }}
                  >
                    {getInitials(targetPerson.name)}
                  </div>
                )}
                <span className="mt-1 text-xs text-gray-600 max-w-[80px] truncate">
                  {targetPerson.name}
                </span>
              </div>
            )}
          </div>

          {/* Link details */}
          <div className="p-4 space-y-3 border-b border-gray-100">
            <div>
              <label className="text-xs font-medium text-gray-500">Type</label>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: LINK_TYPE_COLORS[selectedLink.type] }}
                />
                <span className="text-sm text-gray-900">
                  {LINK_TYPE_LABELS[selectedLink.type]}
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500">Description</label>
              <p className="text-sm text-gray-900 mt-1">{selectedLink.description}</p>
            </div>

            {selectedLink.url && (
              <div>
                <label className="text-xs font-medium text-gray-500">URL</label>
                <a
                  href={selectedLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open link
                </a>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-4 flex gap-2">
            <button
              onClick={openEditLinkModal}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default DetailsPanel;

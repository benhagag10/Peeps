import { Fragment, useState, useCallback, useEffect } from 'react';
import { Dialog, Transition, Listbox } from '@headlessui/react';
import { X, Link2, ChevronDown, Check, Trash2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { LINK_TYPES, LINK_TYPE_LABELS, LINK_TYPE_COLORS } from '../../utils/constants';
import type { LinkType } from '../../types';

function EditLinkModal() {
  const {
    isEditLinkModalOpen,
    closeEditLinkModal,
    selectedLinkId,
    getLinkById,
    getPersonById,
    updateLink,
    deleteLink,
    openConfirmDialog,
  } = useStore();

  const [description, setDescription] = useState('');
  const [type, setType] = useState<LinkType>('collaborator');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const link = selectedLinkId ? getLinkById(selectedLinkId) : undefined;
  const sourcePerson = link ? getPersonById(link.sourceId) : undefined;
  const targetPerson = link ? getPersonById(link.targetId) : undefined;

  // Populate form when modal opens
  useEffect(() => {
    if (isEditLinkModalOpen && link) {
      setDescription(link.description);
      setType(link.type);
      setUrl(link.url || '');
      setError('');
    }
  }, [isEditLinkModalOpen, link]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!description.trim()) {
        setError('Description is required');
        return;
      }

      if (!selectedLinkId) return;

      updateLink(selectedLinkId, {
        description: description.trim(),
        type,
        url: url.trim() || undefined,
      });

      closeEditLinkModal();
    },
    [description, type, url, selectedLinkId, updateLink, closeEditLinkModal]
  );

  const handleDelete = useCallback(() => {
    if (!selectedLinkId || !link) return;

    openConfirmDialog(
      `Are you sure you want to delete this connection between ${sourcePerson?.name || 'Unknown'} and ${targetPerson?.name || 'Unknown'}?`,
      () => {
        deleteLink(selectedLinkId);
        closeEditLinkModal();
      }
    );
  }, [selectedLinkId, link, sourcePerson, targetPerson, deleteLink, closeEditLinkModal, openConfirmDialog]);

  if (!link) return null;

  return (
    <Transition appear show={isEditLinkModalOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeEditLinkModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Link2 className="w-5 h-5 text-blue-600" />
                    Edit Connection
                  </Dialog.Title>
                  <button
                    onClick={closeEditLinkModal}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>
                  )}

                  {/* Connection info (read-only) */}
                  <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                    <span className="text-gray-700">{sourcePerson?.name || 'Unknown'}</span>
                    <span className="text-gray-400">→</span>
                    <span className="text-gray-700">{targetPerson?.name || 'Unknown'}</span>
                  </div>

                  {/* Link type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <Listbox value={type} onChange={setType}>
                      <div className="relative">
                        <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <span className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: LINK_TYPE_COLORS[type] }}
                            />
                            {LINK_TYPE_LABELS[type]}
                          </span>
                          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          </span>
                        </Listbox.Button>
                        <Transition
                          as={Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
                            {LINK_TYPES.map((linkType) => (
                              <Listbox.Option
                                key={linkType}
                                value={linkType}
                                className={({ active }) =>
                                  `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                    active ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
                                  }`
                                }
                              >
                                {({ selected }) => (
                                  <>
                                    <span className={`flex items-center gap-2 ${selected ? 'font-medium' : 'font-normal'}`}>
                                      <span
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: LINK_TYPE_COLORS[linkType] }}
                                      />
                                      {LINK_TYPE_LABELS[linkType]}
                                    </span>
                                    {selected && (
                                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                        <Check className="h-4 w-4" />
                                      </span>
                                    )}
                                  </>
                                )}
                              </Listbox.Option>
                            ))}
                          </Listbox.Options>
                        </Transition>
                      </div>
                    </Listbox>
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="edit-link-description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="edit-link-description"
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g., Co-authored paper on ML"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                  </div>

                  {/* URL (optional) */}
                  <div>
                    <label htmlFor="edit-link-url" className="block text-sm font-medium text-gray-700 mb-1">
                      URL (optional)
                    </label>
                    <input
                      id="edit-link-url"
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={closeEditLinkModal}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default EditLinkModal;

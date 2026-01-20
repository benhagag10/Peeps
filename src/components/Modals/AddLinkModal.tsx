import { Fragment, useState, useCallback, useEffect } from 'react';
import { Dialog, Transition, Listbox } from '@headlessui/react';
import { X, Link2, ChevronDown, Check } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { LINK_TYPES, LINK_TYPE_LABELS, LINK_TYPE_COLORS } from '../../utils/constants';
import type { LinkType } from '../../types';

function AddLinkModal() {
  const {
    isAddLinkModalOpen,
    closeAddLinkModal,
    pendingLinkSourceId,
    people,
    addLink,
    getPersonById,
  } = useStore();

  const [targetId, setTargetId] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<LinkType>('collaborator');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  // Get the pending target from connection if available
  const state = useStore.getState() as { _pendingLinkTargetId?: string };
  const pendingTargetId = state._pendingLinkTargetId;

  const sourcePerson = pendingLinkSourceId ? getPersonById(pendingLinkSourceId) : undefined;

  // Filter out source person from target options
  const targetOptions = people.filter((p) => p.id !== pendingLinkSourceId);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isAddLinkModalOpen) {
      setTargetId(pendingTargetId || '');
      setDescription('');
      setType('collaborator');
      setUrl('');
      setError('');
    } else {
      // Clear the pending target
      useStore.setState((s) => ({ ...s, _pendingLinkTargetId: undefined }));
    }
  }, [isAddLinkModalOpen, pendingTargetId]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!description.trim()) {
        setError('Description is required');
        return;
      }

      if (!targetId) {
        setError('Please select a target person');
        return;
      }

      if (!pendingLinkSourceId) return;

      addLink({
        sourceId: pendingLinkSourceId,
        targetId,
        description: description.trim(),
        type,
        url: url.trim() || undefined,
      });

      closeAddLinkModal();
    },
    [description, targetId, type, url, pendingLinkSourceId, addLink, closeAddLinkModal]
  );

  const selectedTarget = targetId ? getPersonById(targetId) : undefined;

  return (
    <Transition appear show={isAddLinkModalOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeAddLinkModal}>
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
                    Add Connection
                  </Dialog.Title>
                  <button
                    onClick={closeAddLinkModal}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>
                  )}

                  {/* Source person (read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                      {sourcePerson?.name || 'Unknown'}
                    </div>
                  </div>

                  {/* Target person */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      To <span className="text-red-500">*</span>
                    </label>
                    <Listbox value={targetId} onChange={setTargetId}>
                      <div className="relative">
                        <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <span className="block truncate">
                            {selectedTarget?.name || 'Select a person'}
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
                            {targetOptions.map((person) => (
                              <Listbox.Option
                                key={person.id}
                                value={person.id}
                                className={({ active }) =>
                                  `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                    active ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
                                  }`
                                }
                              >
                                {({ selected }) => (
                                  <>
                                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                      {person.name}
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
                    <label htmlFor="link-description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="link-description"
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
                    <label htmlFor="link-url" className="block text-sm font-medium text-gray-700 mb-1">
                      URL (optional)
                    </label>
                    <input
                      id="link-url"
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={closeAddLinkModal}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Connection
                    </button>
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

export default AddLinkModal;

import { useCallback, useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import Header from './components/Header/Header';
import Canvas from './components/Canvas/Canvas';
import DetailsPanel from './components/DetailsPanel/DetailsPanel';
import AddPersonModal from './components/Modals/AddPersonModal';
import EditPersonModal from './components/Modals/EditPersonModal';
import AddLinkModal from './components/Modals/AddLinkModal';
import EditLinkModal from './components/Modals/EditLinkModal';
import ConfirmDialog from './components/Modals/ConfirmDialog';
import { useStore } from './store/useStore';

function App() {
  const {
    selectedPersonId,
    selectedLinkId,
    clearSelection,
    deletePerson,
    deleteLink,
    openConfirmDialog,
    getPersonById,
    getLinkById,
    darkMode,
  } = useStore();

  // Global keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Escape to clear selection
      if (e.key === 'Escape') {
        clearSelection();
      }

      // Delete to delete selected item
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Don't delete if user is typing in an input
        if (
          document.activeElement?.tagName === 'INPUT' ||
          document.activeElement?.tagName === 'TEXTAREA'
        ) {
          return;
        }

        if (selectedPersonId) {
          const person = getPersonById(selectedPersonId);
          if (person) {
            openConfirmDialog(
              `Are you sure you want to delete "${person.name}"? This will also remove all their connections.`,
              () => deletePerson(selectedPersonId)
            );
          }
        } else if (selectedLinkId) {
          const link = getLinkById(selectedLinkId);
          if (link) {
            openConfirmDialog('Are you sure you want to delete this connection?', () =>
              deleteLink(selectedLinkId)
            );
          }
        }
      }
    },
    [
      clearSelection,
      selectedPersonId,
      selectedLinkId,
      deletePerson,
      deleteLink,
      getPersonById,
      getLinkById,
      openConfirmDialog,
    ]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <ReactFlowProvider>
      <div className={`w-full h-screen flex flex-col ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <Header />
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1">
            <Canvas />
          </div>
          <DetailsPanel />
        </div>
      </div>

      {/* Modals */}
      <AddPersonModal />
      <EditPersonModal />
      <AddLinkModal />
      <EditLinkModal />
      <ConfirmDialog />
    </ReactFlowProvider>
  );
}

export default App;

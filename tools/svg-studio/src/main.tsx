import { createRoot } from 'react-dom/client';
import { App } from './App';
import { EditorContext } from './model/context';
import { EditorStore } from './model/store';
import { loadDocument } from './model/storage';
import './styles.css';

const store = new EditorStore(loadDocument());
createRoot(document.getElementById('root')!).render(
  <EditorContext.Provider value={store}>
    <App />
  </EditorContext.Provider>,
);

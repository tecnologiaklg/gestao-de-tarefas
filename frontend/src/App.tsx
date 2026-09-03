import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ToastContainer } from './components/ui/ToastContainer';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { LoginPage }       from './pages/LoginPage';
import { TarefasPage }     from './pages/TarefasPage';
import { MinhaEquipePage } from './pages/MinhaEquipePage';
import { RootLogsPage }    from './pages/root/RootLogsPage';
import { RootEquipesPage } from './pages/root/RootEquipesPage';
import { RootUsuariosPage} from './pages/root/RootUsuariosPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <ToastContainer />
            <Routes>
              {/* Pública */}
              <Route path="/login" element={<LoginPage />} />

              {/* Usuários normais */}
              <Route path="/tarefas" element={
                <ProtectedRoute requireNotRoot><TarefasPage /></ProtectedRoute>
              } />
              <Route path="/minha-equipe" element={
                <ProtectedRoute requireNotRoot requireCargo="COORDENADOR"><MinhaEquipePage /></ProtectedRoute>
              } />

              {/* Root */}
              <Route path="/root/equipes"  element={<ProtectedRoute requireRoot><RootEquipesPage /></ProtectedRoute>} />
              <Route path="/root/usuarios" element={<ProtectedRoute requireRoot><RootUsuariosPage /></ProtectedRoute>} />
              <Route path="/root/logs"     element={<ProtectedRoute requireRoot><RootLogsPage /></ProtectedRoute>} />

              {/* Fallback / compatibilidade */}
              <Route path="/minhas-tarefas"  element={<Navigate to="/tarefas" replace />} />
              <Route path="/criadas-por-mim" element={<Navigate to="/tarefas" replace />} />
              <Route path="/"                element={<Navigate to="/tarefas" replace />} />
              <Route path="*"                element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

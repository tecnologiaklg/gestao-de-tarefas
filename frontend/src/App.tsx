import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { LoginPage }          from './pages/LoginPage';
import { MinhasTarefasPage }  from './pages/MinhasTarefasPage';
import { CriadasPorMimPage }  from './pages/CriadasPorMimPage';
import { MinhaEquipePage }    from './pages/MinhaEquipePage';
import { RootLogsPage }       from './pages/root/RootLogsPage';
import { RootEquipesPage }    from './pages/root/RootEquipesPage';
import { RootUsuariosPage }   from './pages/root/RootUsuariosPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Pública */}
          <Route path="/login" element={<LoginPage />} />

          {/* Usuários normais */}
          <Route path="/minhas-tarefas" element={
            <ProtectedRoute requireNotRoot><MinhasTarefasPage /></ProtectedRoute>
          } />
          <Route path="/criadas-por-mim" element={
            <ProtectedRoute requireNotRoot><CriadasPorMimPage /></ProtectedRoute>
          } />
          <Route path="/minha-equipe" element={
            <ProtectedRoute requireNotRoot requireCargo="COORDENADOR"><MinhaEquipePage /></ProtectedRoute>
          } />

          {/* Root */}
          <Route path="/root/equipes"  element={<ProtectedRoute requireRoot><RootEquipesPage /></ProtectedRoute>} />
          <Route path="/root/usuarios" element={<ProtectedRoute requireRoot><RootUsuariosPage /></ProtectedRoute>} />
          <Route path="/root/logs"     element={<ProtectedRoute requireRoot><RootLogsPage /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="/" element={<Navigate to="/minhas-tarefas" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

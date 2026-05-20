import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import DiagramPage from './pages/DiagramPage';
import SnippetsPage from './pages/SnippetsPage';
import SnippetViewPage from './pages/SnippetViewPage';
import ToolsPage from './pages/ToolsPage';
import ToolViewPage from './pages/ToolViewPage';
import SettingsPage from './pages/SettingsPage';
import RecycleBinPage from './pages/RecycleBinPage';
import PublicSnippetsPage from './pages/PublicSnippetsPage';
import ShareViewPage from './pages/ShareViewPage';
import AdminPage from './pages/AdminPage';

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-dark-50 dark:bg-dark-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
          <p className="text-sm text-dark-500">Loading CNS IT...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterPage />} />
      <Route path="/share/:token" element={<ShareViewPage />} />
      <Route path="/public" element={<PublicSnippetsPage />} />
      <Route
        path="/*"
        element={
          user ? (
            <Layout />
          ) : (
            <Navigate to="/login" />
          )
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="diagram" element={<DiagramPage />} />
        <Route path="snippets" element={<SnippetsPage />} />
        <Route path="snippets/:id" element={<SnippetViewPage />} />
        <Route path="recycle" element={<RecycleBinPage />} />
        <Route path="tools" element={<ToolsPage />} />
        <Route path="tools/:toolId" element={<ToolViewPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="admin" element={<AdminPage />} />
      </Route>
    </Routes>
  );
}

export default App;

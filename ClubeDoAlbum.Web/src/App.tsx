import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { VapourBackground } from './components/VapourBackground';
import { AddAlbumModal } from './components/AddAlbumModal';
import { CreateEdicaoModal } from './components/CreateEdicaoModal';

// Pages
import { HomePage } from './pages/HomePage';
import { AlbumDetailPage } from './pages/AlbumDetailPage';
import { CatalogPage } from './pages/CatalogPage';
import { EdicoesPage } from './pages/EdicoesPage';
import { RankingPage } from './pages/RankingPage';
import { CuratorsPage } from './pages/CuratorsPage';
import { MyReviewsPage } from './pages/MyReviewsPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

function App() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [createEdicaoModalOpen, setCreateEdicaoModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#06070a] text-zinc-100 selection:bg-rose-900 selection:text-white relative">
          {/* Ambient Canvas Vapour Background */}
          <VapourBackground />

          {/* Top Navbar */}
          <Navbar onOpenAddModal={() => setAddModalOpen(true)} />

          {/* Main Container */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
            <Routes>
              <Route
                path="/"
                element={
                  <HomePage
                    key={refreshTrigger}
                    onOpenAddModal={() => setAddModalOpen(true)}
                    onOpenCreateEdicaoModal={() => setCreateEdicaoModalOpen(true)}
                  />
                }
              />
              <Route path="/album/:id" element={<AlbumDetailPage />} />
              <Route
                path="/edicoes"
                element={
                  <EdicoesPage
                    key={refreshTrigger}
                    onOpenCreateModal={() => setCreateEdicaoModalOpen(true)}
                  />
                }
              />
              <Route
                path="/arquivo"
                element={
                  <EdicoesPage
                    key={refreshTrigger}
                    onOpenCreateModal={() => setCreateEdicaoModalOpen(true)}
                  />
                }
              />
              <Route path="/catalogo" element={<CatalogPage key={refreshTrigger} />} />
              <Route path="/ranking" element={<RankingPage key={refreshTrigger} />} />
              <Route path="/curadores" element={<CuratorsPage key={refreshTrigger} />} />
              <Route path="/minhas-avaliacoes" element={<MyReviewsPage />} />
              <Route path="/perfil" element={<ProfilePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/registro" element={<RegisterPage />} />
            </Routes>
          </main>

          {/* Modal to add albums */}
          <AddAlbumModal
            isOpen={addModalOpen}
            onClose={() => setAddModalOpen(false)}
            onSuccess={handleRefresh}
            onOpenCreateEdicao={() => setCreateEdicaoModalOpen(true)}
          />

          {/* Modal to create weekly thematic editions */}
          <CreateEdicaoModal
            isOpen={createEdicaoModalOpen}
            onClose={() => setCreateEdicaoModalOpen(false)}
            onSuccess={handleRefresh}
          />

          {/* Footer */}
          <footer className="border-t border-white/[0.06] bg-[#050608]/80 backdrop-blur-xl py-10 text-center text-xs text-zinc-500 font-mono mt-20">
            <div className="max-w-7xl mx-auto px-4 space-y-3">
              <div className="flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <p className="text-zinc-300 font-bold tracking-widest uppercase">
                  CLUBE DO ÁLBUM
                </p>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              </div>
              <p className="text-zinc-500 max-w-md mx-auto text-[11px]">
                Reuniões semanais, audições completas e debates sinceros sobre o mundo do Heavy Metal & Rock.
              </p>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

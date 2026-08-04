import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import BookingPage from './pages/BookingPage';
import ContactPage from './pages/ContactPage';
import AdminPage from './pages/AdminPage';
import MyAppointmentsPage from './pages/MyAppointmentsPage';
import NotFoundPage from './pages/NotFoundPage';
import ProductsPage from './pages/ProductsPage';
import {
  fetchSchedules,
  fetchServices,
  fetchProducts,
  fetchUsersByRole,
  fetchCurrentUser,
  saveSchedule,
  createService,
  updateService,
  deleteService,
} from './services/api';

const SESSION_KEY = 'syra.session';

function normalizeSession(user) {
  if (!user?.email) return null;

  return {
    id: user.id ?? null,
    nome: user.nome || user.name || user.email.split('@')[0],
    email: user.email,
    telefone: user.telefone || '',
    fotoPerfilUrl: user.fotoPerfilUrl || user.picture || '',
    role: user.role || user.papel || '',
  };
}

function loadStoredSession() {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function readSessionFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const email = params.get('email');

  if (!email) return null;

  const token = params.get('token');
  if (token) {
    window.localStorage.setItem('syra.token', token);
  }

  return {
    email,
    nome: params.get('nome') || params.get('name') || '',
    fotoPerfilUrl: params.get('foto') || params.get('picture') || '',
    role: params.get('role') || '',
  };
}

function clearSessionParamsFromUrl() {
  const url = new URL(window.location.href);
  ['email', 'nome', 'name', 'foto', 'picture', 'role', 'token'].forEach((key) => url.searchParams.delete(key));
  window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
}

function AccessNotice({ session, onGoogleLogin }) {
  return (
      <section className="page-section">
        <div className="site-shell card not-found-card auth-required-card">
          <span className="eyebrow eyebrow-dark">Acesso restrito</span>
          <h1>{session ? 'Seu perfil não tem acesso ao painel admin.' : 'Faça login para continuar.'}</h1>
          <p>
            {session
                ? 'Somente os e-mails cadastrados como ADMIN no backend podem editar a agenda de trabalho.'
                : 'Entre com sua conta Google para continuar.'}
          </p>
          <div className="hero-actions">
            {!session ? (
                <button type="button" className="button button-primary" onClick={onGoogleLogin}>
                  Entrar com Google
                </button>
            ) : null}
          </div>
        </div>
      </section>
  );
}

export default function App() {
  const [services, setServices] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [warmingUp, setWarmingUp] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [session, setSession] = useState(() => loadStoredSession());
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');

  const retryTimerRef = useRef(null);
  const loadInitialRef = useRef(null);

  function isWakeupError(err) {
    if (!err) return false;
    const status = err?.response?.status;
    if (!status) return true;
    return [502, 503, 504].includes(status);
  }

  const scheduleRetry = useCallback((nextDelayMs) => {
    if (retryTimerRef.current) return;
    retryTimerRef.current = window.setTimeout(() => {
      retryTimerRef.current = null;
      loadInitialRef.current?.();
    }, nextDelayMs);
  }, []);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setError('');
    let stopLoading = true;

    try {
      const [servicesData, schedulesData, adminsData, productsData] = await Promise.all([
        fetchServices(),
        fetchSchedules(),
        fetchUsersByRole('ADMIN').catch(() => []),
        fetchProducts().catch(() => [])
      ]);

      setServices(servicesData);
      setSchedules(schedulesData);
      setAdmins(Array.isArray(adminsData) ? adminsData : []);
      setProducts(productsData || []);
      setWarmingUp(false);
      setRetryCount(0);
    } catch (err) {
      if (isWakeupError(err)) {
        setWarmingUp(true);
        setError('');
        stopLoading = false;
        setRetryCount((count) => {
          const next = Math.min(count + 1, 8);
          const delay = Math.min(30000, 2000 * next);
          scheduleRetry(delay);
          return next;
        });
        return;
      }

      const apiMessage = err?.response?.data?.message;
      setWarmingUp(false);
      setError(apiMessage || 'Não foi possível carregar os dados do sistema.');
    } finally {
      if (stopLoading) {
        setLoading(false);
      }
    }
  }, [scheduleRetry]);

  useEffect(() => {
    loadInitialRef.current = loadInitialData;
  }, [loadInitialData]);

  useEffect(() => () => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (session) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(SESSION_KEY);
    }
  }, [session]);

  useEffect(() => {
    const sessionFromUrl = readSessionFromUrl();
    if (!sessionFromUrl) return;

    syncSession(sessionFromUrl);
    clearSessionParamsFromUrl();
  }, []);

  const isAdmin = useMemo(() => {
    if (!session?.email) return false;

    const adminEmails = new Set(
        admins
            .map((admin) => String(admin?.email || '').trim().toLowerCase())
            .filter(Boolean),
    );

    return session.role?.toUpperCase() === 'ADMIN' || adminEmails.has(session.email.toLowerCase());
  }, [admins, session]);

  async function syncSession(profile) {
    setAuthBusy(true);
    setAuthError('');

    try {
      // O usuario ja foi criado/atualizado pelo OAuth2LoginSuccessHandler no backend.
      // Aqui so buscamos o registro do proprio usuario, autenticado pelo token.
      const user = await fetchCurrentUser();

      setSession(normalizeSession({ ...profile, ...user }));
    } catch (err) {
      const apiMessage = err?.response?.data?.message;
      setAuthError(apiMessage || 'Não foi possível sincronizar o usuário com o backend.');
    } finally {
      setAuthBusy(false);
    }
  }

  function handleGoogleLogin() {
    window.location.assign('https://syra-vw69.onrender.com/oauth2/authorization/google');
  }

  function handleLogout() {
    setSession(null);
    setAuthError('');
    window.localStorage.removeItem('syra.token');
  }

  function handleSessionUpdate(patch) {
    setSession((current) => (current ? { ...current, ...patch } : current));
  }

  async function handleSaveSchedule(schedule) {
    const saved = await saveSchedule(schedule);
    await loadInitialData();
    return saved;
  }

  async function handleCreateService(payload) {
    const saved = await createService(payload);
    await loadInitialData();
    return saved;
  }

  async function handleUpdateService(id, payload) {
    const saved = await updateService(id, payload);
    await loadInitialData();
    return saved;
  }

  async function handleDeleteService(id) {
    await deleteService(id);
    await loadInitialData();
  }

  return (
      <div className="app-shell">
        <Header
            session={session}
            isAdmin={isAdmin}
            authBusy={authBusy}
            onGoogleLogin={handleGoogleLogin}
            onLogout={handleLogout}
        />

        {warmingUp ? (
          <div className="warmup-banner">
            <div className="warmup-card">
              <div>
                <strong>Estamos acordando o servidor...</strong>
                <span>Isso pode levar alguns segundos. Obrigada por aguardar.</span>
              </div>
              <div className="warmup-dots" aria-hidden="true">
                <span className="warmup-dot" />
                <span className="warmup-dot" />
                <span className="warmup-dot" />
              </div>
            </div>
          </div>
        ) : null}

        {error ? (
            <div className="site-shell global-alert" role="alert">
              {error}
            </div>
        ) : null}

        {authError ? (
            <div className="site-shell global-alert" role="alert">
              {authError}
            </div>
        ) : null}

        <Routes>
          <Route
              path="/"
              element={
                <HomePage
                    services={services}
                    schedules={schedules}
                    loading={loading}
                    session={session}
                    onGoogleLogin={handleGoogleLogin}
                />
              }
          />
          <Route path="/servicos" element={<ServicesPage services={services} loading={loading} />} />

          <Route path="/produtos" element={<ProductsPage products={products} loading={loading} />} />

          <Route
              path="/agendar"
              element={
                <BookingPage
                    services={services}
                    schedules={schedules}
                    session={session}
                    onGoogleLogin={handleGoogleLogin}
                    onSessionUpdate={handleSessionUpdate}
                />
              }
          />
          <Route
              path="/contato"
              element={<ContactPage schedules={schedules} loading={loading} session={session} />}
          />
          <Route
              path="/meus-agendamentos"
              element={
                <MyAppointmentsPage
                    session={session}
                    onGoogleLogin={handleGoogleLogin}
                />
              }
          />
          <Route
              path="/admin"
              element={
                isAdmin ? (
                    <AdminPage
                        session={session}
                        schedules={schedules}
                        services={services}
                        onSaveSchedule={handleSaveSchedule}
                        onCreateService={handleCreateService}
                        onUpdateService={handleUpdateService}
                        onDeleteService={handleDeleteService}
                        loading={loading}
                    />
                ) : (
                    <AccessNotice
                        session={session}
                        onGoogleLogin={handleGoogleLogin}
                    />
                )
              }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        <Footer isAdmin={isAdmin} />
      </div>
  );
}
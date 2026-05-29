import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAppointmentsByClient, cancelAppointment } from '../services/api';

function formatMoney(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDateTime(iso) {
  if (!iso) return '—';
  const [date, time] = String(iso).split('T');
  const [y, m, d] = date.split('-');
  return `${d}/${m}/${y} às ${(time || '').slice(0, 5)}`;
}

function statusLabel(status) {
  const map = {
    PENDENTE: 'Pendente',
    CONFIRMADO: 'Confirmado',
    CANCELADO: 'Cancelado',
  };
  return map[String(status).toUpperCase()] || status || '—';
}

function statusClass(status) {
  const s = String(status).toUpperCase();
  if (s === 'CONFIRMADO') return 'status-confirmed';
  if (s === 'CANCELADO') return 'status-cancelled';
  return 'status-pending';
}

export default function MyAppointmentsPage({ session, onGoogleLogin }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    if (!session?.id) return;

    let cancelled = false;
    setLoading(true);

    fetchAppointmentsByClient(session.id)
      .then((data) => { if (!cancelled) setAppointments(data); })
      .catch(() => { if (!cancelled) setAppointments([]); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [session?.id]);

  async function handleCancel(appt) {
    if (!window.confirm(`Deseja cancelar o agendamento de "${appt.servico?.nome}"?`)) return;
    setCancellingId(appt.id);
    setFeedback({ type: '', message: '' });

    try {
      await cancelAppointment(appt.id);
      // recarregar
      const data = await fetchAppointmentsByClient(session.id);
      setAppointments(data);
      setFeedback({ type: 'success', message: 'Agendamento cancelado com sucesso.' });
    } catch (error) {
      const msg = error?.response?.data?.message;
      setFeedback({ type: 'error', message: msg || 'Não foi possível cancelar o agendamento.' });
    } finally {
      setCancellingId(null);
    }
  }

  if (!session) {
    return (
      <section className="page-section">
        <div className="site-shell page-hero">
          <span className="eyebrow eyebrow-dark">Meus agendamentos</span>
          <h1>Entre para ver seus agendamentos.</h1>
          <p>Faça login com Google para acompanhar seus horários reservados.</p>
        </div>
        <div className="site-shell">
          <div className="card cta-banner">
            <div>
              <h2>Acesse sua conta</h2>
              <p>Seus agendamentos ficam vinculados ao seu e-mail Google.</p>
            </div>
            <div className="hero-actions">
              <button type="button" className="button button-primary" onClick={onGoogleLogin}>
                Entrar com Google
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const active = appointments.filter((a) => String(a.status).toUpperCase() !== 'CANCELADO');
  const cancelled = appointments.filter((a) => String(a.status).toUpperCase() === 'CANCELADO');

  return (
    <section className="page-section">
      <div className="site-shell page-hero">
        <span className="eyebrow eyebrow-dark">Meus agendamentos</span>
        <h1>Acompanhe seus horários reservados.</h1>
        <p>
          Aqui você visualiza todos os seus agendamentos, o status de cada um
          e pode cancelar se precisar.
        </p>
      </div>

      <div className="site-shell">
        {feedback.message ? (
          <div className={`feedback feedback-${feedback.type}`}>{feedback.message}</div>
        ) : null}

        {loading ? (
          <div className="status-card">Carregando seus agendamentos...</div>
        ) : active.length === 0 && cancelled.length === 0 ? (
          <div className="status-card">
            Você ainda não tem agendamentos.{' '}
            <Link className="text-link" to="/agendar">Agendar agora</Link>
          </div>
        ) : (
          <>
            {active.length > 0 ? (
              <>
                <div className="appt-section-head">
                  <h2>Ativos ({active.length})</h2>
                </div>
                <div className="card-grid two-columns appt-grid">
                  {active.map((appt) => (
                    <article key={appt.id} className="card appt-card">
                      <div className="appt-card-top">
                        <span className={`appt-status ${statusClass(appt.status)}`}>
                          {statusLabel(appt.status)}
                        </span>
                        <span className="card-badge">{appt.servico?.nome || 'Serviço'}</span>
                      </div>

                      <div className="appt-card-details">
                        <div><strong>Data</strong><span>{formatDateTime(appt.dataHoraInicio)}</span></div>
                        <div><strong>Término</strong><span>{formatDateTime(appt.dataHoraFim)}</span></div>
                        <div><strong>Duração</strong><span>{appt.servico?.duracaoMinutos || '—'} min</span></div>
                        <div><strong>Valor</strong><span>{formatMoney(appt.servico?.preco)}</span></div>
                      </div>

                      {appt.observacoes ? (
                        <p className="appt-obs">Obs: {appt.observacoes}</p>
                      ) : null}

                      {String(appt.status).toUpperCase() !== 'CANCELADO' ? (
                        <button
                          type="button"
                          className="button button-danger button-sm"
                          onClick={() => handleCancel(appt)}
                          disabled={cancellingId === appt.id}
                        >
                          {cancellingId === appt.id ? 'Cancelando...' : 'Cancelar agendamento'}
                        </button>
                      ) : null}
                    </article>
                  ))}
                </div>
              </>
            ) : null}

            {cancelled.length > 0 ? (
              <>
                <div className="appt-section-head appt-section-head-muted">
                  <h2>Cancelados ({cancelled.length})</h2>
                </div>
                <div className="card-grid two-columns appt-grid">
                  {cancelled.map((appt) => (
                    <article key={appt.id} className="card appt-card appt-card-cancelled">
                      <div className="appt-card-top">
                        <span className={`appt-status ${statusClass(appt.status)}`}>
                          {statusLabel(appt.status)}
                        </span>
                        <span className="card-badge">{appt.servico?.nome || 'Serviço'}</span>
                      </div>

                      <div className="appt-card-details">
                        <div><strong>Data</strong><span>{formatDateTime(appt.dataHoraInicio)}</span></div>
                        <div><strong>Valor</strong><span>{formatMoney(appt.servico?.preco)}</span></div>
                      </div>

                      {appt.observacoes ? (
                        <p className="appt-obs">Obs: {appt.observacoes}</p>
                      ) : null}
                    </article>
                  ))}
                </div>
              </>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}


import { useEffect, useMemo, useState } from 'react';
import {
  createAppointment,
  fetchAppointmentsByPeriod,
  updateUserPhone,
} from '../services/api';
import {
  buildAvailableSlots,
  DAY_LABELS,
  formatDay,
  formatTime,
  getDayKeyFromDate,
  toDateInputValue,
} from '../utils/scheduling';

function formatMoney(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function normalizePhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, digits.length - 4)}-${digits.slice(-4)}`;
}

function formatDateLabel(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dayKey = getDayKeyFromDate(dateStr);
  const dayName = (DAY_LABELS[dayKey] || '').split('-')[0];
  return `${dayName}, ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`;
}

function getNextDates(count = 14) {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(toDateInputValue(d));
  }
  return dates;
}

export default function BookingPage({
  services,
  schedules,
  session,
  onGoogleLogin,
  onSessionUpdate,
}) {
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [telefone, setTelefone] = useState(session?.telefone || '');
  const [appointmentsByDate, setAppointmentsByDate] = useState({});
  const [loadingDates, setLoadingDates] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    setTelefone((t) => t || session?.telefone || '');
  }, [session?.telefone]);

  const selectedService = useMemo(
    () => services.find((s) => String(s.id) === selectedServiceId),
    [selectedServiceId, services],
  );

  const nextDates = useMemo(() => getNextDates(14), []);

  const workingDates = useMemo(() => {
    if (!selectedService) return [];
    return nextDates.filter((dateStr) => {
      const dayKey = getDayKeyFromDate(dateStr);
      const sched = schedules.find((s) => s?.diaDaSemana === dayKey);
      return sched?.trabalhaNesseDia;
    });
  }, [nextDates, schedules, selectedService]);

  useEffect(() => {
    if (!selectedService || workingDates.length === 0) {
      setAppointmentsByDate({});
      setSelectedDate('');
      setSelectedSlot('');
      return;
    }

    let cancelled = false;
    setLoadingDates(true);
    setSelectedDate('');
    setSelectedSlot('');

    async function loadAll() {
      const result = {};
      await Promise.all(
        workingDates.map(async (dateStr) => {
          try {
            const data = await fetchAppointmentsByPeriod(
              `${dateStr}T00:00:00`,
              `${dateStr}T23:59:59`,
            );
            result[dateStr] = data;
          } catch {
            result[dateStr] = [];
          }
        }),
      );
      if (!cancelled) {
        setAppointmentsByDate(result);
        setLoadingDates(false);
      }
    }

    loadAll();
    return () => { cancelled = true; };
  }, [selectedService, workingDates]);

  const slotsByDate = useMemo(() => {
    if (!selectedService) return {};
    const result = {};
    workingDates.forEach((dateStr) => {
      const dayKey = getDayKeyFromDate(dateStr);
      const sched = schedules.find((s) => s?.diaDaSemana === dayKey);
      result[dateStr] = buildAvailableSlots({
        date: dateStr,
        schedule: sched,
        serviceDuration: selectedService.duracaoMinutos,
        appointments: appointmentsByDate[dateStr] || [],
      });
    });
    return result;
  }, [selectedService, workingDates, schedules, appointmentsByDate]);

  const availableDates = useMemo(
    () => workingDates.filter((d) => (slotsByDate[d] || []).length > 0),
    [workingDates, slotsByDate],
  );

  const slotsForSelectedDate = useMemo(
    () => (selectedDate ? slotsByDate[selectedDate] || [] : []),
    [selectedDate, slotsByDate],
  );

  function handleSelectService(id) {
    setSelectedServiceId(id);
    setFeedback({ type: '', message: '' });
  }

  function handleSelectDate(dateStr) {
    setSelectedDate(dateStr);
    setSelectedSlot('');
    setFeedback({ type: '', message: '' });
  }

  function handleSelectSlot(slotValue) {
    setSelectedSlot(slotValue);
    setFeedback({ type: '', message: '' });
  }

  async function handleConfirm() {
    if (!session?.id) {
      setFeedback({ type: 'error', message: 'Faça login para continuar.' });
      return;
    }
    if (!telefone.trim()) {
      setFeedback({ type: 'error', message: 'Informe seu telefone para continuar.' });
      return;
    }

    setSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      if (telefone.trim() !== (session.telefone || '').trim()) {
        const updated = await updateUserPhone(session.id, telefone.trim());
        onSessionUpdate({ telefone: updated?.telefone || telefone.trim() });
      }

      await createAppointment({
        usuarioId: session.id,
        servicoId: Number(selectedServiceId),
        dataHoraInicio: selectedSlot,
      });

      try {
        const refreshed = await fetchAppointmentsByPeriod(
          `${selectedDate}T00:00:00`,
          `${selectedDate}T23:59:59`,
        );
        setAppointmentsByDate((prev) => ({ ...prev, [selectedDate]: refreshed }));
      } catch { /* ok */ }

      setSelectedSlot('');
      setFeedback({
        type: 'success',
        message: 'Agendamento confirmado com sucesso! Seu horário já está reservado.',
      });
    } catch (error) {
      const msg = error?.response?.data?.message;
      setFeedback({ type: 'error', message: msg || 'Não foi possível concluir o agendamento.' });
    } finally {
      setSubmitting(false);
    }
  }

  /* ══════ SEM LOGIN ══════ */
  if (!session) {
    return (
      <section className="page-section">
        <div className="site-shell page-hero">
          <span className="eyebrow eyebrow-dark">Agenda</span>
          <h1>Entre para visualizar os horários disponíveis.</h1>
          <p>
            Faça login com Google para ver os dias e horários livres de cada serviço
            e agendar com apenas alguns cliques.
          </p>
        </div>
        <div className="site-shell">
          <div className="card cta-banner">
            <div>
              <h2>Pronta para agendar?</h2>
              <p>Basta entrar com sua conta Google e escolher o serviço desejado.</p>
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

  /* ══════ COM LOGIN ══════ */
  return (
    <section className="page-section">
      <div className="site-shell page-hero">
        <span className="eyebrow eyebrow-dark">Agendar</span>
        <h1>Escolha o serviço e veja os horários livres.</h1>
        <p>
          Selecione o procedimento desejado. O sistema mostra automaticamente os próximos
          dias disponíveis e os horários vagos para você escolher com um clique.
        </p>
      </div>

      <div className="site-shell booking-flow">

        {/* ═══ ETAPA 1 — Serviço ═══ */}
        <div className="booking-step">
          <div className="booking-step-head">
            <span className="booking-step-number">1</span>
            <h2>Escolha o serviço</h2>
          </div>

          {services.length > 0 ? (
            <div className="card-grid three-columns">
              {services.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`card service-pick ${String(s.id) === selectedServiceId ? 'service-pick-active' : ''}`}
                  onClick={() => handleSelectService(String(s.id))}
                >
                  <h3>{s.nome}</h3>
                  {s.descricao ? <p>{s.descricao}</p> : null}
                  <div className="service-meta">
                    <strong>{formatMoney(s.preco)}</strong>
                    <span>{s.duracaoMinutos} min</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="status-card">Nenhum serviço disponível no momento.</div>
          )}
        </div>

        {/* ═══ ETAPA 2 — Dia ═══ */}
        {selectedService ? (
          <div className="booking-step">
            <div className="booking-step-head">
              <span className="booking-step-number">2</span>
              <h2>Escolha o dia</h2>
              {loadingDates ? <span className="status-pill">Carregando disponibilidade...</span> : null}
            </div>

            {selectedService ? (
              <div className="booking-step-service-info">
                <strong>{selectedService.nome}</strong>
                <span>{selectedService.duracaoMinutos} min · {formatMoney(selectedService.preco)}</span>
              </div>
            ) : null}

            {!loadingDates && availableDates.length === 0 ? (
              <div className="status-card">
                Não há dias com horários disponíveis para este serviço nos próximos 14 dias.
              </div>
            ) : !loadingDates ? (
              <div className="date-picker-grid">
                {availableDates.map((dateStr) => {
                  const slotsCount = (slotsByDate[dateStr] || []).length;
                  return (
                    <button
                      key={dateStr}
                      type="button"
                      className={`date-chip ${dateStr === selectedDate ? 'date-chip-active' : ''}`}
                      onClick={() => handleSelectDate(dateStr)}
                    >
                      <span className="date-chip-label">{formatDateLabel(dateStr)}</span>
                      <span className="date-chip-count">
                        {slotsCount} {slotsCount === 1 ? 'horário livre' : 'horários livres'}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        ) : null}

        {/* ═══ ETAPA 3 — Horário ═══ */}
        {selectedDate && slotsForSelectedDate.length > 0 ? (
          <div className="booking-step">
            <div className="booking-step-head">
              <span className="booking-step-number">3</span>
              <h2>Escolha o horário</h2>
            </div>

            <p className="booking-step-subtitle">
              {formatDateLabel(selectedDate)} · {selectedService?.nome} ({selectedService?.duracaoMinutos} min)
            </p>

            <div className="slot-grid">
              {slotsForSelectedDate.map((slot) => (
                <button
                  key={slot.value}
                  type="button"
                  className={selectedSlot === slot.value ? 'slot-chip slot-chip-active' : 'slot-chip'}
                  onClick={() => handleSelectSlot(slot.value)}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {/* ═══ ETAPA 4 — Confirmação ═══ */}
        {selectedSlot ? (
          <div className="booking-step">
            <div className="booking-step-head">
              <span className="booking-step-number">4</span>
              <h2>Confirme seu agendamento</h2>
            </div>

            <div className="card booking-confirm-card">
              <div className="booking-confirm-grid">
                <div className="booking-confirm-summary">
                  <dl>
                    <div><dt>Cliente</dt><dd>{session.nome}</dd></div>
                    <div><dt>Serviço</dt><dd>{selectedService?.nome}</dd></div>
                    <div><dt>Valor</dt><dd>{formatMoney(selectedService?.preco)}</dd></div>
                    <div><dt>Duração</dt><dd>{selectedService?.duracaoMinutos} min</dd></div>
                    <div><dt>Data</dt><dd>{formatDateLabel(selectedDate)}</dd></div>
                    <div><dt>Horário</dt><dd>{selectedSlot.slice(11, 16)}</dd></div>
                  </dl>
                </div>

                <div className="booking-confirm-phone">
                  <label>
                    <span>Seu telefone (WhatsApp)</span>
                    <input
                      value={telefone}
                      onChange={(e) => setTelefone(normalizePhone(e.target.value))}
                      placeholder="(83) 99831-7419"
                    />
                  </label>

                  <button
                    type="button"
                    className="button button-primary button-full"
                    onClick={handleConfirm}
                    disabled={submitting || !telefone.trim()}
                  >
                    {submitting ? 'Confirmando...' : 'Confirmar agendamento'}
                  </button>
                </div>
              </div>

              {feedback.message ? (
                <div className={`feedback feedback-${feedback.type}`}>{feedback.message}</div>
              ) : null}
            </div>
          </div>
        ) : null}

        {!selectedSlot && feedback.message ? (
          <div className={`feedback feedback-${feedback.type}`}>{feedback.message}</div>
        ) : null}
      </div>
    </section>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { DAY_ORDER, buildWeeklyScheduleDraft, formatDay } from '../utils/scheduling';
import { fetchAllAppointments, confirmAppointment, cancelAppointment } from '../services/api';

const emptyServiceForm = { nome: '', descricao: '', preco: '', duracaoMinutos: '' };

function formatMoney(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatDateTime(iso) {
  if (!iso) return '—';
  const [date, time] = String(iso).split('T');
  const [y, m, d] = date.split('-');
  return `${d}/${m}/${y} às ${(time || '').slice(0, 5)}`;
}

function statusLabel(status) {
  const map = { PENDENTE: 'Pendente', CONFIRMADO: 'Confirmado', CANCELADO: 'Cancelado' };
  return map[String(status).toUpperCase()] || status || '—';
}

function statusClass(status) {
  const s = String(status).toUpperCase();
  if (s === 'CONFIRMADO') return 'status-confirmed';
  if (s === 'CANCELADO') return 'status-cancelled';
  return 'status-pending';
}

function buildWhatsAppUrl(appt) {
  const clientName = appt.usuario?.nome || 'Cliente';
  const serviceName = appt.servico?.nome || 'Atendimento';
  const dateTime = formatDateTime(appt.dataHoraInicio);
  const phone = (appt.usuario?.telefone || '').replace(/\D/g, '');
  const fullPhone = phone.startsWith('55') ? phone : `55${phone}`;
  const msg = encodeURIComponent(
    `Olá ${clientName}, seu ${serviceName} está confirmado para ${dateTime}. Syra Estética 💜`
  );
  return `https://wa.me/${fullPhone}?text=${msg}`;
}

export default function AdminPage({
  session,
  schedules,
  services,
  onSaveSchedule,
  onCreateService,
  onUpdateService,
  onDeleteService,
  loading,
}) {
  /* ── horários ── */
  const [drafts, setDrafts] = useState(() => buildWeeklyScheduleDraft(schedules));
  const [savingDay, setSavingDay] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  /* ── serviços ── */
  const [serviceForm, setServiceForm] = useState(emptyServiceForm);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [savingService, setSavingService] = useState(false);
  const [deletingServiceId, setDeletingServiceId] = useState(null);
  const [serviceFeedback, setServiceFeedback] = useState({ type: '', message: '' });

  /* ── tab ── */
  const [activeTab, setActiveTab] = useState('horarios');

  /* ── agendamentos (admin) ── */
  const [allAppointments, setAllAppointments] = useState([]);
  const [loadingAppts, setLoadingAppts] = useState(false);
  const [apptActionId, setApptActionId] = useState(null);
  const [apptFeedback, setApptFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    setDrafts(buildWeeklyScheduleDraft(schedules));
  }, [schedules]);

  /* carregar agendamentos ao entrar na tab */
  useEffect(() => {
    if (activeTab !== 'agendamentos') return;
    let cancelled = false;
    setLoadingAppts(true);
    fetchAllAppointments()
      .then((data) => { if (!cancelled) setAllAppointments(data); })
      .catch(() => { if (!cancelled) setAllAppointments([]); })
      .finally(() => { if (!cancelled) setLoadingAppts(false); });
    return () => { cancelled = true; };
  }, [activeTab]);

  const workingDays = useMemo(
    () => schedules.filter((s) => s?.trabalhaNesseDia).length,
    [schedules],
  );

  /* ─── handlers horários ─── */
  function handleChange(day, field, value) {
    setDrafts((curr) => ({
      ...curr,
      [day]: { ...curr[day], [field]: value },
    }));
  }

  async function handleSave(day) {
    setSavingDay(day);
    setFeedback({ type: '', message: '' });
    try {
      const draft = drafts[day];
      await onSaveSchedule({
        ...draft,
        trabalhaNesseDia: Boolean(draft.trabalhaNesseDia),
        horaInicioAlmoco: draft.horaInicioAlmoco || null,
        horaFimAlmoco: draft.horaFimAlmoco || null,
      });
      setFeedback({ type: 'success', message: `${formatDay(day)} atualizado com sucesso.` });
    } catch (error) {
      const msg = error?.response?.data?.message;
      setFeedback({ type: 'error', message: msg || `Não foi possível salvar ${formatDay(day).toLowerCase()}.` });
    } finally {
      setSavingDay('');
    }
  }

  /* ─── handlers serviços ─── */
  function handleServiceFormChange(e) {
    const { name, value } = e.target;
    setServiceForm((curr) => ({ ...curr, [name]: value }));
  }

  function startEditService(service) {
    setEditingServiceId(service.id);
    setServiceForm({
      nome: service.nome || '',
      descricao: service.descricao || '',
      preco: String(service.preco ?? ''),
      duracaoMinutos: String(service.duracaoMinutos ?? ''),
    });
    setServiceFeedback({ type: '', message: '' });
  }

  function cancelEditService() {
    setEditingServiceId(null);
    setServiceForm(emptyServiceForm);
  }

  async function handleServiceSubmit(e) {
    e.preventDefault();
    setSavingService(true);
    setServiceFeedback({ type: '', message: '' });

    const payload = {
      nome: serviceForm.nome.trim(),
      descricao: serviceForm.descricao.trim(),
      preco: parseFloat(serviceForm.preco),
      duracaoMinutos: parseInt(serviceForm.duracaoMinutos, 10),
    };

    try {
      if (editingServiceId) {
        await onUpdateService(editingServiceId, payload);
        setServiceFeedback({ type: 'success', message: `"${payload.nome}" atualizado com sucesso.` });
      } else {
        await onCreateService(payload);
        setServiceFeedback({ type: 'success', message: `"${payload.nome}" criado com sucesso.` });
      }
      setServiceForm(emptyServiceForm);
      setEditingServiceId(null);
    } catch (error) {
      const msg = error?.response?.data?.message;
      setServiceFeedback({ type: 'error', message: msg || 'Não foi possível salvar o serviço.' });
    } finally {
      setSavingService(false);
    }
  }

  async function handleDeleteService(service) {
    if (!window.confirm(`Deseja realmente excluir "${service.nome}"?`)) return;
    setDeletingServiceId(service.id);
    setServiceFeedback({ type: '', message: '' });
    try {
      await onDeleteService(service.id);
      setServiceFeedback({ type: 'success', message: `"${service.nome}" excluído com sucesso.` });
    } catch (error) {
      const msg = error?.response?.data?.message;
      setServiceFeedback({ type: 'error', message: msg || 'Não foi possível excluir o serviço.' });
    } finally {
      setDeletingServiceId(null);
    }
  }

  /* ─── handlers agendamentos ─── */
  async function reloadAppointments() {
    try {
      const data = await fetchAllAppointments();
      setAllAppointments(data);
    } catch { /* ok */ }
  }

  async function handleConfirmAppt(appt) {
    setApptActionId(appt.id);
    setApptFeedback({ type: '', message: '' });
    try {
      await confirmAppointment(appt.id);
      await reloadAppointments();
      setApptFeedback({ type: 'success', message: `Agendamento de ${appt.usuario?.nome} confirmado.` });
    } catch (error) {
      const msg = error?.response?.data?.message;
      setApptFeedback({ type: 'error', message: msg || 'Erro ao confirmar.' });
    } finally {
      setApptActionId(null);
    }
  }

  async function handleCancelAppt(appt) {
    if (!window.confirm(`Cancelar agendamento de "${appt.usuario?.nome}"?`)) return;
    setApptActionId(appt.id);
    setApptFeedback({ type: '', message: '' });
    try {
      await cancelAppointment(appt.id);
      await reloadAppointments();
      setApptFeedback({ type: 'success', message: `Agendamento de ${appt.usuario?.nome} cancelado.` });
    } catch (error) {
      const msg = error?.response?.data?.message;
      setApptFeedback({ type: 'error', message: msg || 'Erro ao cancelar.' });
    } finally {
      setApptActionId(null);
    }
  }

  return (
    <section className="page-section admin-page">
      {/* ── Hero ── */}
      <div className="site-shell page-hero">
        <span className="eyebrow eyebrow-dark">Painel administrativo</span>
        <h1>Gerencie horários e serviços do seu espaço.</h1>
        <p>
          Bem-vinda, {session?.nome || 'administradora'}. Configure os dias de atendimento,
          cadastre serviços e deixe a agenda inteligente cuidar do resto.
        </p>
      </div>

      {/* ── Métricas ── */}
      <div className="site-shell card-grid three-columns admin-metrics">
        <article className="card admin-metric-card">
          <span className="card-badge">Dias ativos</span>
          <strong>{workingDays}</strong>
          <p>Dias da semana com atendimento liberado.</p>
        </article>
        <article className="card admin-metric-card">
          <span className="card-badge">Serviços</span>
          <strong>{services.length}</strong>
          <p>Procedimentos cadastrados no sistema.</p>
        </article>
        <article className="card admin-metric-card">
          <span className="card-badge">Intervalo de agenda</span>
          <strong>15 min</strong>
          <p>Intervalo entre sugestões de horário para o cliente.</p>
        </article>
      </div>

      {/* ── Tabs ── */}
      <div className="site-shell">
        <div className="admin-tabs">
          <button
            type="button"
            className={`admin-tab ${activeTab === 'horarios' ? 'admin-tab-active' : ''}`}
            onClick={() => setActiveTab('horarios')}
          >
            Horários de Atendimento
          </button>
          <button
            type="button"
            className={`admin-tab ${activeTab === 'servicos' ? 'admin-tab-active' : ''}`}
            onClick={() => setActiveTab('servicos')}
          >
            Gerenciar Serviços
          </button>
          <button
            type="button"
            className={`admin-tab ${activeTab === 'agendamentos' ? 'admin-tab-active' : ''}`}
            onClick={() => setActiveTab('agendamentos')}
          >
            Agendamentos
          </button>
        </div>
      </div>

      {/* ══════════════════ TAB: HORÁRIOS ══════════════════ */}
      {activeTab === 'horarios' && (
        <div className="site-shell">
          <div className="section-head admin-section-head">
            <div>
              <span className="eyebrow eyebrow-dark">Horários semanais</span>
              <h2>Configure cada dia</h2>
            </div>
            {loading ? <span className="status-pill">Atualizando dados...</span> : null}
          </div>

          {feedback.message ? (
            <div className={`feedback feedback-${feedback.type}`}>{feedback.message}</div>
          ) : null}

          <div className="card-grid two-columns admin-schedule-grid">
            {DAY_ORDER.map((day) => {
              const draft = drafts[day];
              const disabled = savingDay === day;

              return (
                <article key={day} className="card admin-day-card">
                  <div className="admin-day-head">
                    <div>
                      <span className="card-badge">{formatDay(day)}</span>
                      <h3>{draft.trabalhaNesseDia ? 'Atendimento ativo' : 'Dia fechado'}</h3>
                    </div>
                    <label className="switch-field">
                      <input
                        type="checkbox"
                        checked={Boolean(draft.trabalhaNesseDia)}
                        onChange={(e) => handleChange(day, 'trabalhaNesseDia', e.target.checked)}
                      />
                      <span>{draft.trabalhaNesseDia ? 'Aberto' : 'Fechado'}</span>
                    </label>
                  </div>

                  <div className="form-grid admin-form-grid">
                    <label>
                      <span>Abertura</span>
                      <input
                        type="time"
                        value={draft.horaAbertura}
                        onChange={(e) => handleChange(day, 'horaAbertura', e.target.value)}
                        disabled={!draft.trabalhaNesseDia}
                      />
                    </label>
                    <label>
                      <span>Fechamento</span>
                      <input
                        type="time"
                        value={draft.horaFechamento}
                        onChange={(e) => handleChange(day, 'horaFechamento', e.target.value)}
                        disabled={!draft.trabalhaNesseDia}
                      />
                    </label>
                    <label>
                      <span>Início do almoço</span>
                      <input
                        type="time"
                        value={draft.horaInicioAlmoco}
                        onChange={(e) => handleChange(day, 'horaInicioAlmoco', e.target.value)}
                        disabled={!draft.trabalhaNesseDia}
                      />
                    </label>
                    <label>
                      <span>Fim do almoço</span>
                      <input
                        type="time"
                        value={draft.horaFimAlmoco}
                        onChange={(e) => handleChange(day, 'horaFimAlmoco', e.target.value)}
                        disabled={!draft.trabalhaNesseDia}
                      />
                    </label>
                  </div>

                  <button
                    type="button"
                    className="button button-primary"
                    onClick={() => handleSave(day)}
                    disabled={disabled}
                  >
                    {disabled ? 'Salvando...' : 'Salvar dia'}
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════ TAB: SERVIÇOS ══════════════════ */}
      {activeTab === 'servicos' && (
        <div className="site-shell">
          <div className="section-head admin-section-head">
            <div>
              <span className="eyebrow eyebrow-dark">Catálogo</span>
              <h2>{editingServiceId ? 'Editar serviço' : 'Cadastrar novo serviço'}</h2>
            </div>
            {loading ? <span className="status-pill">Atualizando dados...</span> : null}
          </div>

          {serviceFeedback.message ? (
            <div className={`feedback feedback-${serviceFeedback.type}`}>
              {serviceFeedback.message}
            </div>
          ) : null}

          {/* Formulário de criação / edição */}
          <form className="card admin-service-form" onSubmit={handleServiceSubmit}>
            <div className="form-grid">
              <label>
                <span>Nome do serviço</span>
                <input
                  name="nome"
                  value={serviceForm.nome}
                  onChange={handleServiceFormChange}
                  placeholder="Ex: Limpeza de pele"
                  required
                />
              </label>

              <label>
                <span>Descrição</span>
                <input
                  name="descricao"
                  value={serviceForm.descricao}
                  onChange={handleServiceFormChange}
                  placeholder="Breve descrição do procedimento"
                />
              </label>

              <label>
                <span>Valor (R$)</span>
                <input
                  name="preco"
                  type="number"
                  step="0.01"
                  min="0"
                  value={serviceForm.preco}
                  onChange={handleServiceFormChange}
                  placeholder="120.00"
                  required
                />
              </label>

              <label>
                <span>Duração (minutos)</span>
                <input
                  name="duracaoMinutos"
                  type="number"
                  min="1"
                  value={serviceForm.duracaoMinutos}
                  onChange={handleServiceFormChange}
                  placeholder="60"
                  required
                />
              </label>
            </div>

            <div className="admin-service-actions">
              <button
                type="submit"
                className="button button-primary"
                disabled={savingService}
              >
                {savingService
                  ? 'Salvando...'
                  : editingServiceId
                    ? 'Atualizar serviço'
                    : 'Criar serviço'}
              </button>
              {editingServiceId ? (
                <button
                  type="button"
                  className="button ghost-button"
                  onClick={cancelEditService}
                >
                  Cancelar edição
                </button>
              ) : null}
            </div>
          </form>

          {/* Lista de serviços existentes */}
          <div className="admin-service-list-head">
            <h3>Serviços cadastrados ({services.length})</h3>
          </div>

          {services.length > 0 ? (
            <div className="card-grid two-columns admin-service-grid">
              {services.map((service) => (
                <article key={service.id} className="card admin-service-card">
                  <div className="admin-service-card-info">
                    <span className="card-badge">Serviço</span>
                    <h3>{service.nome}</h3>
                    {service.descricao ? <p>{service.descricao}</p> : null}
                    <div className="service-meta">
                      <strong>{formatMoney(service.preco)}</strong>
                      <span>{service.duracaoMinutos} min</span>
                    </div>
                  </div>
                  <div className="admin-service-card-actions">
                    <button
                      type="button"
                      className="button button-primary button-sm"
                      onClick={() => startEditService(service)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="button button-danger button-sm"
                      onClick={() => handleDeleteService(service)}
                      disabled={deletingServiceId === service.id}
                    >
                      {deletingServiceId === service.id ? 'Excluindo...' : 'Excluir'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="status-card">Nenhum serviço cadastrado ainda.</div>
          )}
        </div>
      )}

      {/* ══════════════════ TAB: AGENDAMENTOS ══════════════════ */}
      {activeTab === 'agendamentos' && (
        <div className="site-shell">
          <div className="section-head admin-section-head">
            <div>
              <span className="eyebrow eyebrow-dark">Agenda</span>
              <h2>Todos os agendamentos</h2>
            </div>
            {loadingAppts ? <span className="status-pill">Carregando...</span> : null}
          </div>

          {apptFeedback.message ? (
            <div className={`feedback feedback-${apptFeedback.type}`}>{apptFeedback.message}</div>
          ) : null}

          {!loadingAppts && allAppointments.length === 0 ? (
            <div className="status-card">Nenhum agendamento encontrado.</div>
          ) : !loadingAppts ? (
            <div className="card-grid two-columns appt-grid">
              {allAppointments.map((appt) => {
                const isCancelled = String(appt.status).toUpperCase() === 'CANCELADO';
                const isPending = String(appt.status).toUpperCase() === 'PENDENTE';
                const hasPhone = Boolean(appt.usuario?.telefone);

                return (
                  <article
                    key={appt.id}
                    className={`card appt-card ${isCancelled ? 'appt-card-cancelled' : ''}`}
                  >
                    <div className="appt-card-top">
                      <span className={`appt-status ${statusClass(appt.status)}`}>
                        {statusLabel(appt.status)}
                      </span>
                      <span className="card-badge">{appt.servico?.nome || 'Serviço'}</span>
                    </div>

                    <div className="appt-card-details">
                      <div><strong>Cliente</strong><span>{appt.usuario?.nome || '—'}</span></div>
                      <div><strong>Telefone</strong><span>{appt.usuario?.telefone || 'Não informado'}</span></div>
                      <div><strong>Data</strong><span>{formatDateTime(appt.dataHoraInicio)}</span></div>
                      <div><strong>Término</strong><span>{formatDateTime(appt.dataHoraFim)}</span></div>
                      <div><strong>Valor</strong><span>{formatMoney(appt.servico?.preco)}</span></div>
                    </div>

                    {appt.observacoes ? (
                      <p className="appt-obs">Obs: {appt.observacoes}</p>
                    ) : null}

                    <div className="appt-card-actions">
                      {hasPhone && !isCancelled ? (
                        <a
                          href={buildWhatsAppUrl(appt)}
                          target="_blank"
                          rel="noreferrer"
                          className="button button-whatsapp button-sm"
                        >
                          WhatsApp
                        </a>
                      ) : null}

                      {isPending ? (
                        <button
                          type="button"
                          className="button button-primary button-sm"
                          onClick={() => handleConfirmAppt(appt)}
                          disabled={apptActionId === appt.id}
                        >
                          {apptActionId === appt.id ? '...' : 'Confirmar'}
                        </button>
                      ) : null}

                      {!isCancelled ? (
                        <button
                          type="button"
                          className="button button-danger button-sm"
                          onClick={() => handleCancelAppt(appt)}
                          disabled={apptActionId === appt.id}
                        >
                          {apptActionId === appt.id ? '...' : 'Cancelar'}
                        </button>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}


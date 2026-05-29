import ScheduleCard from '../components/ScheduleCard';

export default function ContactPage({ schedules, loading, session }) {
  return (
    <section className="page-section">
      <div className="site-shell page-hero">
        <span className="eyebrow eyebrow-dark">Contato</span>
        <h1>Fale com a Syra e acompanhe os dias em que a agenda está aberta para atendimento.</h1>
        <p>
          Use os canais abaixo para tirar dúvidas, acompanhar novidades e confirmar detalhes
          do seu cuidado com mais tranquilidade.
        </p>
      </div>

      <div className="site-shell contact-layout">
        <div className="card contact-card">
          <h2>Informações</h2>
          <div className="contact-items">
            <a href="https://wa.me/5583998317419" target="_blank" rel="noreferrer">
              WhatsApp: 83 99831-7419
            </a>
            <a href="mailto:valdilenehyuuga1@gmail.com">
              E-mail: valdilenehyuuga1@gmail.com
            </a>
            <a href="https://instagram.com/valdilene_hyuuga" target="_blank" rel="noreferrer">
              Instagram: @valdilene_hyuuga
            </a>
            <span>Cidade: Monteiro</span>
            <span>Estado: Paraíba</span>
            {session ? <span>Cliente ativo: {session.nome}</span> : null}
          </div>
        </div>

        <div className="card contact-card">
          <h2>Atendimento com calma e cuidado</h2>
          <p>
            Nosso espaço foi pensado para acolher cada cliente com leveza, atenção e uma
            experiência de renovação. Se tiver dúvidas sobre procedimentos, duração ou
            disponibilidade, pode chamar.
          </p>
          <p>
            Quando a agenda semanal está configurada no painel admin, os horários livres já
            aparecem automaticamente para as clientes no momento do agendamento.
          </p>
        </div>
      </div>

      <div className="site-shell contact-schedules contact-schedules-section">
        <div className="section-head">
          <div>
            <span className="eyebrow eyebrow-dark">Agenda semanal</span>
            <h2>Horários de atendimento</h2>
          </div>
        </div>

        {loading ? (
          <div className="status-card">Carregando horários...</div>
        ) : schedules.length > 0 ? (
          <div className="card-grid two-columns">
            {schedules.map((schedule) => (
              <ScheduleCard key={schedule.id || schedule.diaDaSemana} schedule={schedule} />
            ))}
          </div>
        ) : (
          <div className="status-card">Horários ainda não cadastrados.</div>
        )}
      </div>
    </section>
  );
}

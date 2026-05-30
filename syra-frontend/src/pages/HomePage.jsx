import { Link } from 'react-router-dom';
import ServiceCard from '../components/ServiceCard';
import ScheduleCard from '../components/ScheduleCard';

export default function HomePage({
  services,
  schedules,
  loading,
  session,
  onGoogleLogin,
  onOpenAuth,
}) {
  const featuredServices = services.slice(0, 3);
  const visibleSchedules = schedules.slice(0, 4);
  const workingDays = schedules.filter((schedule) => schedule?.trabalhaNesseDia).length;

  return (
    <>
      <section className="hero-section">
        <img className="hero-image" src="/hero-syra.jpg" alt="Espaço Syra Estética" />
        <div className="hero-overlay" />

        <div className="site-shell hero-content hero-content-wide">
          <span className="eyebrow">Syra Comésticos e Estética · Monteiro</span>
          <h1>Beleza, acolhimento e uma agenda inteligente pensada para o seu tempo.</h1>
          <p>
            Na Syra, cada atendimento nasce do cuidado. Você faz login, escolhe o serviço
            e vê somente os horários que realmente estão disponíveis para a duração do seu
            procedimento.
          </p>

          <div className="hero-actions">
            <Link className="button button-primary" to="/agendar">
              Agendar consulta
            </Link>
            <Link className="button button-secondary" to="/servicos">
              Explorar serviços
            </Link>
            <Link className="button button-secondary" to="/produtos">
              Explorar produtos
            </Link>
            {!session ? (
              <button type="button" className="button button-secondary" onClick={onGoogleLogin}>
                Entrar com Google
              </button>
            ) : null}
          </div>

          <div className="hero-stats">
            <div className="hero-stat-card">
              <strong>{services.length || '0'}</strong>
              <span>serviços disponíveis</span>
            </div>
            <div className="hero-stat-card">
              <strong>{workingDays || '0'}</strong>
              <span>dias ativos na semana</span>
            </div>
            <div className="hero-stat-card">
              <strong>{session ? 'Online' : 'Google'}</strong>
              <span>{session ? 'sessão pronta para agendar' : 'acesso principal do cliente'}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="site-shell split-section home-intro-grid">
          <div>
            <span className="eyebrow eyebrow-dark">Sobre a Syra</span>
            <h2>Um refúgio onde o autocuidado desacelera o tempo e devolve sua confiança.</h2>
          </div>

          <div className="copy-block">
            <p>
              Na Syra, acreditamos que a verdadeira beleza floresce no cuidado. Nosso espaço
              foi criado para ser o seu refúgio particular, onde o tempo desacelera e o foco
              é você.
            </p>
            <p>
              Dedicamo-nos a realçar a sua essência com tratamentos personalizados,
              oferecendo uma experiência completa de relaxamento e renovação.
            </p>
            <p>
              Mais do que serviços de beleza, entregamos momentos de bem-estar. Venha
              sentir-se acolhida e saia renovada, confiante e radiante. Sua jornada de
              autocuidado começa aqui.
            </p>
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="site-shell">
          <div className="section-head">
            <div>
              <span className="eyebrow eyebrow-dark">Como funciona</span>
              <h2>Simples, rápido e sem conflitos</h2>
            </div>
          </div>

          <div className="card-grid three-columns">
            <article className="card flow-card">
              <span className="card-badge">01</span>
              <h3>Escolha o serviço</h3>
              <p>
                Navegue pelo catálogo, veja valores e duração de cada procedimento
                para encontrar o cuidado ideal para você.
              </p>
            </article>
            <article className="card flow-card">
              <span className="card-badge">02</span>
              <h3>Veja os horários livres</h3>
              <p>
                Em caso de consultas o sistema cruza a duração do serviço com os horários de trabalho e
                agendamentos existentes, mostrando apenas encaixes válidos.
              </p>
            </article>
            <article className="card flow-card">
              <span className="card-badge">03</span>
              <h3>Confirme em segundos</h3>
              <p>
                Selecione o melhor horário e reserve. Seu agendamento fica salvo
                automaticamente e o horário é bloqueado para outras clientes.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="site-shell">
          <div className="section-head">
            <div>
              <span className="eyebrow eyebrow-dark">Destaques</span>
              <h2>Serviços em evidência</h2>
            </div>
            <Link className="text-link" to="/servicos">
              Ver catálogo completo
            </Link>
          </div>

          {loading ? (
            <div className="status-card">Carregando serviços...</div>
          ) : featuredServices.length > 0 ? (
            <div className="card-grid three-columns">
              {featuredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <div className="status-card">Nenhum serviço cadastrado no momento.</div>
          )}
        </div>
      </section>

      <section className="section section-soft">
        <div className="site-shell">
          <div className="section-head">
            <div>
              <span className="eyebrow eyebrow-dark">Atendimento</span>
              <h2>Horários da semana</h2>
            </div>
            <Link className="text-link" to="/contato">
              Ver contato completo
            </Link>
          </div>

          {loading ? (
            <div className="status-card">Carregando horários...</div>
          ) : visibleSchedules.length > 0 ? (
            <div className="card-grid four-columns">
              {visibleSchedules.map((schedule) => (
                <ScheduleCard key={schedule.id || schedule.diaDaSemana} schedule={schedule} />
              ))}
            </div>
          ) : (
            <div className="status-card">Os horários ainda não foram cadastrados.</div>
          )}
        </div>
      </section>

      {!session ? (
        <section className="section">
          <div className="site-shell card cta-banner">
            <div>
              <span className="eyebrow eyebrow-dark">Pronta para começar?</span>
              <h2>Entre, escolha seu serviço e veja os horários livres em segundos.</h2>
            </div>
            <div className="hero-actions">
              <button type="button" className="button button-primary" onClick={onGoogleLogin}>
                Entrar com Google
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}


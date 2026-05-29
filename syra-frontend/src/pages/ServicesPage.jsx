import { Link } from 'react-router-dom';
import ServiceCard from '../components/ServiceCard';

export default function ServicesPage({ services, loading }) {
  return (
    <section className="page-section">
      <div className="site-shell page-hero">
        <span className="eyebrow eyebrow-dark">Serviços</span>
        <h1>Procedimentos pensados para realçar a sua essência com conforto e resultado.</h1>
        <p>
          Escolha o atendimento ideal para você, compare valores, veja a duração de cada
          serviço e siga para a agenda inteligente quando estiver pronta.
        </p>
      </div>

      <div className="site-shell">
        {loading ? (
          <div className="status-card">Carregando serviços...</div>
        ) : services.length > 0 ? (
          <div className="card-grid three-columns">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <div className="status-card">Nenhum serviço encontrado.</div>
        )}
      </div>

      <div className="site-shell section">
        <div className="card cta-banner">
          <div>
            <span className="eyebrow eyebrow-dark">Próximo passo</span>
            <h2>Escolheu o procedimento? Agora veja os horários livres.</h2>
          </div>
          <div className="hero-actions">
            <Link className="button button-primary" to="/agendar">
              Ir para agenda
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="page-section">
      <div className="site-shell not-found-card card">
        <span className="eyebrow eyebrow-dark">Página não encontrada</span>
        <h1>Essa rota não existe no front-end da Syra.</h1>
        <p>
          Volte para a página inicial e continue navegando pelo site.
        </p>
        <Link className="button button-primary" to="/">
          Ir para o início
        </Link>
      </div>
    </section>
  );
}


import { Link } from 'react-router-dom';

export default function Footer({ isAdmin }) {
  return (
    <footer className="site-footer">
      <div className="site-shell footer-grid">
        <div>
          <h3>Syra Estética</h3>
          <p>
            Cuidado, leveza e atendimento personalizado em um espaço pensado para
            beleza, autoestima e bem-estar.
          </p>
        </div>

        <div>
          <h4>Navegação</h4>
          <div className="footer-links">
            <Link to="/">Início</Link>
            <Link to="/servicos">Serviços</Link>
            <Link to="/agendar">Agenda</Link>
            <Link to="/contato">Contato</Link>
            {isAdmin ? <Link to="/admin">Painel admin</Link> : null}
          </div>
        </div>

        <div>
          <h4>Contato</h4>
          <div className="footer-links">
            <a href="https://wa.me/5583999578716" target="_blank" rel="noreferrer">
              WhatsApp: 83 99831-7419
            </a>
            <a href="mailto:walquiriasousabarbosa@gmail.com">
              walquiriasousabarbosa@gmail.com
            </a>
            <a href="https://instagram.com/wal_cosmeticos2021" target="_blank" rel="noreferrer">
              Instagram: @wal_cosmeticos2021
            </a>
            <span>Monteiro · Paraíba</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

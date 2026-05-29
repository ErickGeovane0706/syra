function formatMoney(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export default function ServiceCard({ service }) {
  return (
    <article className="card service-card">
      <div className="card-badge">Serviço</div>
      <h3>{service.nome}</h3>
      <p>
        {service.descricao ||
          'Atendimento com foco em conforto, resultado e uma experiência leve do começo ao fim.'}
      </p>
      <div className="service-meta">
        <strong>{formatMoney(service.preco)}</strong>
        <span>{service.duracaoMinutos} min</span>
      </div>
    </article>
  );
}


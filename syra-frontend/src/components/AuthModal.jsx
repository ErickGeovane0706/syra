import { useEffect, useState } from 'react';

const initialForm = {
  nome: '',
  email: '',
  fotoPerfilUrl: '',
};

export default function AuthModal({ open, submitting, error, onClose, onSubmit }) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (!open) return;
    setForm(initialForm);
  }, [open]);

  if (!open) return null;

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await onSubmit({
      nome: form.nome.trim(),
      email: form.email.trim(),
      fotoPerfilUrl: form.fotoPerfilUrl.trim(),
    });
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="card auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="auth-modal-head">
          <div>
            <span className="eyebrow eyebrow-dark">Acesso local</span>
            <h2 id="auth-modal-title">Entrar com perfil de desenvolvimento</h2>
          </div>
          <button type="button" className="ghost-button" onClick={onClose}>
            Fechar
          </button>
        </div>

        <p>
          Enquanto o retorno do Google no backend não aponta para o frontend, você pode
          simular o login usando o endpoint de desenvolvimento já disponível.
        </p>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="field-full">
            <span>Nome</span>
            <input
              name="nome"
              value={form.nome}
              onChange={handleChange}
              placeholder="Seu nome"
              required
            />
          </label>

          <label>
            <span>E-mail</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="voce@gmail.com"
              required
            />
          </label>

          <label>
            <span>Foto de perfil (opcional)</span>
            <input
              name="fotoPerfilUrl"
              value={form.fotoPerfilUrl}
              onChange={handleChange}
              placeholder="https://..."
            />
          </label>

          <div className="field-full auth-modal-actions">
            <button className="button button-primary" disabled={submitting}>
              {submitting ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>

        {error ? <div className="feedback feedback-error">{error}</div> : null}
      </div>
    </div>
  );
}


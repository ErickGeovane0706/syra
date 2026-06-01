import { useState } from 'react';

function formatMoney(value) {
    return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function ProductsPage({ products, loading }) {
    const [cart, setCart] = useState([]);

    function addToCart(product) {
        setCart((currentCart) => {
            const existing = currentCart.find((item) => item.id === product.id);
            if (existing) {
                return currentCart.map((item) =>
                    item.id === product.id ? { ...item, quantidade: item.quantidade + 1 } : item
                );
            }
            return [...currentCart, { ...product, quantidade: 1 }];
        });
    }

    function removeFromCart(productId) {
        setCart((currentCart) => currentCart.filter((item) => item.id !== productId));
    }

    const cartTotal = cart.reduce((acc, item) => acc + item.preco * item.quantidade, 0);

    function handleCheckout() {
        if (cart.length === 0) return;

        let text = "Olá! Gostaria de comprar os seguintes produtos da Syra:\n\n";

        cart.forEach((item) => {
            // Usa o asterisco para o WhatsApp deixar o título em negrito
            text += `- *${item.quantidade}x ${item.titulo}* : ${formatMoney(item.preco * item.quantidade)}\n`;
            if (item.imagemUrl) {
                text += `  Ver produto: ${item.imagemUrl}\n`;
            }
        });

        text += `\n*TOTAL DO PEDIDO: ${formatMoney(cartTotal)}*\n\n`;
        text += "Como podemos prosseguir com o pagamento e a entrega?";

        const phone = "5583999578716";
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    }

    return (
        <section className="page-section">
            <div className="site-shell page-hero">
                <span className="eyebrow eyebrow-dark">Cosméticos & Home Care</span>
                <h1>Leve o cuidado da Syra para a sua rotina em casa.</h1>
                <p>Adicione os produtos desejados à sua sacola e finalize a compra diretamente pelo WhatsApp com a nossa equipe.</p>
            </div>

            <div className="site-shell split-section products-layout">
                {/* Catálogo de Produtos */}
                <div>
                    {loading ? (
                        <div className="status-card">Carregando produtos...</div>
                    ) : products.length > 0 ? (
                        <div className="card-grid two-columns">
                            {products.map((product) => (
                                <article key={product.id} className="card service-card product-card">
                                    {product.imagemUrl && (
                                        <img
                                            src={product.imagemUrl}
                                            alt={product.titulo}
                                            className="product-image"
                                        />
                                    )}
                                    <span className="card-badge product-badge">Estoque: {product.estoque}</span>
                                    <h3>{product.titulo}</h3>
                                    <p className="product-description">{product.descricao}</p>
                                    <div className="service-meta product-actions">
                                        <strong style={{ fontSize: '1.3rem' }}>{formatMoney(product.preco)}</strong>
                                        <button
                                            className="button button-primary button-sm"
                                            onClick={() => addToCart(product)}
                                            disabled={product.estoque <= 0}
                                        >
                                            {product.estoque > 0 ? 'Adicionar' : 'Esgotado'}
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="status-card">Nenhum produto disponível no momento.</div>
                    )}
                </div>

                {/* Carrinho de Compras */}
                <div className="products-cart">
                    <div className="card contact-card">
                        <h2>Sua Sacola</h2>
                        {cart.length === 0 ? (
                            <p>Sua sacola está vazia. Adicione produtos para continuar.</p>
                        ) : (
                            <div className="cart-list">
                                {cart.map((item) => (
                                    <div key={item.id} className="cart-item">
                                        <div>
                                            <strong style={{ display: 'block' }}>{item.quantidade}x {item.titulo}</strong>
                                            <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{formatMoney(item.preco)} cada</span>
                                        </div>
                                        <button className="ghost-button cart-remove" onClick={() => removeFromCart(item.id)}>Remover</button>
                                    </div>
                                ))}
                                <div className="cart-total">
                                    <strong>Total:</strong>
                                    <strong>{formatMoney(cartTotal)}</strong>
                                </div>
                                <button className="button button-primary button-full" onClick={handleCheckout}>
                                    Comprar pelo WhatsApp
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
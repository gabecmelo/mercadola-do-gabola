# Mercadola do Gabola

Uma aplicação web simples de mercado virtual, construída com HTML, CSS e JavaScript puro, que simula funcionalidades de login, catálogo de produtos (usando Fake Store API), carrinho de compras e checkout.

## Demonstração Online
A aplicação está hospedada no GitHub Pages:
[Mercadola do Gabola](https://gabecmelo.github.io/mercadola-do-gabola)

## Funcionalidades

* **Login Simples**: formulário que solicita nome, e-mail e senha (simulado, sem backend real). Após login, exibe saudação “Olá, \[nome]” e acesso ao catálogo.
* **Catálogo de Produtos**: busca produtos da Fake Store API e exibe em grid responsivo.
* **Carrinho Persistente**: adiciona/remover itens, controla quantidade, badge atualizado, persistência em `localStorage` para sobreviver a reload de página.

* **Animações Visuais**:
  * Ao clicar em "Adicionar ao Carrinho", o botão "pula" e o ícone de carrinho "treme" para feedback visual.
  * Hover em botões e ícone do carrinho.
* **Modal do Carrinho**: exibe lista de itens, permite aumentar/diminuir quantidade, remover itens, esvaziar carrinho e iniciar checkout.
* **Checkout Simulado**:

  * Formulário de nome completo, endereço e método de pagamento (Cartão de Crédito, Pix ou Boleto).
  * Campos de Cartão de Crédito formatados em tempo real (máscara para número, validade e CVV) e validados (16 dígitos + Luhn, validade MM/AA não expirada, CVV 3 dígitos).
  * Opções de pagamento por Pix ou Boleto, com um pequeno "Easter Egg" nessas opções.
  * Exibe confirmação estruturada em elementos HTML com resumo do pedido e esvazia o carrinho.
* **Logout**: limpa estado e carrinho, retorna à tela de login.

## Tecnologias
* HTML5
* CSS3 (Grid Layout, Flexbox, media queries e animações simples via `@keyframes`)
* JavaScript puro (ES6+)
* Fake Store API para obter produtos de exemplo
* `localStorage` para persistência de login (simulação) e carrinho

## Estrutura de Arquivos
* `index.html`: estrutura principal, inclui seções de login, catálogo e modais de carrinho/checkout.
* `styles.css`: estilos gerais, responsividade, grid de produtos, modais e animações.
* `script.js`: lógica de login, fetch de produtos, manipulação de carrinho, máscaras e validações de campos de cartão, checkout e persistência.

## Como Usar Localmente
1. Clone ou baixe o repositório.
2. Abra o arquivo `index.html` normalmente, ou use extensão Live Server no VSCode.
3. Acesse a URL local gerada.
4. Na tela de login, informe Nome, E-mail e Senha (qualquer valor, pois é simulado).
5. Após entrar, navegue pelo catálogo, adicione itens ao carrinho e finalize o checkout conforme simulação.

## Licença

Este projeto está licenciado sob a **MIT License © 2025**. Veja o arquivo [LICENSE](LICENSE) para detalhes completos.
<div align="center">
  <img src="../frontend/files/svg/fixly.svg" alt="Logo Fixly" width="220"/>

  <h3>Gestão Inteligente e Ágil de Ordens de Serviço</h3>

  <p>
    Conectando clientes, técnicos e administradores em um fluxo contínuo, transparente e em tempo real.
  </p>

  <!-- Badges na paleta oficial do projeto (#F5C542 e #1A1A1D) -->
  <p>
    <img src="https://img.shields.io/badge/Status-Em%20Desenvolvimento-F5C542?style=for-the-badge&labelColor=1A1A1D" alt="Status"/>
    <img src="https://img.shields.io/badge/Node.js-Express-F5C542?style=for-the-badge&logo=node.js&logoColor=F5C542&labelColor=1A1A1D" alt="Node.js"/>
    <img src="https://img.shields.io/badge/Database-SQLite-F5C542?style=for-the-badge&logo=sqlite&logoColor=F5C542&labelColor=1A1A1D" alt="SQLite"/>
    <img src="https://img.shields.io/badge/UI-Dark%20Mode-F5C542?style=for-the-badge&labelColor=1A1A1D" alt="Dark UI"/>
  </p>

  <p>
    <a href="#-sobre-o-projeto">Sobre</a> •
    <a href="#-demonstração-em-vídeo">Vídeo</a> •
    <a href="#-problema-vs-solução">Problema & Solução</a> •
    <a href="#-nosso-diferencial">Diferencial</a> •
    <a href="#-telas-do-sistema">Telas</a> •
    <a href="#-tecnologias">Tecnologias</a>
  </p>
</div>

---

## 💡 Sobre o Projeto

O **Fixly** é uma plataforma web completa desenvolvida para modernizar o gerenciamento de assistências técnicas e prestadores de serviços. O sistema centraliza todo o ciclo de vida de uma **Ordem de Serviço (OS)** — desde a abertura do chamado pelo cliente, passando pela triagem e atribuição de técnicos pelo administrador, até o acompanhamento e execução pelo profissional responsável.

Projetado com uma interface **Dark Mode de alto contraste** (`#1A1A1D` e `#F5C542`), o sistema reduz a fadiga visual em ambientes de trabalho intensos e destaca instantaneamente o status de cada atendimento.

---

## 🎬 Demonstração em Vídeo

> **Dica para publicar no GitHub:** Abra o `README.md` pelo editor web do próprio GitHub e **arraste seu arquivo `.mp4` ou `.gif`** para substituir o link abaixo. O GitHub gera automaticamente um player de vídeo nativo!

<div align="center">
  <!-- Substitua o link abaixo pelo vídeo arrastado no GitHub ou link do YouTube -->
  <a href="https://seu-link-do-video-aqui.com" target="_blank">
    <img src="https://img.shields.io/badge/▶%20ASSISTIR%20DEMONSTRAÇÃO%20COMPLETA-F5C542?style=for-the-badge&labelColor=1A1A1D" alt="Assistir Vídeo" height="45"/>
  </a>
  <br/><br/>
  <em>Fluxo completo: Abertura de OS pelo Cliente ➔ Atribuição pelo Administrador ➔ Execução no Painel do Técnico.</em>
</div>

---

## 🎯 Problema vs. Solução

Assistências técnicas e empresas de manutenção frequentemente perdem produtividade e clientes por falhas na comunicação interna. Veja como o **Fixly** resolve cada gargalo:

| ❌ O Problema (Cenário Tradicional) | ✅ A Solução (Com o Fixly) |
| :--- | :--- |
| **Ordens perdidas em papel ou planilhas:** Dificuldade para localizar históricos de equipamentos e defeitos relatados. | **Centralização em Banco Relacional:** Todas as OS ficam registradas com número único, equipamento, marca, acessórios e descrição detalhada. |
| **Falta de clareza sobre quem está atendendo:** Chamados ficam parados sem responsável definido ou com status desatualizado. | **Atribuição em 1 Clique:** Ao vincular um técnico pelo modal administrativo, a OS muda automaticamente para **Em Andamento** e surge no painel do profissional. |
| **Clientes sem retorno:** Ligações constantes para perguntar se o aparelho já ficou pronto. | **Transparência por Perfil:** Cada cliente acompanha em tempo real o andamento e os valores das suas próprias ordens. |
| **Interfaces poluídas e confusas:** Sistemas antigos que exigem horas de treinamento para tarefas simples. | **Design Intuitivo e Hierárquico:** Filtros rápidos por status (*Todas, Abertas, Andamento, Fechadas, Congeladas*) e busca instantânea. |

---

## 🚀 Nosso Diferencial

O que torna o **Fixly** único frente aos sistemas comuns de chamados:

1. **Ecossistema Multi-Perfil Unificado (RBAC):** Uma única aplicação adapta toda a experiência e segurança de rotas de acordo com o nível de acesso do usuário (**Cliente**, **Profissional/Técnico** ou **Administrador**).
2. **Automação de Fluxo Operacional:** Eliminamos etapas manuais repetitivas. No momento em que o administrador atribui um técnico ou vendedor a uma ordem, o sistema sincroniza o responsável e altera o status da tarefa para **Em Andamento** simultaneamente na visão da gestão e na fila de trabalho do técnico.
3. **Gestão Integrada de Equipe e Clientes:** Cadastro unificado que separa credenciais de autenticação (`login`) de dados cadastrais (`usuarios`) e competências técnicas/especialidades (`tecnicos`).
4. **Identidade Visual Funcional:** O uso estratégico do **Amarelo Ouro (`#F5C542`)** sobre o **Grafite (`#1A1A1D`)** guia o olhar do operador diretamente para as ações principais, alertas e indicadores de status.

---

## 📸 Telas do Sistema

> **Como adicionar suas fotos:** Crie uma pasta `docs/prints` no projeto, salve os prints lá e substitua os caminhos abaixo.

<table>
  <tr>
    <td align="center" width="50%">
      <strong>Painel de Ordens (Administrador)</strong><br/><br/>
      <img src="./docs/prints/ordens-adm.png" alt="Painel de Ordens Admin" width="100%"/>
      <br/><sub>Visão geral com filtros por status, pesquisa e cartões interativos.</sub>
    </td>
    <td align="center" width="50%">
      <strong>Modal de Atribuição de Técnico</strong><br/><br/>
      <img src="./docs/prints/modal-atribuir.png" alt="Modal de Atribuição" width="100%"/>
      <br/><sub>Detalhes completos do equipamento e vinculação imediata de profissional.</sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <strong>Área Restrita do Profissional</strong><br/><br/>
      <img src="./docs/prints/ordens-profissional.png" alt="Painel do Técnico" width="100%"/>
      <br/><sub>Fila personalizada exibindo apenas as tarefas atribuídas ao técnico logado.</sub>
    </td>
    <td align="center" width="50%">
      <strong>Gestão de Usuários e Cadastros</strong><br/><br/>
      <img src="./docs/prints/usuarios-adm.png" alt="Gestão de Usuários" width="100%"/>
      <br/><sub>Controle completo de clientes, técnicos, vendedores e administradores.</sub>
    </td>
  </tr>
</table>

---

## ⚙️ Funcionalidades por Nível de Acesso

* 👑 **Administrador (`/home-adm`, `/ordens-adm`, `/usuarios-adm`)**
  * Visualização e filtragem de todas as ordens de serviço da empresa.
  * Atribuição rápida de técnicos às ordens pendentes com mudança automática para *Em Andamento*.
  * Cadastro e listagem completa de Clientes, Profissionais (com cargo e especialidades) e Administradores.
* 🛠️ **Profissional / Técnico (`/home-p`, `/ordens-p`)**
  * Acesso exclusivo às ordens de serviço vinculadas ao seu perfil.
  * Visualização de dados do cliente, endereço, telefone, periféricos entregues e descrição técnica do problema.
* 👤 **Cliente (`/home-c`, `/os-c`, `/ordens-c`)**
  * Abertura simplificada de novas solicitações de serviço.
  * Acompanhamento transparente do status e orçamento das ordens abertas.
  * Gestão de perfil e foto de usuário.

---

## 🛠️ Tecnologias Utilizadas

<div align="left">
  <img src="https://img.shields.io/badge/HTML5-1A1A1D?style=for-the-badge&logo=html5&logoColor=F5C542" alt="HTML5"/>
  <img src="https://img.shields.io/badge/CSS3-1A1A1D?style=for-the-badge&logo=css3&logoColor=F5C542" alt="CSS3"/>
  <img src="https://img.shields.io/badge/JavaScript-1A1A1D?style=for-the-badge&logo=javascript&logoColor=F5C542" alt="JavaScript"/>
  <img src="https://img.shields.io/badge/Node.js-1A1A1D?style=for-the-badge&logo=node.js&logoColor=F5C542" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Express.js-1A1A1D?style=for-the-badge&logo=express&logoColor=F5C542" alt="Express"/>
  <img src="https://img.shields.io/badge/SQLite-1A1A1D?style=for-the-badge&logo=sqlite&logoColor=F5C542" alt="SQLite"/>
</div>

---

## 💻 Como Executar o Projeto Localmente

```bash
# 1. Clone este repositório
git clone [https://github.com/seu-usuario/fixly.git](https://github.com/seu-usuario/fixly.git)

# 2. Acesse a pasta do projeto
cd fixly

# 3. Instale as dependências
npm install

# 4. Configure as variáveis de ambiente (.env)
# Crie um arquivo .env na pasta do servidor com:
# PORT=3000
# emailAdm=admin@fixly.com
# senhaAdm=123456

# 5. Inicie o servidor
node backend/server.js


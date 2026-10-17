# Landing page profissional com animações CSS 3D — Evaldo Claro

Site de apresentação e contato de um psicanalista, publicado em produção.

🔗 **Demonstração:** https://evaldoclaro.com.br

![Captura da página inicial](docs/screenshot-home.png)
<!-- TODO: adicionar capturas desktop e celular -->

## Sobre o projeto

Evaldo Claro, psicanalista, precisava de uma presença digital própria para
apresentar sua atuação, os temas de atendimento, sua formação, o
funcionamento das sessões e os valores. O visitante deve conseguir
esclarecer dúvidas, consultar certificados e iniciar uma conversa pelo
WhatsApp.

O projeto é uma **página de apresentação e contato**. Não tem agendamento,
pagamento online, prontuário, login de pacientes nem painel administrativo.

### Como foi desenvolvido

Projeto real, desenvolvido com **assistência de IA (Codex)**. Eu conduzi o
projeto: levantei as necessidades e os materiais com o profissional,
avaliei as versões, orientei as escolhas de texto, foto e interação,
aprovei a versão final e executei a publicação (hospedagem, DNS, HTTPS e
Search Console). A IA foi usada para implementar e alterar
HTML/CSS/JavaScript, preparar assets e PDFs, revisar e automatizar testes
no navegador.

## Funcionalidades

- Cabeçalho com navegação por seções e indicação da seção atual
- Oito seções: apresentação, temas de atendimento, a sessão, atendimento
  online, sobre mim, valores, perguntas frequentes e contato
- Temas e FAQ expansíveis com `<details>`/`<summary>` nativos (uma pergunta
  aberta por vez no FAQ)
- Tabelas de valores separadas para atendimento individual e de casais
- Links para certificados em PDF (abrem em nova aba)
- Botão flutuante de WhatsApp no desktop e barra de contato em telas
  menores
- Barra de progresso de leitura

## Decisões de design e implementação

| Decisão | Motivo |
|---|---|
| HTML, CSS e JavaScript puros, sem framework nem build | Site estático simples: sem dependências, fácil de manter e de hospedar |
| "3D" feito com perspectiva, rotações, planos sobrepostos e sombras em CSS | Dar profundidade e movimento suave sem WebGL/Three.js. **Não é uma cena 3D real** |
| Entrada única das seções (~650 ms) e abertura curta (~2,6 s) | Interesse na navegação sem atrapalhar a leitura |
| Rolagem nativa, sem controle artificial do gesto | Respeitar o visitante |
| Loop de animação para quando estabiliza ou a aba fica oculta; amplitude menor em toque | Evitar trabalho desnecessário no navegador |
| `prefers-reduced-motion` desativa os movimentos | Respeitar a preferência do sistema |
| Imagens WebP com `srcset`/`sizes`; foto principal com prioridade alta e a de "Sobre" com carregamento adiado | Reduzir peso e priorizar o que aparece primeiro |
| Fonte Manrope variável hospedada localmente (licença SIL OFL), `font-display: swap` | Sem dependência externa e sem texto invisível durante o carregamento |
| Retirada de legendas, de um bloco de pausa de movimento e de faixas "A seguir" nas iterações | O design ficou mais limpo; o respeito ao movimento reduzido permanece via sistema |
| Número do CPF removido da cópia pública do certificado | Proteger dados pessoais; o original foi preservado fora do site |

## Stack

- **HTML5** semântico, **CSS3** (Grid, Flexbox, propriedades customizadas,
  perspectiva 3D) e **JavaScript** puro
- APIs do navegador: `requestAnimationFrame`, `IntersectionObserver`,
  `ResizeObserver`, `matchMedia`, Web Animations API
- **Hospedagem:** Netlify (envio manual) · **Domínio/DNS:** Registro.br ·
  **HTTPS:** Let's Encrypt via Netlify · **Indexação:** Google Search Console
- Python, Node.js e Playwright foram usados só como ferramentas auxiliares
  de preparação e revisão; não são dependências da página

## Acessibilidade

Medidas implementadas:

- Link para pular ao conteúdo, foco visível e tratamento de foco após a
  navegação
- Menu compacto em telas menores, fechável com Escape
- Textos alternativos e dimensões declaradas nas imagens
- Tabelas com `caption` e cabeçalhos semânticos
- Conteúdo principal, links e expansões nativas acessíveis sem JavaScript

> Estas são medidas implementadas e verificações pontuais. **Não equivalem
> a uma certificação de conformidade WCAG.**

## Validação

- Revisão em larguras de 320, 375, 768, 1024, 1120 e 1440 px no Edge, com
  movimento reduzido e com JavaScript desativado
- Execução principal com **544 verificações automatizadas de navegador**
  (Playwright), cobrindo menu por teclado, Escape, temas e FAQ, âncoras,
  foco, carregamento de imagens e acesso aos PDFs. Nove resultados exigiram
  investigação: parte dependia de aguardar o fim da rolagem suave e parte
  revelou um problema de foco sem JavaScript, que foi corrigido; as nove
  passaram na repetição. *São verificações de navegador, não testes
  unitários.*
- Sem erros de JavaScript, respostas HTTP de erro ou excedente horizontal
  nas larguras testadas
- Transferência observada localmente de ~154 a 208 kB de recursos da página
  (PDFs sob demanda). *Observação local, não é resultado de Lighthouse nem de
  Core Web Vitals em produção.*

**Limites:** não houve auditoria completa com leitor de tela, Safari,
aparelhos físicos ou Lighthouse.

## Publicação

1. Pacote ZIP com `index.html` na raiz, enviado manualmente ao Netlify
2. Domínio personalizado associado; DNS no Registro.br (registro A do
   domínio principal e CNAME de `www`)
3. HTTPS emitido para o domínio principal e `www`, com `www` redirecionando
   ao domínio principal
4. Propriedade verificada no Search Console por TXT, sitemap enviado e
   indexação da página inicial solicitada

**Status:** publicado com HTTPS. A indexação efetiva e a presença nas buscas
ainda não foram confirmadas.

## Estrutura

```text
index.html
styles.css        # estilos base, responsividade e componentes
script.js         # menu, foco, contato fixo, FAQ, entrada das seções
experience.css    # composição visual 3D
experience.js     # movimento suave e progresso de leitura
robots.txt
sitemap.xml
assets/
  certificados/ fonts/ icons/ otimizadas/ social/
```
<!-- Ajuste se o repositório mantiver a versão em subpasta (ex.: versao-3d/). -->

## Como executar localmente

Não há instalação nem build. Basta um servidor estático:

```bash
python -m http.server 8080
# abra http://localhost:8080
```

(Python é só uma opção de servidor; qualquer extensão de servidor local
serve.)

## Limitações conhecidas

- Sem prévia de compartilhamento testada no WhatsApp, métricas de tráfego
  ou análise de conversão
- Sem medição de desempenho comparativa com um site anterior
- Não há garantia de posicionamento nas buscas, tráfego ou captação de
  clientes

## Créditos e licença

- Conteúdo, textos, valores, fotos e documentos pertencem a Evaldo Claro e
  **não** estão cobertos pela licença do código.
- Fonte Manrope: SIL Open Font License.
- Os certificados do repositório são cópias públicas sem dados pessoais;
  não foram autenticados junto aos emissores.
- Licença do código: <!-- TODO: escolher (ex.: MIT) -->

## Autor

**Breno Henrique Bortoloti Santos** — condução do projeto, requisitos,
revisão e publicação, com assistência de IA (Codex).
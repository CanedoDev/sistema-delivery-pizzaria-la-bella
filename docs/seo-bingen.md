# SEO local e GEO — La Bella Pizza

Data: 27/10/2026. Objetivo confirmado por Enzo: melhorar a descoberta por “pizza bingen”. Fonte: pedido nesta conversa; horários confirmados pelo usuário na mesma conversa.

## Entrega no código

- Home: título “Pizza no Bingen, Petrópolis | La Bella Pizza”, descrição local e H1 estável, independente dos sabores do slider. Texto visível com bairro, cidade, endereço, salão, delivery e cardápio.
- Cardápio: título e introdução locais; lista de 75 itens em HTML disponível sem JavaScript, gerada do catálogo atual e consultável em um painel nativo. Links abrem itens ou suas categorias existentes. Não duplica preços.
- Dados estruturados: identidade Restaurant consistente, endereço com Bingen, cardápio, redes oficiais já presentes no site, WebSite/WebPage e breadcrumbs no cardápio. FAQ JSON-LD corresponde exatamente ao conteúdo visível. Coordenadas antigas não verificadas foram removidas; só reintroduzir com coordenadas reais da localização.
- Horários para pedidos: terça–quinta 18h–22h45; sexta–domingo 18h–23h45; segunda fechado. Confirmados por Enzo, padronizados na FAQ, rodapés, quadro do cardápio, JSON-LD e resumo auxiliar.
- Sitemap: lastmod atualizado somente nas páginas alteradas; resumo llm.txt retirado da lista de URLs principais. Robots: um grupo geral para evitar exclusões internas serem ignoradas por agentes com grupo específico. Apache: diretórios de desenvolvimento e backups recebem bloqueio de acesso.
- llm.txt legado mantido como resumo opcional, sem afirmação de que melhora ranking. Conteúdo útil está no HTML. Não foram inventadas avaliações, cobertura irrestrita de delivery ou coordenadas.

## Validação realizada

- 26/26 testes existentes de pedidos passaram (node --test tests/pedidos.test.cjs), sem envio real de pedido.
- Home e cardápio em navegador local a 1280px e 390px: sem rolagem horizontal nas verificações; título e conteúdo legíveis. Cardápio interativo renderizou 81 cards incluindo ofertas e opções meio a meio. Lista de sabores abriu; link Calabresa abriu o modal correto. Sem erros de console registrados na checagem final do cardápio.
- JSON-LD parseado, seis respostas FAQ comparadas com HTML, sitemap XML parseado, títulos e descrições verificados; lista estática conferida com os 75 itens do catálogo; git diff --check sem problemas.
- Não foi executado o Rich Results Test remoto. Esta prévia usa servidor Python e não executa regras Apache; verificar bloqueios e redirecionamentos na hospedagem após publicar.
- Não foi medida mudança de ranking, tráfego, pedidos ou citações por IA. O site público foi consultado antes da edição; estas alterações ainda não foram publicadas.

## Publicação na hospedagem existente

O pacote de atualização contém apenas os sete arquivos de produção alterados, mantendo os mesmos caminhos:
index.html, cardapio.html, css/local-search.css, .htaccess, robots.txt, sitemap.xml, llm.txt.

Faça backup da versão remota e publique esses arquivos na raiz atual do domínio https://pizzarialabellapetropolis.com.br/. Preserve imagens, demais CSS/JS e configurações da hospedagem. Não enviar work/, .git/, .agents/, docs/, scripts/ ou tests/.

Após o upload, verificar home, /cardapio, /robots.txt, /sitemap.xml e /css/local-search.css?v=1 com HTTP 200; canonicals devem continuar na raiz e /cardapio; /index.html e /cardapio.html devem redirecionar à versão canônica. Verificar que /work/ e /.git/ não expõem arquivos. Testar os dados locais no Rich Results Test.

No Search Console da propriedade existente: inspecionar a home e /cardapio e solicitar indexação após publicação; confirmar envio de /sitemap.xml. Dependem de acesso à conta; não foram executados nesta tarefa.

No Perfil da Empresa no Google: conferir nome real “La Bella Pizza”, categoria adequada, endereço Rua Bingen, 2076, telefone, horários confirmados, site e link do cardápio. Manter consistência dos dados em outros cadastros legítimos. Não inserir palavras-chave no nome comercial. Nenhum perfil externo foi alterado nesta tarefa.

Comparar o período anterior e posterior à publicação no Search Console, usando a mesma janela: consultas pizza bingen, pizza no bingen, pizzaria bingen, delivery pizza bingen e variações; observar impressões, cliques, CTR e posição por página. Para IA, registrar ferramenta, consulta, data e fonte citada; uma resposta isolada não mede presença geral.

## Manutenção

Ao alterar js/pizzaJson.js, executar node scripts/build-menu-seo.cjs e node scripts/build-menu-seo.cjs --check antes de publicar cardapio.html. Horários futuros precisam ser alterados no conteúdo visível, dados estruturados e resumo auxiliar. Backups e verificações desta tarefa ficam em work/seo-bingen/, ignorados no Git e bloqueados no Apache.

## Fontes oficiais

- https://developers.google.com/search/docs/appearance/ai-features
- https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- https://developers.google.com/search/docs/appearance/structured-data/local-business
- https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl
- https://support.google.com/business/answer/7091?hl=pt-BR

As práticas de SEO continuam aplicáveis às respostas de IA; não há arquivo especial ou schema exclusivo que garanta inclusão. A busca local também depende de relevância, distância e destaque, além do site.

# Validação de pedidos — La Bella

Execução: node --test tests/pedidos.test.cjs

Catálogo e funções reais do projeto. DOM e animações simulados. O checkout foi executado com window.open interceptado; nenhuma navegação ou envio ao WhatsApp.

| Cenário | Subtotal | Desconto | Total dos itens |
|---|---:|---:|---:|
| Pizza média | 54.90 | 0.00 | 54.90 |
| 3 pizzas + 2 bebidas | 180.70 | 0.00 | 180.70 |
| Meio a meio salgada x2 | 153.80 | 0.00 | 153.80 |
| Meio a meio doce | 49.90 | 0.00 | 49.90 |
| Meio a meio gourmet | 104.90 | 0.00 | 104.90 |
| Meio a meio Super + brinde | 173.80 | 0.00 | 173.80 |
| Combo 01 | 149.80 | 14.90 | 134.90 |
| Combo 02 x2 | 327.60 | 61.80 | 265.80 |
| Combo + pizza + bebida | 229.70 | 14.90 | 214.80 |
| Combo + meio a meio | 232.70 | 30.90 | 201.80 |
| Quarta quantidade dois | 139.80 | 10.00 | 129.80 |
| Quarta meio a meio + avulsa | 153.80 | 11.00 | 142.80 |
| Terça duas grandes | 139.80 | 9.90 | 129.90 |
| Combo automático com Coca Zero | 151.80 | 18.90 | 132.90 |
| Duas grandes sem bebida | 153.80 | 0.00 | 153.80 |
| Terça meio a meio x2 | 153.80 | 0.00 | 153.80 |
| Checkout real combo + pizza | 204.70 | 14.90 | 189.80 |
| Tradicionais sem bebida | 139.80 | 0.00 | 139.80 |
| Volume incompatível | 147.80 | 0.00 | 147.80 |
| Combo 01 automático | 146.80 | 11.90 | 134.90 |
| Combo + avulsa na quarta | 221.70 | 28.90 | 192.80 |
| Avulsas promocionais mais baratas | 149.80 | 10.00 | 139.80 |
| Dois combos automáticos | 303.60 | 37.80 | 265.80 |

## Pizza média

```text
🍕 *NOVO PEDIDO — LA BELLA PIZZA*

*ITENS DO PEDIDO*

1. *1x Muçarela (M)*
Total do item: *R$ 54,90*

*RESUMO DO PEDIDO*
Subtotal antes dos descontos: R$ 54,90
*Total dos itens: R$ 54,90*
Entrega: taxa a confirmar com o atendente.
Total a pagar: total dos itens + taxa de entrega.

*DADOS PARA ENTREGA*
Nome: Cliente Teste
Telefone: 24999990000
Endereço: Rua de Teste, nº 10 — Centro
Tipo de imóvel: Casa
Complemento: Portão azul
Pagamento: Pix
```

## 3 pizzas + 2 bebidas

```text
🍕 *NOVO PEDIDO — LA BELLA PIZZA*

*ITENS DO PEDIDO*

1. *3x Muçarela (M)*
Preço unitário: R$ 54,90
Total do item: *R$ 164,70*

2. *2x Coca-Cola Zero (600ml)*
Preço unitário: R$ 8,00
Total do item: *R$ 16,00*

*RESUMO DO PEDIDO*
Subtotal antes dos descontos: R$ 180,70
*Total dos itens: R$ 180,70*
Entrega: taxa a confirmar com o atendente.
Total a pagar: total dos itens + taxa de entrega.

*DADOS PARA ENTREGA*
Nome: Cliente Teste
Telefone: 24999990000
Endereço: Rua de Teste, nº 10 — Centro
Tipo de imóvel: Casa
Complemento: Portão azul
Pagamento: Pix
```

## Meio a meio salgada x2

```text
🍕 *NOVO PEDIDO — LA BELLA PIZZA*

*ITENS DO PEDIDO*

1. *2x Pizza Meio a Meio (Grande (35 cm))*
• ½ Muçarela + ½ À Moda do Cheff
Preço unitário: R$ 76,90
Total do item: *R$ 153,80*

*RESUMO DO PEDIDO*
Subtotal antes dos descontos: R$ 153,80
*Total dos itens: R$ 153,80*
Entrega: taxa a confirmar com o atendente.
Total a pagar: total dos itens + taxa de entrega.

*DADOS PARA ENTREGA*
Nome: Cliente Teste
Telefone: 24999990000
Endereço: Rua de Teste, nº 10 — Centro
Tipo de imóvel: Casa
Complemento: Portão azul
Pagamento: Pix
```

## Meio a meio doce

```text
🍕 *NOVO PEDIDO — LA BELLA PIZZA*

*ITENS DO PEDIDO*

1. *1x Pizza Meio a Meio Doce (Média (30 cm))*
• ½ Brigadeiro + ½ Festa
Total do item: *R$ 49,90*

*RESUMO DO PEDIDO*
Subtotal antes dos descontos: R$ 49,90
*Total dos itens: R$ 49,90*
Entrega: taxa a confirmar com o atendente.
Total a pagar: total dos itens + taxa de entrega.

*DADOS PARA ENTREGA*
Nome: Cliente Teste
Telefone: 24999990000
Endereço: Rua de Teste, nº 10 — Centro
Tipo de imóvel: Casa
Complemento: Portão azul
Pagamento: Pix
```

## Meio a meio gourmet

```text
🍕 *NOVO PEDIDO — LA BELLA PIZZA*

*ITENS DO PEDIDO*

1. *1x Pizza Meio a Meio Gourmet (Grande (35 cm))*
• ½ Abobrinha Natural + ½ Margherita de Sevóia
Total do item: *R$ 104,90*

*RESUMO DO PEDIDO*
Subtotal antes dos descontos: R$ 104,90
*Total dos itens: R$ 104,90*
Entrega: taxa a confirmar com o atendente.
Total a pagar: total dos itens + taxa de entrega.

*DADOS PARA ENTREGA*
Nome: Cliente Teste
Telefone: 24999990000
Endereço: Rua de Teste, nº 10 — Centro
Tipo de imóvel: Casa
Complemento: Portão azul
Pagamento: Pix
```

## Meio a meio Super + brinde

```text
🍕 *NOVO PEDIDO — LA BELLA PIZZA*

*ITENS DO PEDIDO*

1. *2x Pizza Meio a Meio (Super (40 cm))*
• ½ Muçarela + ½ Atum
• Brinde: 2x Guaraná Antarctica 2L (Sujeito a estoque)
Preço unitário: R$ 86,90
Total do item: *R$ 173,80*

*RESUMO DO PEDIDO*
Subtotal antes dos descontos: R$ 173,80
*Total dos itens: R$ 173,80*
Entrega: taxa a confirmar com o atendente.
Total a pagar: total dos itens + taxa de entrega.

*DADOS PARA ENTREGA*
Nome: Cliente Teste
Telefone: 24999990000
Endereço: Rua de Teste, nº 10 — Centro
Tipo de imóvel: Casa
Complemento: Portão azul
Pagamento: Pix
```

## Combo 01

```text
🍕 *NOVO PEDIDO — LA BELLA PIZZA*

*ITENS DO PEDIDO*

1. *1x Combo 01 - Super + Média Doce + Refri/Mate 1.5L*
• Pizza: À Moda do Cheff — Super (40cm)
• Pizza: Festa — Média (30cm)
• Bebida inclusa: Refri ou Mate 1.5L (Sob consulta)
Total do item: *R$ 134,90*
Economia: R$ 14,90

*RESUMO DO PEDIDO*
Subtotal antes dos descontos: R$ 149,80
Descontos/economia: -R$ 14,90
*Total dos itens: R$ 134,90*
Entrega: taxa a confirmar com o atendente.
Total a pagar: total dos itens + taxa de entrega.

*DADOS PARA ENTREGA*
Nome: Cliente Teste
Telefone: 24999990000
Endereço: Rua de Teste, nº 10 — Centro
Tipo de imóvel: Casa
Complemento: Portão azul
Pagamento: Pix
```

## Combo 02 x2

```text
🍕 *NOVO PEDIDO — LA BELLA PIZZA*

*ITENS DO PEDIDO*

1. *2x Combo 02 - 2 Grandes + Refri/Mate 1.5L*
• Pizza: À Moda do Cheff — Grande (35cm)
• Pizza: Pepperoni — Grande (35cm)
• Bebida inclusa: Refri ou Mate 1.5L (Sob consulta)
Composição acima por combo.
Preço unitário: R$ 132,90
Total do item: *R$ 265,80*
Economia: R$ 61,80

*RESUMO DO PEDIDO*
Subtotal antes dos descontos: R$ 327,60
Descontos/economia: -R$ 61,80
*Total dos itens: R$ 265,80*
Entrega: taxa a confirmar com o atendente.
Total a pagar: total dos itens + taxa de entrega.

*DADOS PARA ENTREGA*
Nome: Cliente Teste
Telefone: 24999990000
Endereço: Rua de Teste, nº 10 — Centro
Tipo de imóvel: Casa
Complemento: Portão azul
Pagamento: Pix
```

## Combo + pizza + bebida

```text
🍕 *NOVO PEDIDO — LA BELLA PIZZA*

*ITENS DO PEDIDO*

1. *1x Combo 01 - Super + Média Doce + Refri/Mate 1.5L*
• Pizza: À Moda do Cheff — Super (40cm)
• Pizza: Festa — Média (30cm)
• Bebida inclusa: Refri ou Mate 1.5L (Sob consulta)
Total do item: *R$ 134,90*
Economia: R$ 14,90

2. *1x Muçarela (G)*
Total do item: *R$ 64,90*

3. *1x Coca-Cola Zero (2L)*
Total do item: *R$ 15,00*

*RESUMO DO PEDIDO*
Subtotal antes dos descontos: R$ 229,70
Descontos/economia: -R$ 14,90
*Total dos itens: R$ 214,80*
Entrega: taxa a confirmar com o atendente.
Total a pagar: total dos itens + taxa de entrega.

*DADOS PARA ENTREGA*
Nome: Cliente Teste
Telefone: 24999990000
Endereço: Rua de Teste, nº 10 — Centro
Tipo de imóvel: Casa
Complemento: Portão azul
Pagamento: Pix
```

## Combo + meio a meio

```text
🍕 *NOVO PEDIDO — LA BELLA PIZZA*

*ITENS DO PEDIDO*

1. *1x Combo 02 - 2 Grandes + Refri/Mate 1.5L*
• Pizza: À Moda do Cheff — Grande (35cm)
• Pizza: Pepperoni — Grande (35cm)
• Bebida inclusa: Refri ou Mate 1.5L (Sob consulta)
Total do item: *R$ 132,90*
Economia: R$ 30,90

2. *1x Pizza Meio a Meio (Média (30 cm))*
• ½ Muçarela + ½ À Moda do Cheff
Total do item: *R$ 68,90*

*RESUMO DO PEDIDO*
Subtotal antes dos descontos: R$ 232,70
Descontos/economia: -R$ 30,90
*Total dos itens: R$ 201,80*
Entrega: taxa a confirmar com o atendente.
Total a pagar: total dos itens + taxa de entrega.

*DADOS PARA ENTREGA*
Nome: Cliente Teste
Telefone: 24999990000
Endereço: Rua de Teste, nº 10 — Centro
Tipo de imóvel: Casa
Complemento: Portão azul
Pagamento: Pix
```

## Quarta quantidade dois

```text
🍕 *NOVO PEDIDO — LA BELLA PIZZA*

*ITENS DO PEDIDO*

1. *2x Atum (G)*
Preço unitário: R$ 69,90
Total do item: *R$ 129,80*
Desconto aplicado: R$ 10,00

*RESUMO DO PEDIDO*
Subtotal antes dos descontos: R$ 139,80
Descontos/economia: -R$ 10,00
*Total dos itens: R$ 129,80*
Entrega: taxa a confirmar com o atendente.
Total a pagar: total dos itens + taxa de entrega.

*DADOS PARA ENTREGA*
Nome: Cliente Teste
Telefone: 24999990000
Endereço: Rua de Teste, nº 10 — Centro
Tipo de imóvel: Casa
Complemento: Portão azul
Pagamento: Pix
```

## Quarta meio a meio + avulsa

```text
🍕 *NOVO PEDIDO — LA BELLA PIZZA*

*ITENS DO PEDIDO*

1. *1x Pizza Meio a Meio (Grande (35 cm))*
• ½ Atum + ½ À Moda do Cheff
Total do item: *R$ 76,90*

2. *1x À Moda do Cheff (G)*
Total do item: *R$ 65,90*
Desconto aplicado: R$ 11,00

*RESUMO DO PEDIDO*
Subtotal antes dos descontos: R$ 153,80
Descontos/economia: -R$ 11,00
*Total dos itens: R$ 142,80*
Entrega: taxa a confirmar com o atendente.
Total a pagar: total dos itens + taxa de entrega.

*DADOS PARA ENTREGA*
Nome: Cliente Teste
Telefone: 24999990000
Endereço: Rua de Teste, nº 10 — Centro
Tipo de imóvel: Casa
Complemento: Portão azul
Pagamento: Pix
```

## Terça duas grandes

```text
🍕 *NOVO PEDIDO — LA BELLA PIZZA*

*ITENS DO PEDIDO*

1. *1x La Bella em Dobro - 2 Grandes (35cm)*
• Pizza: Atum — Grande (35cm)
• Pizza: Atum — Grande (35cm)
Total do item: *R$ 129,90*
Economia: R$ 9,90

*RESUMO DO PEDIDO*
Subtotal antes dos descontos: R$ 139,80
Descontos/economia: -R$ 9,90
*Total dos itens: R$ 129,90*
Entrega: taxa a confirmar com o atendente.
Total a pagar: total dos itens + taxa de entrega.

*DADOS PARA ENTREGA*
Nome: Cliente Teste
Telefone: 24999990000
Endereço: Rua de Teste, nº 10 — Centro
Tipo de imóvel: Casa
Complemento: Portão azul
Pagamento: Pix
```

## Combo automático com Coca Zero

```text
🍕 *NOVO PEDIDO — LA BELLA PIZZA*

*ITENS DO PEDIDO*

1. *1x Combo 02 - 2 Grandes + Refri/Mate 1.5L*
• Pizza: Atum — Grande (35cm)
• Pizza: Atum — Grande (35cm)
• Bebida inclusa: Coca-Cola Zero 1.5L (Sujeito a estoque)
Total do item: *R$ 132,90*
Economia: R$ 18,90

*RESUMO DO PEDIDO*
Subtotal antes dos descontos: R$ 151,80
Descontos/economia: -R$ 18,90
*Total dos itens: R$ 132,90*
Entrega: taxa a confirmar com o atendente.
Total a pagar: total dos itens + taxa de entrega.

*DADOS PARA ENTREGA*
Nome: Cliente Teste
Telefone: 24999990000
Endereço: Rua de Teste, nº 10 — Centro
Tipo de imóvel: Casa
Complemento: Portão azul
Pagamento: Pix
```

## Duas grandes sem bebida

```text
🍕 *NOVO PEDIDO — LA BELLA PIZZA*

*ITENS DO PEDIDO*

1. *2x À Moda do Cheff (G)*
Preço unitário: R$ 76,90
Total do item: *R$ 153,80*

*RESUMO DO PEDIDO*
Subtotal antes dos descontos: R$ 153,80
*Total dos itens: R$ 153,80*
Entrega: taxa a confirmar com o atendente.
Total a pagar: total dos itens + taxa de entrega.

*DADOS PARA ENTREGA*
Nome: Cliente Teste
Telefone: 24999990000
Endereço: Rua de Teste, nº 10 — Centro
Tipo de imóvel: Casa
Complemento: Portão azul
Pagamento: Pix
```

## Terça meio a meio x2

```text
🍕 *NOVO PEDIDO — LA BELLA PIZZA*

*ITENS DO PEDIDO*

1. *2x Pizza Meio a Meio (Grande (35 cm))*
• ½ Muçarela + ½ À Moda do Cheff
Preço unitário: R$ 76,90
Total do item: *R$ 153,80*

*RESUMO DO PEDIDO*
Subtotal antes dos descontos: R$ 153,80
*Total dos itens: R$ 153,80*
Entrega: taxa a confirmar com o atendente.
Total a pagar: total dos itens + taxa de entrega.

*DADOS PARA ENTREGA*
Nome: Cliente Teste
Telefone: 24999990000
Endereço: Rua de Teste, nº 10 — Centro
Tipo de imóvel: Casa
Complemento: Portão azul
Pagamento: Pix
```

## Checkout real combo + pizza

```text
🍕 *NOVO PEDIDO — LA BELLA PIZZA*

*ITENS DO PEDIDO*

1. *1x Combo 01 - Super + Média Doce + Refri/Mate 1.5L*
• Pizza: À Moda do Cheff — Super (40cm)
• Pizza: Festa — Média (30cm)
• Bebida inclusa: Refri ou Mate 1.5L (Sob consulta)
Total do item: *R$ 134,90*
Economia: R$ 14,90

2. *1x Muçarela (M)*
Total do item: *R$ 54,90*

*RESUMO DO PEDIDO*
Subtotal antes dos descontos: R$ 204,70
Descontos/economia: -R$ 14,90
*Total dos itens: R$ 189,80*
Entrega: taxa a confirmar com o atendente.
Total a pagar: total dos itens + taxa de entrega.

*DADOS PARA ENTREGA*
Nome: Cliente Teste
Telefone: 24999990000
Endereço: Rua de Teste, nº 10 — Centro
Tipo de imóvel: Casa
Complemento: Portão azul
Pagamento: Pix
```

## Tradicionais sem bebida

```text
🍕 *NOVO PEDIDO — LA BELLA PIZZA*

*ITENS DO PEDIDO*

1. *2x Atum (G)*
Preço unitário: R$ 69,90
Total do item: *R$ 139,80*

*RESUMO DO PEDIDO*
Subtotal antes dos descontos: R$ 139,80
*Total dos itens: R$ 139,80*
Entrega: taxa a confirmar com o atendente.
Total a pagar: total dos itens + taxa de entrega.

*DADOS PARA ENTREGA*
Nome: Cliente Teste
Telefone: 24999990000
Endereço: Rua de Teste, nº 10 — Centro
Tipo de imóvel: Casa
Complemento: Portão azul
Pagamento: Pix
```

## Volume incompatível

```text
🍕 *NOVO PEDIDO — LA BELLA PIZZA*

*ITENS DO PEDIDO*

1. *2x Atum (G)*
Preço unitário: R$ 69,90
Total do item: *R$ 139,80*

2. *1x Coca-Cola (Comum ou Zero) (600ml)*
Total do item: *R$ 8,00*

*RESUMO DO PEDIDO*
Subtotal antes dos descontos: R$ 147,80
*Total dos itens: R$ 147,80*
Entrega: taxa a confirmar com o atendente.
Total a pagar: total dos itens + taxa de entrega.

*DADOS PARA ENTREGA*
Nome: Cliente Teste
Telefone: 24999990000
Endereço: Rua de Teste, nº 10 — Centro
Tipo de imóvel: Casa
Complemento: Portão azul
Pagamento: Pix
```

## Combo 01 automático

```text
🍕 *NOVO PEDIDO — LA BELLA PIZZA*

*ITENS DO PEDIDO*

1. *1x Combo 01 - Super + Média Doce + Refri/Mate 1.5L*
• Pizza: Atum — Super (40cm)
• Pizza: Festa — Média (30cm)
• Bebida inclusa: Mate Leão Limão 1.5L (Sujeito a estoque)
Total do item: *R$ 134,90*
Economia: R$ 11,90

*RESUMO DO PEDIDO*
Subtotal antes dos descontos: R$ 146,80
Descontos/economia: -R$ 11,90
*Total dos itens: R$ 134,90*
Entrega: taxa a confirmar com o atendente.
Total a pagar: total dos itens + taxa de entrega.

*DADOS PARA ENTREGA*
Nome: Cliente Teste
Telefone: 24999990000
Endereço: Rua de Teste, nº 10 — Centro
Tipo de imóvel: Casa
Complemento: Portão azul
Pagamento: Pix
```

## Combo + avulsa na quarta

```text
🍕 *NOVO PEDIDO — LA BELLA PIZZA*

*ITENS DO PEDIDO*

1. *1x Atum (G)*
Total do item: *R$ 59,90*
Desconto aplicado: R$ 10,00

2. *1x Combo 02 - 2 Grandes + Refri/Mate 1.5L*
• Pizza: Atum — Grande (35cm)
• Pizza: Atum — Grande (35cm)
• Bebida inclusa: Coca-Cola Zero 1.5L (Sujeito a estoque)
Total do item: *R$ 132,90*
Economia: R$ 18,90

*RESUMO DO PEDIDO*
Subtotal antes dos descontos: R$ 221,70
Descontos/economia: -R$ 28,90
*Total dos itens: R$ 192,80*
Entrega: taxa a confirmar com o atendente.
Total a pagar: total dos itens + taxa de entrega.

*DADOS PARA ENTREGA*
Nome: Cliente Teste
Telefone: 24999990000
Endereço: Rua de Teste, nº 10 — Centro
Tipo de imóvel: Casa
Complemento: Portão azul
Pagamento: Pix
```

## Avulsas promocionais mais baratas

```text
🍕 *NOVO PEDIDO — LA BELLA PIZZA*

*ITENS DO PEDIDO*

1. *2x Atum (G)*
Preço unitário: R$ 69,90
Total do item: *R$ 129,80*
Desconto aplicado: R$ 10,00

2. *1x Mate Leão (Natural ou Limão) (1.5L)*
Total do item: *R$ 10,00*

*RESUMO DO PEDIDO*
Subtotal antes dos descontos: R$ 149,80
Descontos/economia: -R$ 10,00
*Total dos itens: R$ 139,80*
Entrega: taxa a confirmar com o atendente.
Total a pagar: total dos itens + taxa de entrega.

*DADOS PARA ENTREGA*
Nome: Cliente Teste
Telefone: 24999990000
Endereço: Rua de Teste, nº 10 — Centro
Tipo de imóvel: Casa
Complemento: Portão azul
Pagamento: Pix
```

## Dois combos automáticos

```text
🍕 *NOVO PEDIDO — LA BELLA PIZZA*

*ITENS DO PEDIDO*

1. *1x Combo 02 - 2 Grandes + Refri/Mate 1.5L*
• Pizza: Atum — Grande (35cm)
• Pizza: Atum — Grande (35cm)
• Bebida inclusa: Coca-Cola Zero 1.5L (Sujeito a estoque)
Total do item: *R$ 132,90*
Economia: R$ 18,90

2. *1x Combo 02 - 2 Grandes + Refri/Mate 1.5L*
• Pizza: Atum — Grande (35cm)
• Pizza: Atum — Grande (35cm)
• Bebida inclusa: Coca-Cola Zero 1.5L (Sujeito a estoque)
Total do item: *R$ 132,90*
Economia: R$ 18,90

*RESUMO DO PEDIDO*
Subtotal antes dos descontos: R$ 303,60
Descontos/economia: -R$ 37,80
*Total dos itens: R$ 265,80*
Entrega: taxa a confirmar com o atendente.
Total a pagar: total dos itens + taxa de entrega.

*DADOS PARA ENTREGA*
Nome: Cliente Teste
Telefone: 24999990000
Endereço: Rua de Teste, nº 10 — Centro
Tipo de imóvel: Casa
Complemento: Portão azul
Pagamento: Pix
```

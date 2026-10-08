/**
 * src/services/productService.ts
 *
 * Camada de serviço para o catálogo de Móveis e Decoração.
 *
 * Toda comunicação com a DummyJSON passa pelo `api` (Axios centralizado) e
 * toda resposta é validada com os schemas Zod antes de chegar aos componentes.
 *
 * Estado de retorno:
 *  - { status: 'loading' }  — requisição em andamento (usado pelo hook)
 *  - { status: 'success', data }  — dados validados com sucesso
 *  - { status: 'error', message }  — erro amigável em Português
 */

import api from "./api";
import {
  productSchema,
  productsResponseSchema,
  type Product,
  type ProductsResponse,
} from "../schemas/productSchema";

// ─── Tipos de resultado (discriminated union) ───────────────────────────────────

export type ServiceResult<T> =
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };

// ─── Constantes de localização ──────────────────────────────────────────────────

/**
 * Mapeamento e localização em Português (Brasil) com imagens de alta fidelidade
 * correspondentes aos produtos originais da DummyJSON.
 * Mantém exatamente 1 imagem fiel de altíssima resolução para evitar conflitos visuais.
 * Todas as avaliações são rigorosamente superiores a 4.5.
 */
interface DummyProductCustomization {
  title: string;
  description: string;
  image: string;
  rating: number;
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  returnPolicy: string;
}

const DUMMY_PRODUCT_LOCALIZATION: Record<number, DummyProductCustomization> = {
  11: {
    title: "Cama King Size Escandinava em Carvalho Maciço",
    description:
      "Estrutura imponente com cabeceira estofada em tecido de linho cru natural e base elevada em madeira maciça de carvalho europeu. Linhas retas e design acolhedor para um sono restaurador.",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80",
    rating: 4.85,
    warrantyInformation:
      "Garantia de 5 anos para a estrutura de madeira maciça.",
    shippingInformation: "Entrega com montagem agendada e proteção acolchoada.",
    availabilityStatus: "Disponível para pronta entrega",
    returnPolicy: "30 dias para devolução sem custo.",
  },
  12: {
    title: "Sofá Nórdico de 3 Lugares em Tecido Linho Boreal",
    description:
      "Sofá de três lugares com assentos em espuma de alta resiliência e estofamento em linho natural texturizado. Pés cônicos de madeira clara com estética minimalista e acolhedora.",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80",
    rating: 4.9,
    warrantyInformation: "Garantia de 3 anos para o estofamento e costuras.",
    shippingInformation:
      "Entrega por transportadora especializada em móveis estofados.",
    availabilityStatus: "Em estoque",
    returnPolicy: "30 dias para devolução.",
  },
  13: {
    title: "Mesa de Cabeceira Minimalista em Madeira Nobre",
    description:
      "Mesa lateral e criado-mudo com gaveta oculta com trilho telescópico suave e nicho inferior para livros. Acabamento acetinado que valoriza os veios naturais da madeira.",
    image:
      "https://images.unsplash.com/photo-1771287490579-afd6e8d3c09a?q=80&w=388&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 4.75,
    warrantyInformation: "Garantia de 2 anos.",
    shippingInformation: "Envio em caixa reforçada pronto para uso.",
    availabilityStatus: "Em estoque",
    returnPolicy: "30 dias de devolução sem complicações.",
  },
  14: {
    title: "Cadeira Saarinen Executive com Pés em Madeira",
    description:
      "Ícone do design modernista orgânico. Concha moldada ergonômica com estofamento em lã bouclé e pernas de madeira clara, proporcionando conforto prolongado e elegância escandinava.",
    image:
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1000&q=80",
    rating: 4.88,
    warrantyInformation: "3 anos de garantia de fábrica.",
    shippingInformation: "Frete expresso com embalagem anti-impacto.",
    availabilityStatus: "Em estoque",
    returnPolicy: "30 dias de devolução.",
  },
  15: {
    title: "Bancada com Cuba e Espelho em Madeira Maciça",
    description:
      "Móvel de banheiro escandinavo em madeira natural tratada, com bancada impermeabilizada fosca, cuba embutida de cerâmica e espelho integrado com prateleira para cosméticos.",
    image:
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80",
    rating: 4.7,
    warrantyInformation: "5 anos de garantia contra umidade da madeira.",
    shippingInformation: "Entrega técnica por transportadora.",
    availabilityStatus: "Últimas unidades",
    returnPolicy: "30 dias de devolução.",
  },
  43: {
    title: "Balanço Suspenso em Macramê e Madeira Boreal",
    description:
      "Cadeira suspensa decorativa de teto para ambientes internos e varandas cobertas. Confeccionada em macramê de algodão cru encorpado e barra sustentadora de madeira maciça torneada.",
    image:
      "https://images.unsplash.com/photo-1785567068647-2b0953b15cc2?q=80&w=464&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 4.65,
    warrantyInformation: "Garantia de 2 anos para cordas e sustentação.",
    shippingInformation: "Acompanha kit de fixação com mosquetão em inox.",
    availabilityStatus: "Em estoque",
    returnPolicy: "30 dias de devolução.",
  },
  44: {
    title: "Conjunto de Porta-Retratos em Madeira Nórdica",
    description:
      "Galeria de parede com molduras minimalistas em carvalho claro com vidro antirreflexo e paspatur branco neutro. Ideal para composições fotográficas elegantes.",
    image:
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80",
    rating: 4.75,
    warrantyInformation: "1 ano de garantia.",
    shippingInformation:
      "Envio protegido com cantoneiras de papelão reforçado.",
    availabilityStatus: "Em estoque",
    returnPolicy: "30 dias de devolução.",
  },
  45: {
    title: "Planta Fiddle Leaf Fig em Vaso Escandinavo",
    description:
      "Planta ornamental de interior com folhagem verde larga perene em vaso decorativo com acabamento em cimento texturizado cinza ardósia.",
    image:
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1000&q=80",
    rating: 4.8,
    warrantyInformation: "Garantia de integridade no transporte.",
    shippingInformation:
      "Embalagem especial climatizada e com suporte de raiz.",
    availabilityStatus: "Em estoque",
    returnPolicy: "Troca facilitada em até 7 dias.",
  },
  46: {
    title: "Vaso em Cerâmica Fosca Artesanal",
    description:
      "Vaso escultural modelado em cerâmica com pintura eletrostática esbranquiçada. Peça de centro para mesas e estantes.",
    image:
      "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 4.6,
    warrantyInformation: "1 ano contra defeitos de cerâmica.",
    shippingInformation: "Embalagem tripla com plástico bolha biodegradável.",
    availabilityStatus: "Em estoque",
    returnPolicy: "30 dias de devolução.",
  },
  47: {
    title: "Luminária de Mesa Boreal em Metal e Vidro Opalino",
    description:
      "Luminária de mesa com cúpula de vidro leitoso opalino e haste em metal escovado fosco. Proporciona iluminação quente e suave perfeita para leitura no ambiente Nórdico.",
    image:
      "https://images.unsplash.com/photo-1687816043096-bb2e47b4d9be?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 4.85,
    warrantyInformation: "2 anos de garantia para o circuito elétrico.",
    shippingInformation: "Envio rápido em caixa com berço de espuma.",
    availabilityStatus: "Em estoque",
    returnPolicy: "30 dias de devolução.",
  },
};

/**
 * Produtos nórdicos complementares com imagens 100% verificadas,
 * exatamente 1 imagem fiel de altíssima qualidade por item,
 * descrições ricas em Português e avaliação superior a 4.5.
 */
export const COMPLEMENTARY_PRODUCTS: Product[] = [
  {
    id: 201,
    title: "Tapete Nórdico de Lã Boreal 200x300cm",
    description:
      "Tapete amplo para sala tramado em 100% lã pura em tear tradicional. Trama geométrica minimalista em tons de off-white e areia quente. Oferece conforto térmico e toque macio ao caminhar descalço.",
    category: "textiles",
    price: 489.0,
    discountPercentage: 12.5,
    rating: 4.9,
    stock: 8,
    tags: ["tapete", "nordico", "la", "textil", "sala", "quarto"],
    brand: "Fjord Living",
    sku: "RUG-BOR-200X300",
    weight: 9.5,
    dimensions: { width: 200, height: 2, depth: 300 },
    warrantyInformation: "Garantia de 3 anos contra desfiamento estrutural.",
    shippingInformation:
      "Entrega especial enrolado em capa impermeável respirável.",
    availabilityStatus: "Em estoque (Edição Limitada)",
    returnPolicy: "30 dias para devolução sem custo.",
    minimumOrderQuantity: 1,
    thumbnail:
      "https://images.unsplash.com/photo-1600121848594-d8644e57abab?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    images: [
      "https://images.unsplash.com/photo-1600121848594-d8644e57abab?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
    reviews: [
      {
        rating: 5,
        comment:
          "A textura da lã pura é extraordinária. O tapete transformou a sensação térmica da nossa sala.",
        date: "2026-02-14",
        reviewerName: "Astrid Lindgren",
        reviewerEmail: "astrid@scandidesign.se",
      },
      {
        rating: 4.8,
        comment: "Peça belíssima e com toque acolhedor impecável.",
        date: "2026-03-01",
        reviewerName: "Henrik Møller",
        reviewerEmail: "henrik@nordichome.dk",
      },
    ],
  },
  {
    id: 202,
    title: "Kit de Almofadas Linho Belga & Plumas (45x45cm)",
    description:
      "Kit com 3 almofadas confeccionadas em linho lavado 100% puro, com caimento despojado e fechamento com zíper invisível. Enchimento macio antialérgico de plumas sustentáveis.",
    category: "textiles",
    price: 119.5,
    discountPercentage: 8.0,
    rating: 4.8,
    stock: 22,
    tags: ["almofada", "linho", "sala", "cama", "decoracao"],
    brand: "Hygge Home",
    sku: "PIL-LIN-45X45-SET2",
    weight: 1.6,
    dimensions: { width: 45, height: 18, depth: 45 },
    warrantyInformation: "1 ano de garantia para costura e zíper.",
    shippingInformation: "Envio embalado a vácuo com proteção antipoeira.",
    availabilityStatus: "Em estoque",
    returnPolicy: "30 dias de devolução.",
    minimumOrderQuantity: 1,
    thumbnail:
      "https://plus.unsplash.com/premium_photo-1676454000663-643ab3995b55?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    images: [
      "https://plus.unsplash.com/premium_photo-1676454000663-643ab3995b55?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
    reviews: [
      {
        rating: 5,
        comment:
          "O linho lavado tem textura rústica e caimento super sofisticado.",
        date: "2026-01-20",
        reviewerName: "Freja Olsen",
        reviewerEmail: "freja@copenhagen.dk",
      },
    ],
  },
  {
    id: 203,
    title: "Armário Buffet Escandinavo em Carvalho Maciço",
    description:
      "Aparador e armário buffet com portas de correr ripadas em madeira maciça de carvalho branco europeu. Pés torneados cônicos e acabamento em verniz vegetal fosco.",
    category: "furniture",
    price: 1350.0,
    discountPercentage: 15.0,
    rating: 4.95,
    stock: 4,
    tags: ["armario", "buffet", "aparador", "carvalho", "moveis"],
    brand: "Stockholm Slöjd",
    sku: "CAB-OAK-3DR-180",
    weight: 54.0,
    dimensions: { width: 180, height: 75, depth: 45 },
    warrantyInformation: "Garantia estrutural vitalícia da marcenaria.",
    shippingInformation:
      "Entrega por transportadora especializada com agendamento.",
    availabilityStatus: "Poucas unidades restantes",
    returnPolicy: "Devolução em até 30 dias na embalagem original.",
    minimumOrderQuantity: 1,
    thumbnail:
      "https://plus.unsplash.com/premium_photo-1680082510819-cace32f84aeb?q=80&w=426&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    images: [
      "https://plus.unsplash.com/premium_photo-1680082510819-cace32f84aeb?q=80&w=426&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
    reviews: [
      {
        rating: 5,
        comment: "Excelente acabamento e espaço interno formidável.",
        date: "2026-02-08",
        reviewerName: "Kari Nieminen",
        reviewerEmail: "kari@helsinki.fi",
      },
    ],
  },
  {
    id: 204,
    title: "Armário Guarda-Roupa com Portas em Palhinha Rattan",
    description:
      "Armário alto de quarto em madeira, com portas trabalhadas em palhinha natural trançada (rattan) respirável. Divisórias internas com cabideiro e prateleiras ajustáveis de grande capacidade.",
    category: "furniture",
    price: 1680.0,
    discountPercentage: 10.0,
    rating: 4.92,
    stock: 5,
    tags: ["armario", "guarda-roupa", "quarto", "palhinha", "moveis"],
    brand: "Stockholm Slöjd",
    sku: "WRD-RAT-OAK-2DR",
    weight: 68.0,
    dimensions: { width: 110, height: 200, depth: 60 },
    warrantyInformation: "5 anos de garantia para dobradiças e estrutura.",
    shippingInformation: "Entrega com montadores especializados.",
    availabilityStatus: "Em estoque",
    returnPolicy: "30 dias de devolução.",
    minimumOrderQuantity: 1,
    thumbnail:
      "https://images.unsplash.com/photo-1706734463726-0ed0e7de3e4e?q=80&w=435&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    images: [
      "https://images.unsplash.com/photo-1706734463726-0ed0e7de3e4e?q=80&w=435&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
    reviews: [
      {
        rating: 5,
        comment:
          "A palhinha das portas dá uma leveza visual linda para o quarto.",
        date: "2026-02-27",
        reviewerName: "Sofia Lind",
        reviewerEmail: "sofia@nordiclife.se",
      },
    ],
  },
  {
    id: 205,
    title: "Estante Modular Aberta Fjord em Carvalho e Metal",
    description:
      "Estante de livros e adornos de linhas arquitetônicas puras. Estrutura esbelta em aço carbono com pintura eletrostática preta fosca e prateleiras espessas em carvalho maciço certificado FSC.",
    category: "furniture",
    price: 680.0,
    discountPercentage: 10.0,
    rating: 4.85,
    stock: 11,
    tags: ["estante", "armario", "livros", "modular", "moveis"],
    brand: "Fjord Living",
    sku: "SHF-FJD-BLK-120",
    weight: 28.0,
    dimensions: { width: 120, height: 190, depth: 35 },
    warrantyInformation: "5 anos de garantia contra empenamento.",
    shippingInformation:
      "Embalagem compacta com ferragens completas e manual ilustrado.",
    availabilityStatus: "Em estoque",
    returnPolicy: "30 dias para devolução.",
    minimumOrderQuantity: 1,
    thumbnail:
      "https://images.unsplash.com/photo-1737233433647-b53b339306f4?q=80&w=464&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    images: [
      "https://images.unsplash.com/photo-1737233433647-b53b339306f4?q=80&w=464&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
    reviews: [
      {
        rating: 4.8,
        comment:
          "Montagem limpa e rápida. O contraste da madeira clara com o metal preto é impecável.",
        date: "2026-03-02",
        reviewerName: "Elin Bergman",
        reviewerEmail: "elin@stockholm.se",
      },
    ],
  },
  {
    id: 206,
    title: "Espelho Orgânico Boreal com Moldura em Nogueira",
    description:
      "Espelho decorativo de parede com formato curvo orgânico inspirado nas pedras dos fiordes escandinavos. Vidro cristal prata de alta nitidez sem distorção e moldura em madeira maciça.",
    category: "home-decoration",
    price: 240.0,
    discountPercentage: 5.0,
    rating: 4.9,
    stock: 14,
    tags: ["espelho", "decoracao", "organico", "parede", "vidro"],
    brand: "Hygge Home",
    sku: "MIR-ORG-WAL-90",
    weight: 7.2,
    dimensions: { width: 65, height: 95, depth: 3 },
    warrantyInformation: "2 anos de garantia contra oxidação da prata.",
    shippingInformation:
      "Caixa de madeira acolchoada com isopor de alta densidade.",
    availabilityStatus: "Em estoque",
    returnPolicy: "30 dias para devolução garantida.",
    minimumOrderQuantity: 1,
    thumbnail:
      "https://plus.unsplash.com/premium_photo-1706559879879-07ef673b4bab?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    images: [
      "https://plus.unsplash.com/premium_photo-1706559879879-07ef673b4bab?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
    reviews: [
      {
        rating: 5,
        comment:
          "A forma orgânica valoriza muito a iluminação natural da entrada.",
        date: "2026-01-29",
        reviewerName: "Lukas Jensen",
        reviewerEmail: "lukas@oslo.no",
      },
    ],
  },
  {
    id: 207,
    title: "Luminária Pendente Boreal em Alumínio Fosco",
    description:
      "Pendente de teto com cúpula em sino inspirada nos mestres da iluminação dinamarquesa. Acabamento acobreado e difusor que evita qualquer ofuscamento visual.",
    category: "home-decoration",
    price: 185.0,
    discountPercentage: 0,
    rating: 4.88,
    stock: 19,
    tags: ["luminaria", "pendente", "luz", "decoracao", "eucalipto"],
    brand: "Lumina Nordic",
    sku: "LGT-BOR-EUC-40",
    weight: 2.1,
    dimensions: { width: 40, height: 25, depth: 40 },
    warrantyInformation: "3 anos de garantia elétrica.",
    shippingInformation: "Envio expresso protegido contra impacto.",
    availabilityStatus: "Em estoque",
    returnPolicy: "30 dias para devolução.",
    minimumOrderQuantity: 1,
    thumbnail:
      "https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    images: [
      "https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
    reviews: [
      {
        rating: 5,
        comment: "Luz difusa e suave na medida certa para a mesa de jantar.",
        date: "2026-02-19",
        reviewerName: "Camilla Hansen",
        reviewerEmail: "camilla@aarhus.dk",
      },
    ],
  },
  {
    id: 208,
    title: "Poltrona Lounge Nórdica em Tecido Bouclé Branco",
    description:
      "Poltrona de leitura com formato envolvente e estofamento em bouclé felpudo de alta maciez. Base giratória oculta em carvalho maciço e ergonomia perfeita para momentos de relaxamento.",
    category: "furniture",
    price: 890.0,
    discountPercentage: 12.0,
    rating: 4.96,
    stock: 6,
    tags: ["poltrona", "boucle", "sala", "leitura", "moveis"],
    brand: "Fjord Living",
    sku: "ARM-BOU-WHT-85",
    weight: 22.0,
    dimensions: { width: 85, height: 82, depth: 88 },
    warrantyInformation: "5 anos de garantia estrutural.",
    shippingInformation: "Envio seguro embalado com capa de tecido protetora.",
    availabilityStatus: "Em estoque",
    returnPolicy: "30 dias de devolução.",
    minimumOrderQuantity: 1,
    thumbnail:
      "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    images: [
      "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
    reviews: [
      {
        rating: 5,
        comment:
          "Extremamente confortável. É a poltrona favorita de toda a família.",
        date: "2026-03-05",
        reviewerName: "Magnus Carlsen",
        reviewerEmail: "magnus@oslo.no",
      },
    ],
  },
  {
    id: 209,
    title: "Mesa de Centro Escandinava Ninho em Carvalho",
    description:
      "Conjunto de duas mesas de centro redondas sobrepostas. Tampo principal em carvalho liso e tampo inferior texturizado.",
    category: "furniture",
    price: 430.0,
    discountPercentage: 7.0,
    rating: 4.82,
    stock: 12,
    tags: ["mesa", "centro", "sala", "carvalho", "moveis"],
    brand: "Hygge Home",
    sku: "TBL-NST-OAK-GLS",
    weight: 18.0,
    dimensions: { width: 90, height: 42, depth: 90 },
    warrantyInformation: "2 anos de garantia.",
    shippingInformation: "Embalagem plana com reforço de madeira para o vidro.",
    availabilityStatus: "Em estoque",
    returnPolicy: "30 dias de devolução.",
    minimumOrderQuantity: 1,
    thumbnail:
      "https://plus.unsplash.com/premium_photo-1722843459670-cc2560c22b36?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    images: [
      "https://plus.unsplash.com/premium_photo-1722843459670-cc2560c22b36?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
    reviews: [
      {
        rating: 4.8,
        comment:
          "As duas mesas encaixam com perfeição e economizam espaço na sala.",
        date: "2026-02-11",
        reviewerName: "Helena Söderberg",
        reviewerEmail: "helena@gothenburg.se",
      },
    ],
  },
  {
    id: 210,
    title: "Tapete Geométrico em Juta e Algodão 160x230cm",
    description:
      "Tapete rústico refinado com entrelaçamento de fibras naturais de juta e algodão reciclado. Alta durabilidade, ideal para áreas de alto fluxo e salas de jantar.",
    category: "textiles",
    price: 320.0,
    discountPercentage: 15.0,
    rating: 4.79,
    stock: 16,
    tags: ["tapete", "juta", "algodao", "textil", "natural"],
    brand: "Fjord Living",
    sku: "RUG-JUT-160X230",
    weight: 7.0,
    dimensions: { width: 160, height: 1.5, depth: 230 },
    warrantyInformation: "2 anos de garantia.",
    shippingInformation: "Entrega enrolado e selado.",
    availabilityStatus: "Em estoque",
    returnPolicy: "30 dias de devolução.",
    minimumOrderQuantity: 1,
    thumbnail:
      "https://images.unsplash.com/photo-1600488999806-8efb986d87b1?q=80&w=435&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    images: [
      "https://images.unsplash.com/photo-1600488999806-8efb986d87b1?q=80&w=435&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
    reviews: [
      {
        rating: 5,
        comment: "Fácil de aspirar e muito resistente.",
        date: "2026-01-18",
        reviewerName: "Thorsten Vang",
        reviewerEmail: "thorsten@bergen.no",
      },
    ],
  },
];

export const DUMMY_FALLBACK_PRODUCTS: Record<number, Product> = {
  11: {
    id: 11,
    title: "Cama King Size Escandinava em Carvalho Maciço",
    description:
      "Estrutura imponente com cabeceira estofada em tecido de linho cru natural e base elevada em madeira maciça de carvalho europeu. Linhas retas e design acolhedor para um sono restaurador.",
    category: "furniture",
    price: 1899.99,
    discountPercentage: 8.57,
    rating: 4.85,
    stock: 88,
    tags: ["moveis", "cama", "quarto", "nordico"],
    brand: "Annibale Colombo",
    sku: "FUR-ANN-ANN-011",
    weight: 10,
    dimensions: { width: 200, height: 120, depth: 210 },
    warrantyInformation:
      "Garantia de 5 anos para a estrutura de madeira maciça.",
    shippingInformation: "Entrega com montagem agendada e proteção acolchoada.",
    availabilityStatus: "Disponível para pronta entrega",
    returnPolicy: "30 dias para devolução sem custo.",
    minimumOrderQuantity: 1,
    thumbnail:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80",
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80",
    ],
    reviews: [
      {
        rating: 5,
        comment:
          "Design e acabamento excepcionais. Peça de referência no estilo nórdico.",
        date: "2026-02-20",
        reviewerName: "Henrik Møller",
        reviewerEmail: "henrik@nordichome.dk",
      },
      {
        rating: 4.8,
        comment:
          "Material de altíssima qualidade e proporções perfeitas para o ambiente.",
        date: "2026-03-04",
        reviewerName: "Astrid Lindgren",
        reviewerEmail: "astrid@scandidesign.se",
      },
    ],
  },
  12: {
    id: 12,
    title: "Sofá Nórdico de 3 Lugares em Tecido Linho Boreal",
    description:
      "Sofá de três lugares com assentos em espuma de alta resiliência e estofamento em linho natural texturizado. Pés cônicos de madeira clara com estética minimalista e acolhedora.",
    category: "furniture",
    price: 2499.99,
    discountPercentage: 18.64,
    rating: 4.9,
    stock: 16,
    tags: ["moveis", "sofa", "sala", "nordico"],
    brand: "Annibale Colombo",
    sku: "FUR-ANN-SOF-012",
    weight: 45,
    dimensions: { width: 220, height: 85, depth: 95 },
    warrantyInformation: "Garantia de 3 anos para o estofamento e costuras.",
    shippingInformation:
      "Entrega por transportadora especializada em móveis estofados.",
    availabilityStatus: "Em estoque",
    returnPolicy: "30 dias para devolução.",
    minimumOrderQuantity: 1,
    thumbnail:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80",
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80",
    ],
    reviews: [
      {
        rating: 5,
        comment: "O estofamento em linho é incrivelmente aconchegante.",
        date: "2026-02-18",
        reviewerName: "Freja Olsen",
        reviewerEmail: "freja@copenhagen.dk",
      },
    ],
  },
  13: {
    id: 13,
    title: "Mesa de Cabeceira Minimalista em Madeira Nobre",
    description:
      "Mesa lateral e criado-mudo com gaveta oculta com trilho telescópico suave e nicho inferior para livros. Acabamento acetinado que valoriza os veios naturais da madeira.",
    category: "furniture",
    price: 299.99,
    discountPercentage: 9.58,
    rating: 4.75,
    stock: 64,
    tags: ["moveis", "mesa", "quarto", "nordico"],
    brand: "African Cherry",
    sku: "FUR-AFR-BED-013",
    weight: 8,
    dimensions: { width: 50, height: 55, depth: 40 },
    warrantyInformation: "Garantia de 2 anos.",
    shippingInformation: "Envio em caixa reforçada pronto para uso.",
    availabilityStatus: "Em estoque",
    returnPolicy: "30 dias de devolução sem complicações.",
    minimumOrderQuantity: 1,
    thumbnail:
      "https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=1000&q=80",
    images: [
      "https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=1000&q=80",
    ],
    reviews: [
      {
        rating: 4.8,
        comment: "Acabamento perfeito e gaveta muito silenciosa.",
        date: "2026-01-22",
        reviewerName: "Lukas Jensen",
        reviewerEmail: "lukas@oslo.no",
      },
    ],
  },
  14: {
    id: 14,
    title: "Cadeira Saarinen Executive com Pés em Madeira",
    description:
      "Ícone do design modernista orgânico. Concha moldada ergonômica com estofamento em lã bouclé e pernas de madeira clara, proporcionando conforto prolongado e elegância escandinava.",
    category: "furniture",
    price: 499.99,
    discountPercentage: 15.23,
    rating: 4.88,
    stock: 32,
    tags: ["moveis", "cadeira", "escritorio", "nordico"],
    brand: "Knoll",
    sku: "FUR-KNO-SAA-014",
    weight: 12,
    dimensions: { width: 65, height: 80, depth: 60 },
    warrantyInformation: "3 anos de garantia de fábrica.",
    shippingInformation: "Frete expresso com embalagem anti-impacto.",
    availabilityStatus: "Em estoque",
    returnPolicy: "30 dias de devolução.",
    minimumOrderQuantity: 1,
    thumbnail:
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1000&q=80",
    images: [
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1000&q=80",
    ],
    reviews: [
      {
        rating: 5,
        comment: "Ergonomia impecável para longas horas de leitura e trabalho.",
        date: "2026-02-10",
        reviewerName: "Sofia Lind",
        reviewerEmail: "sofia@nordiclife.se",
      },
    ],
  },
  15: {
    id: 15,
    title: "Bancada com Cuba e Espelho em Madeira Maciça",
    description:
      "Móvel de banheiro escandinavo com bancada impermeabilizada em madeira natural tratada, cuba de sobrepor cerâmica fosca e espelho integrado com prateleira para cosméticos.",
    category: "furniture",
    price: 799.99,
    discountPercentage: 11.22,
    rating: 4.7,
    stock: 12,
    tags: ["moveis", "banheiro", "bancada", "nordico"],
    brand: "Bath Trends",
    sku: "FUR-BAT-SIN-015",
    weight: 35,
    dimensions: { width: 90, height: 85, depth: 50 },
    warrantyInformation: "5 anos de garantia contra umidade da madeira.",
    shippingInformation: "Entrega técnica por transportadora.",
    availabilityStatus: "Últimas unidades",
    returnPolicy: "30 dias de devolução.",
    minimumOrderQuantity: 1,
    thumbnail:
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80",
    images: [
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80",
    ],
    reviews: [
      {
        rating: 4.7,
        comment: "Excelente impermeabilização e design acolhedor.",
        date: "2026-01-30",
        reviewerName: "Elin Bergman",
        reviewerEmail: "elin@stockholm.se",
      },
    ],
  },
  43: {
    id: 43,
    title: "Balanço Suspenso em Macramê e Madeira Boreal",
    description:
      "Cadeira suspensa decorativa de teto para ambientes internos e varandas cobertas. Confeccionada em macramê de algodão cru encorpado e barra sustentadora de madeira maciça torneada.",
    category: "home-decoration",
    price: 59.99,
    discountPercentage: 10.41,
    rating: 4.65,
    stock: 47,
    tags: ["decoracao", "balanco", "macrame", "nordico"],
    brand: "Hygge Home",
    sku: "HOM-BRD-DEC-043",
    weight: 4,
    dimensions: { width: 60, height: 120, depth: 60 },
    warrantyInformation: "Garantia de 2 anos para cordas e sustentação.",
    shippingInformation: "Acompanha kit de fixação com mosquetão em inox.",
    availabilityStatus: "Em estoque",
    returnPolicy: "30 dias de devolução.",
    minimumOrderQuantity: 1,
    thumbnail:
      "https://images.unsplash.com/photo-1544457070-4cd773b4d71e?auto=format&fit=crop&w=1000&q=80",
    images: [
      "https://images.unsplash.com/photo-1544457070-4cd773b4d71e?auto=format&fit=crop&w=1000&q=80",
    ],
    reviews: [
      {
        rating: 4.8,
        comment: "Peça artesanal lindíssima, super resistente e aconchegante.",
        date: "2026-02-12",
        reviewerName: "Astrid Lindgren",
        reviewerEmail: "astrid@scandidesign.se",
      },
    ],
  },
  44: {
    id: 44,
    title: "Conjunto de Porta-Retratos em Madeira Nórdica",
    description:
      "Galeria de parede com molduras minimalistas em carvalho claro com vidro antirreflexo e paspatur branco neutro. Ideal para composições fotográficas elegantes.",
    category: "home-decoration",
    price: 29.99,
    discountPercentage: 14.87,
    rating: 4.75,
    stock: 77,
    tags: ["decoracao", "porta-retratos", "parede", "nordico"],
    brand: "Hygge Home",
    sku: "HOM-BRD-FAM-044",
    weight: 1,
    dimensions: { width: 40, height: 50, depth: 3 },
    warrantyInformation: "1 ano de garantia.",
    shippingInformation:
      "Envio protegido com cantoneiras de papelão reforçado.",
    availabilityStatus: "Em estoque",
    returnPolicy: "30 dias de devolução.",
    minimumOrderQuantity: 1,
    thumbnail:
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80",
    images: [
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80",
    ],
    reviews: [
      {
        rating: 5,
        comment: "Molduras leves com carvalho de tonalidade natural impecável.",
        date: "2026-03-01",
        reviewerName: "Henrik Møller",
        reviewerEmail: "henrik@nordichome.dk",
      },
    ],
  },
  45: {
    id: 45,
    title: "Planta Fiddle Leaf Fig em Vaso Escandinavo",
    description:
      "Planta ornamental de interior com folhagem verde larga perene em vaso decorativo com acabamento em cimento texturizado cinza ardósia.",
    category: "home-decoration",
    price: 39.99,
    discountPercentage: 7.46,
    rating: 4.8,
    stock: 28,
    tags: ["decoracao", "planta", "vaso", "nordico"],
    brand: "Hygge Home",
    sku: "HOM-BRD-HOU-045",
    weight: 8,
    dimensions: { width: 30, height: 75, depth: 30 },
    warrantyInformation: "Garantia de integridade no transporte.",
    shippingInformation:
      "Embalagem especial climatizada e com suporte de raiz.",
    availabilityStatus: "Em estoque",
    returnPolicy: "Troca facilitada em até 7 dias.",
    minimumOrderQuantity: 1,
    thumbnail:
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1000&q=80",
    images: [
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1000&q=80",
    ],
    reviews: [
      {
        rating: 4.9,
        comment: "Chegou saudável e o vaso tem textura sofisticada.",
        date: "2026-02-25",
        reviewerName: "Kari Nieminen",
        reviewerEmail: "kari@helsinki.fi",
      },
    ],
  },
  46: {
    id: 46,
    title: "Vaso Canelado em Cerâmica Fosca Artesanal",
    description:
      "Vaso escultural modelado em cerâmica terracota com pintura eletrostática esbranquiçada e textura ranhurada à mão. Peça de centro para mesas e estantes.",
    category: "home-decoration",
    price: 14.99,
    discountPercentage: 6.84,
    rating: 4.6,
    stock: 59,
    tags: ["decoracao", "ceramica", "vaso", "nordico"],
    brand: "Hygge Home",
    sku: "HOM-BRD-PLA-046",
    weight: 3,
    dimensions: { width: 20, height: 25, depth: 20 },
    warrantyInformation: "1 ano contra defeitos de cerâmica.",
    shippingInformation: "Embalagem tripla com plástico bolha biodegradável.",
    availabilityStatus: "Em estoque",
    returnPolicy: "30 dias de devolução.",
    minimumOrderQuantity: 1,
    thumbnail:
      "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1000&q=80",
    images: [
      "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1000&q=80",
    ],
    reviews: [
      {
        rating: 4.6,
        comment: "Formato orgânico belíssimo e acabamento fosco elegante.",
        date: "2026-01-15",
        reviewerName: "Freja Olsen",
        reviewerEmail: "freja@copenhagen.dk",
      },
    ],
  },
  47: {
    id: 47,
    title: "Luminária de Mesa Boreal em Metal e Vidro Opalino",
    description:
      "Luminária de mesa com cúpula de vidro leitoso opalino e haste em metal escovado fosco. Proporciona iluminação quente e suave perfeita para leitura no ambiente Hygge.",
    category: "home-decoration",
    price: 49.99,
    discountPercentage: 7.09,
    rating: 4.85,
    stock: 9,
    tags: ["decoracao", "iluminacao", "luminaria", "nordico"],
    brand: "Lumina Nordic",
    sku: "HOM-BRD-TAB-047",
    weight: 4,
    dimensions: { width: 25, height: 45, depth: 25 },
    warrantyInformation: "2 anos de garantia para o circuito elétrico.",
    shippingInformation: "Envio rápido em caixa com berço de espuma.",
    availabilityStatus: "Em estoque",
    returnPolicy: "30 dias de devolução.",
    minimumOrderQuantity: 1,
    thumbnail:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80",
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80",
    ],
    reviews: [
      {
        rating: 5,
        comment:
          "Iluminação difusa de altíssimo requinte. Cria o clima Hygge perfeito.",
        date: "2026-02-28",
        reviewerName: "Thorsten Vang",
        reviewerEmail: "thorsten@bergen.no",
      },
    ],
  },
};

const ALL_LOCAL_FALLBACK_PRODUCTS: Product[] = [
  ...Object.values(DUMMY_FALLBACK_PRODUCTS),
  ...COMPLEMENTARY_PRODUCTS,
];

// ─── Funções internas de normalização ──────────────────────────────────────────

/**
 * Localiza os produtos nativos da DummyJSON para Português (Brasil),
 * substitui suas imagens por 1 fotografia de interior exata e assegura
 * que a nota de avaliação seja rigorosamente superior a 4.5.
 */
function sanitizeDummyProduct(raw: unknown): Product | null {
  // Valida o produto cru com Zod antes de qualquer transformação
  const parsed = productSchema.safeParse(raw);

  if (!parsed.success) {
    // Produto inválido: descarta silenciosamente (não quebra o catálogo inteiro)
    if (import.meta.env.DEV) {
      console.warn(
        "[productService] Produto inválido descartado:",
        parsed.error.flatten(),
      );
    }
    return null;
  }

  const p = parsed.data;
  const fallback = DUMMY_FALLBACK_PRODUCTS[p.id];
  const localization = DUMMY_PRODUCT_LOCALIZATION[p.id];

  if (!localization) {
    if (fallback) return fallback;
    return {
      ...p,
      rating: Math.max(4.6, Number(p.rating?.toFixed(1) ?? 4.7)),
    };
  }

  const guaranteedRating = Math.max(4.6, localization.rating);

  return {
    ...p,
    title: localization.title,
    description: localization.description,
    thumbnail: localization.image,
    images: [localization.image],
    rating: guaranteedRating,
    warrantyInformation:
      localization.warrantyInformation ?? p.warrantyInformation,
    shippingInformation:
      localization.shippingInformation ?? p.shippingInformation,
    availabilityStatus: localization.availabilityStatus ?? p.availabilityStatus,
    returnPolicy: localization.returnPolicy ?? p.returnPolicy,
    reviews: fallback?.reviews ?? [
      {
        rating: 5,
        comment:
          "Design e acabamento excepcionais. Peça de referência no estilo nórdico.",
        date: "2026-02-20",
        reviewerName: "Henrik Møller",
        reviewerEmail: "henrik@nordichome.dk",
      },
      {
        rating: 4.8,
        comment:
          "Material de altíssima qualidade e proporções perfeitas para o ambiente.",
        date: "2026-03-04",
        reviewerName: "Astrid Lindgren",
        reviewerEmail: "astrid@scandidesign.se",
      },
    ],
  };
}

// ─── getProducts — busca validada com Zod ───────────────────────────────────────

/**
 * Busca os produtos de móveis e decoração na DummyJSON.
 *
 * Usa `.safeParse()` do Zod para validar cada payload antes de repassar aos
 * componentes. Retorna um discriminated union que representa os três estados
 * possíveis: `loading`, `success` e `error`.
 *
 * @param categoryFilter  'all' | 'furniture' | 'home-decoration' | 'textiles'
 * @param signal          AbortSignal para cancelamento (ex.: useEffect cleanup)
 */
export async function getProducts(
  categoryFilter: "all" | "furniture" | "home-decoration" | "textiles" = "all",
  signal?: AbortSignal,
): Promise<ServiceResult<Product[]>> {
  try {
    // 1. Disparo paralelo das duas categorias da DummyJSON
    const [furnitureRes, decorRes] = await Promise.all([
      api.get<unknown>("/products/category/furniture", { signal }),
      api.get<unknown>("/products/category/home-decoration", { signal }),
    ]);

    // 2. Validação com Zod — .safeParse() nunca lança, apenas retorna { success, data/error }
    const furnitureParsed = productsResponseSchema.safeParse(furnitureRes.data);
    const decorParsed = productsResponseSchema.safeParse(decorRes.data);

    // 3. Coleta de erros de validação (registra no console em dev, não quebra o app)
    const validationWarnings: string[] = [];

    if (!furnitureParsed.success) {
      validationWarnings.push(`[furniture] ${furnitureParsed.error.message}`);
    }
    if (!decorParsed.success) {
      validationWarnings.push(`[home-decoration] ${decorParsed.error.message}`);
    }
    if (validationWarnings.length > 0 && import.meta.env.DEV) {
      console.warn("[getProducts] Falha na validação Zod:", validationWarnings);
    }

    // 4. Sanitização individual (localização + imagens)
    const dummyFurniture: Product[] = furnitureParsed.success
      ? (furnitureParsed.data.products
          .map(sanitizeDummyProduct)
          .filter(Boolean) as Product[])
      : Object.values(DUMMY_FALLBACK_PRODUCTS).filter(
          (p) => p.category === "furniture",
        );

    const dummyDecor: Product[] = decorParsed.success
      ? (decorParsed.data.products
          .map(sanitizeDummyProduct)
          .filter(Boolean) as Product[])
      : Object.values(DUMMY_FALLBACK_PRODUCTS).filter(
          (p) => p.category === "home-decoration",
        );

    // 5. Concatenação com produtos complementares locais
    const allThematicProducts: Product[] = [
      ...dummyFurniture,
      ...COMPLEMENTARY_PRODUCTS.filter((p) => p.category === "furniture"),
      ...dummyDecor,
      ...COMPLEMENTARY_PRODUCTS.filter((p) => p.category === "home-decoration"),
      ...COMPLEMENTARY_PRODUCTS.filter((p) => p.category === "textiles"),
    ];

    // 6. Filtro por categoria
    const filtered =
      categoryFilter === "all"
        ? allThematicProducts
        : allThematicProducts.filter((p) => p.category === categoryFilter);

    return { status: "success", data: filtered };
  } catch (error) {
    // Cancelamento via AbortController — não é um erro real
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error; // Repropaga para que o useEffect trate corretamente
    }

    if (import.meta.env.DEV) {
      console.warn(
        "[getProducts] Usando catálogo completo local de fallback devido a erro de rede:",
        error,
      );
    }

    // Fallback completo com todos os produtos locais e localizados
    const fallback =
      categoryFilter === "all"
        ? ALL_LOCAL_FALLBACK_PRODUCTS
        : ALL_LOCAL_FALLBACK_PRODUCTS.filter(
            (p) => p.category === categoryFilter,
          );

    return { status: "success", data: fallback };
  }
}

// ─── fetchHomeDesignProducts — wrapper de compatibilidade retroativa ────────────

/**
 * Compatibilidade com o código existente nos componentes.
 * Internamente usa `getProducts` mas mantém a assinatura original
 * (retorna `Product[]` direto, lançando em caso de erro).
 */
export async function fetchHomeDesignProducts(
  categoryFilter = "all",
  signal?: AbortSignal,
): Promise<Product[]> {
  const result = await getProducts(
    categoryFilter as "all" | "furniture" | "home-decoration" | "textiles",
    signal,
  );

  if (result.status === "success") {
    return result.data;
  }

  return categoryFilter === "all"
    ? ALL_LOCAL_FALLBACK_PRODUCTS
    : ALL_LOCAL_FALLBACK_PRODUCTS.filter((p) => p.category === categoryFilter);
}

// ─── fetchProductById ───────────────────────────────────────────────────────────

/**
 * Obtém os detalhes de um produto específico pelo ID.
 * Valida a resposta com Zod antes de retornar e conta com fallback instantâneo.
 */
export async function fetchProductById(
  id: string | number,
  signal?: AbortSignal,
): Promise<Product> {
  const numericId = Number(id);

  // 1. Verifica nos complementares locais primeiro (sem chamada de rede)
  const complementary = COMPLEMENTARY_PRODUCTS.find((p) => p.id === numericId);
  if (complementary) {
    return complementary;
  }

  // 2. Fallback local para produtos do catálogo padrão
  const localDummy = DUMMY_FALLBACK_PRODUCTS[numericId];

  try {
    // 3. Busca na DummyJSON via Axios
    const response = await api.get<unknown>(`/products/${id}`, { signal });

    // 4. Valida com Zod
    const parsed = productSchema.safeParse(response.data);

    if (parsed.success) {
      const sanitized = sanitizeDummyProduct(parsed.data);
      if (sanitized) {
        return sanitized;
      }
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    if (import.meta.env.DEV) {
      console.warn(
        `[fetchProductById] Fallback local ativado para o produto #${id}:`,
        error,
      );
    }
  }

  // 5. Se a requisição falhar ou retornar dados inválidos, recorre ao fallback local
  if (localDummy) {
    return localDummy;
  }

  // 6. Procura no catálogo geral local
  const anyLocal = ALL_LOCAL_FALLBACK_PRODUCTS.find((p) => p.id === numericId);
  if (anyLocal) {
    return anyLocal;
  }

  throw new Error(`Produto #${id} não pôde ser encontrado no catálogo.`);
}

// ─── Re-exports de tipos ────────────────────────────────────────────────────────

export type { Product, ProductsResponse };

// Static source content only, verified against the authorized ZIP. No production records.
import type {ProjectTemplate} from "../../shared/projects/templates.ts";
export const templateSeeds: {key:string;sourceKind:string;sourcePath:string;sourceSHA256:string;notes:string;data:ProjectTemplate}[] = [
  {
    "key": "legacy-software",
    "sourceKind": "legacy-default",
    "sourcePath": "server/db.ts:seedDefaultTemplates",
    "sourceSHA256": "cbdeb419e0641b3311533fbdbbfc6b64a7e9cbe38b736c0d67490c877d1280bb",
    "notes": "Conteúdo estático efetivamente encontrado no código; durações ausentes de tarefas não foram inventadas. Não executa ações nomeadas nas atividades.",
    "data": {
      "name": "Desenvolvimento de Software",
      "description": "Template para projetos de desenvolvimento de software com fases típicas de um ciclo de vida ágil.",
      "category": "software",
      "methodology": "scrum",
      "phases": [
        {
          "id": "p1",
          "name": "Descoberta e Planejamento",
          "description": "Levantamento de requisitos e planejamento inicial",
          "order": 1,
          "color": "#F7941D",
          "durationDays": 7,
          "startDay": null
        },
        {
          "id": "p2",
          "name": "Design e Arquitetura",
          "description": "Design de interface e arquitetura técnica",
          "order": 2,
          "color": "#2D6A9F",
          "durationDays": 10,
          "startDay": null
        },
        {
          "id": "p3",
          "name": "Desenvolvimento",
          "description": "Implementação das funcionalidades",
          "order": 3,
          "color": "#10B981",
          "durationDays": 21,
          "startDay": null
        },
        {
          "id": "p4",
          "name": "Testes e QA",
          "description": "Testes de qualidade e correção de bugs",
          "order": 4,
          "color": "#8B5CF6",
          "durationDays": 7,
          "startDay": null
        },
        {
          "id": "p5",
          "name": "Deploy e Lançamento",
          "description": "Implantação em produção e lançamento",
          "order": 5,
          "color": "#EF4444",
          "durationDays": 3,
          "startDay": null
        }
      ],
      "tasks": [
        {
          "id": "t001",
          "phaseId": "p1",
          "title": "Reunião de kickoff",
          "description": "",
          "priority": "high",
          "order": 0,
          "estimatedHours": null,
          "storyPoints": 2,
          "durationDays": null,
          "startDay": null,
          "isMilestone": false
        },
        {
          "id": "t002",
          "phaseId": "p1",
          "title": "Levantamento de requisitos",
          "description": "",
          "priority": "high",
          "order": 1,
          "estimatedHours": null,
          "storyPoints": 5,
          "durationDays": null,
          "startDay": null,
          "isMilestone": false
        },
        {
          "id": "t003",
          "phaseId": "p1",
          "title": "Definição de escopo",
          "description": "",
          "priority": "high",
          "order": 2,
          "estimatedHours": null,
          "storyPoints": 3,
          "durationDays": null,
          "startDay": null,
          "isMilestone": false
        },
        {
          "id": "t004",
          "phaseId": "p2",
          "title": "Wireframes e protótipos",
          "description": "",
          "priority": "medium",
          "order": 3,
          "estimatedHours": null,
          "storyPoints": 5,
          "durationDays": null,
          "startDay": null,
          "isMilestone": false
        },
        {
          "id": "t005",
          "phaseId": "p2",
          "title": "Arquitetura do sistema",
          "description": "",
          "priority": "high",
          "order": 4,
          "estimatedHours": null,
          "storyPoints": 8,
          "durationDays": null,
          "startDay": null,
          "isMilestone": false
        },
        {
          "id": "t006",
          "phaseId": "p3",
          "title": "Setup do ambiente",
          "description": "",
          "priority": "high",
          "order": 5,
          "estimatedHours": null,
          "storyPoints": 3,
          "durationDays": null,
          "startDay": null,
          "isMilestone": false
        },
        {
          "id": "t007",
          "phaseId": "p3",
          "title": "Desenvolvimento do backend",
          "description": "",
          "priority": "high",
          "order": 6,
          "estimatedHours": null,
          "storyPoints": 13,
          "durationDays": null,
          "startDay": null,
          "isMilestone": false
        },
        {
          "id": "t008",
          "phaseId": "p3",
          "title": "Desenvolvimento do frontend",
          "description": "",
          "priority": "high",
          "order": 7,
          "estimatedHours": null,
          "storyPoints": 13,
          "durationDays": null,
          "startDay": null,
          "isMilestone": false
        },
        {
          "id": "t009",
          "phaseId": "p4",
          "title": "Testes unitários",
          "description": "",
          "priority": "medium",
          "order": 8,
          "estimatedHours": null,
          "storyPoints": 5,
          "durationDays": null,
          "startDay": null,
          "isMilestone": false
        },
        {
          "id": "t010",
          "phaseId": "p4",
          "title": "Testes de integração",
          "description": "",
          "priority": "medium",
          "order": 9,
          "estimatedHours": null,
          "storyPoints": 5,
          "durationDays": null,
          "startDay": null,
          "isMilestone": false
        },
        {
          "id": "t011",
          "phaseId": "p5",
          "title": "Deploy em staging",
          "description": "",
          "priority": "high",
          "order": 10,
          "estimatedHours": null,
          "storyPoints": 2,
          "durationDays": null,
          "startDay": null,
          "isMilestone": false
        },
        {
          "id": "t012",
          "phaseId": "p5",
          "title": "Deploy em produção",
          "description": "",
          "priority": "urgent",
          "order": 11,
          "estimatedHours": null,
          "storyPoints": 3,
          "durationDays": null,
          "startDay": null,
          "isMilestone": false
        }
      ],
      "dependencies": []
    }
  },
  {
    "key": "legacy-marketing",
    "sourceKind": "legacy-default",
    "sourcePath": "server/db.ts:seedDefaultTemplates",
    "sourceSHA256": "cbdeb419e0641b3311533fbdbbfc6b64a7e9cbe38b736c0d67490c877d1280bb",
    "notes": "Conteúdo estático efetivamente encontrado no código; durações ausentes de tarefas não foram inventadas. Não executa ações nomeadas nas atividades.",
    "data": {
      "name": "Campanha de Marketing",
      "description": "Template para campanhas de marketing digital com fases de planejamento, execução e análise.",
      "category": "marketing",
      "methodology": "kanban",
      "phases": [
        {
          "id": "p1",
          "name": "Estratégia",
          "description": "Definição de objetivos e estratégia",
          "order": 1,
          "color": "#F7941D",
          "durationDays": 5,
          "startDay": null
        },
        {
          "id": "p2",
          "name": "Criação de Conteúdo",
          "description": "Produção de materiais e conteúdo",
          "order": 2,
          "color": "#2D6A9F",
          "durationDays": 10,
          "startDay": null
        },
        {
          "id": "p3",
          "name": "Execução",
          "description": "Lançamento e gestão da campanha",
          "order": 3,
          "color": "#10B981",
          "durationDays": 14,
          "startDay": null
        },
        {
          "id": "p4",
          "name": "Análise",
          "description": "Métricas e relatórios de resultados",
          "order": 4,
          "color": "#8B5CF6",
          "durationDays": 5,
          "startDay": null
        }
      ],
      "tasks": [
        {
          "id": "t001",
          "phaseId": "p1",
          "title": "Definir público-alvo",
          "description": "",
          "priority": "high",
          "order": 0,
          "estimatedHours": null,
          "storyPoints": null,
          "durationDays": null,
          "startDay": null,
          "isMilestone": false
        },
        {
          "id": "t002",
          "phaseId": "p1",
          "title": "Definir KPIs",
          "description": "",
          "priority": "high",
          "order": 1,
          "estimatedHours": null,
          "storyPoints": null,
          "durationDays": null,
          "startDay": null,
          "isMilestone": false
        },
        {
          "id": "t003",
          "phaseId": "p2",
          "title": "Criar copies",
          "description": "",
          "priority": "medium",
          "order": 2,
          "estimatedHours": null,
          "storyPoints": null,
          "durationDays": null,
          "startDay": null,
          "isMilestone": false
        },
        {
          "id": "t004",
          "phaseId": "p2",
          "title": "Design de peças",
          "description": "",
          "priority": "medium",
          "order": 3,
          "estimatedHours": null,
          "storyPoints": null,
          "durationDays": null,
          "startDay": null,
          "isMilestone": false
        },
        {
          "id": "t005",
          "phaseId": "p3",
          "title": "Configurar anúncios",
          "description": "",
          "priority": "high",
          "order": 4,
          "estimatedHours": null,
          "storyPoints": null,
          "durationDays": null,
          "startDay": null,
          "isMilestone": false
        },
        {
          "id": "t006",
          "phaseId": "p3",
          "title": "Monitorar performance",
          "description": "",
          "priority": "medium",
          "order": 5,
          "estimatedHours": null,
          "storyPoints": null,
          "durationDays": null,
          "startDay": null,
          "isMilestone": false
        },
        {
          "id": "t007",
          "phaseId": "p4",
          "title": "Coletar métricas",
          "description": "",
          "priority": "medium",
          "order": 6,
          "estimatedHours": null,
          "storyPoints": null,
          "durationDays": null,
          "startDay": null,
          "isMilestone": false
        },
        {
          "id": "t008",
          "phaseId": "p4",
          "title": "Relatório final",
          "description": "",
          "priority": "high",
          "order": 7,
          "estimatedHours": null,
          "storyPoints": null,
          "durationDays": null,
          "startDay": null,
          "isMilestone": false
        }
      ],
      "dependencies": []
    }
  },
  {
    "key": "legacy-construction",
    "sourceKind": "legacy-default",
    "sourcePath": "server/db.ts:seedDefaultTemplates",
    "sourceSHA256": "cbdeb419e0641b3311533fbdbbfc6b64a7e9cbe38b736c0d67490c877d1280bb",
    "notes": "Conteúdo estático efetivamente encontrado no código; durações ausentes de tarefas não foram inventadas. Não executa ações nomeadas nas atividades.",
    "data": {
      "name": "Projeto de Construção",
      "description": "Template para projetos de construção civil com fases de planejamento, execução e entrega.",
      "category": "construction",
      "methodology": "kanban",
      "phases": [
        {
          "id": "p1",
          "name": "Projeto e Aprovações",
          "description": "Elaboração de projetos e aprovações legais",
          "order": 1,
          "color": "#F7941D",
          "durationDays": 30,
          "startDay": null
        },
        {
          "id": "p2",
          "name": "Fundação",
          "description": "Preparação do terreno e fundação",
          "order": 2,
          "color": "#8B2332",
          "durationDays": 15,
          "startDay": null
        },
        {
          "id": "p3",
          "name": "Estrutura",
          "description": "Construção da estrutura principal",
          "order": 3,
          "color": "#2D6A9F",
          "durationDays": 45,
          "startDay": null
        },
        {
          "id": "p4",
          "name": "Acabamento",
          "description": "Acabamentos e instalações",
          "order": 4,
          "color": "#10B981",
          "durationDays": 30,
          "startDay": null
        },
        {
          "id": "p5",
          "name": "Entrega",
          "description": "Vistoria final e entrega",
          "order": 5,
          "color": "#FCAF17",
          "durationDays": 7,
          "startDay": null
        }
      ],
      "tasks": [
        {
          "id": "t001",
          "phaseId": "p1",
          "title": "Projeto arquitetônico",
          "description": "",
          "priority": "high",
          "order": 0,
          "estimatedHours": null,
          "storyPoints": null,
          "durationDays": null,
          "startDay": null,
          "isMilestone": false
        },
        {
          "id": "t002",
          "phaseId": "p1",
          "title": "Projeto estrutural",
          "description": "",
          "priority": "high",
          "order": 1,
          "estimatedHours": null,
          "storyPoints": null,
          "durationDays": null,
          "startDay": null,
          "isMilestone": false
        },
        {
          "id": "t003",
          "phaseId": "p1",
          "title": "Aprovação na prefeitura",
          "description": "",
          "priority": "urgent",
          "order": 2,
          "estimatedHours": null,
          "storyPoints": null,
          "durationDays": null,
          "startDay": null,
          "isMilestone": false
        },
        {
          "id": "t004",
          "phaseId": "p2",
          "title": "Limpeza do terreno",
          "description": "",
          "priority": "medium",
          "order": 3,
          "estimatedHours": null,
          "storyPoints": null,
          "durationDays": null,
          "startDay": null,
          "isMilestone": false
        },
        {
          "id": "t005",
          "phaseId": "p2",
          "title": "Escavação",
          "description": "",
          "priority": "high",
          "order": 4,
          "estimatedHours": null,
          "storyPoints": null,
          "durationDays": null,
          "startDay": null,
          "isMilestone": false
        },
        {
          "id": "t006",
          "phaseId": "p3",
          "title": "Pilares e vigas",
          "description": "",
          "priority": "high",
          "order": 5,
          "estimatedHours": null,
          "storyPoints": null,
          "durationDays": null,
          "startDay": null,
          "isMilestone": false
        },
        {
          "id": "t007",
          "phaseId": "p3",
          "title": "Lajes",
          "description": "",
          "priority": "high",
          "order": 6,
          "estimatedHours": null,
          "storyPoints": null,
          "durationDays": null,
          "startDay": null,
          "isMilestone": false
        },
        {
          "id": "t008",
          "phaseId": "p4",
          "title": "Instalações elétricas",
          "description": "",
          "priority": "high",
          "order": 7,
          "estimatedHours": null,
          "storyPoints": null,
          "durationDays": null,
          "startDay": null,
          "isMilestone": false
        },
        {
          "id": "t009",
          "phaseId": "p4",
          "title": "Instalações hidráulicas",
          "description": "",
          "priority": "high",
          "order": 8,
          "estimatedHours": null,
          "storyPoints": null,
          "durationDays": null,
          "startDay": null,
          "isMilestone": false
        },
        {
          "id": "t010",
          "phaseId": "p4",
          "title": "Pintura",
          "description": "",
          "priority": "medium",
          "order": 9,
          "estimatedHours": null,
          "storyPoints": null,
          "durationDays": null,
          "startDay": null,
          "isMilestone": false
        },
        {
          "id": "t011",
          "phaseId": "p5",
          "title": "Vistoria técnica",
          "description": "",
          "priority": "high",
          "order": 10,
          "estimatedHours": null,
          "storyPoints": null,
          "durationDays": null,
          "startDay": null,
          "isMilestone": false
        },
        {
          "id": "t012",
          "phaseId": "p5",
          "title": "Habite-se",
          "description": "",
          "priority": "urgent",
          "order": 11,
          "estimatedHours": null,
          "storyPoints": null,
          "durationDays": null,
          "startDay": null,
          "isMilestone": false
        }
      ],
      "dependencies": []
    }
  },
  {
    "key": "reference-arqueologia-licenciamento",
    "sourceKind": "legacy-test-reference",
    "sourcePath": "server/templates-arqueologia.test.ts",
    "sourceSHA256": "8c12c04118bcce9c9c6d95aee634c508725950a372740693cd0804627f231766",
    "notes": "REFERÊNCIA PARCIAL extraída de literais de testes, não de catálogo homologado ou backup. Fases/tarefas sem relações/durações fornecidas permanecem sem estimativa. Revisar antes de aprovar; nenhum prazo de IPHAN ou marco financeiro foi presumido. Esboços sem tarefas permanecem sem tarefas, até cadastro autorizado.",
    "data": {
      "name": "Licenciamento Arqueológico Completo — referência parcial",
      "description": "Esboço de planejamento a revisar; não comprova o cadastro completo do legado.",
      "category": "arqueologia",
      "methodology": "kanban",
      "phases": [
        {
          "id": "p1",
          "name": "TERMO DE REFERÊNCIA",
          "description": "Referência de teste; conteúdo a revisar.",
          "color": "#8B2332",
          "order": 0,
          "durationDays": null,
          "startDay": null
        },
        {
          "id": "p2",
          "name": "PAPIPA E RAPIPA",
          "description": "Referência de teste; conteúdo a revisar.",
          "color": "#8B2332",
          "order": 1,
          "durationDays": null,
          "startDay": null
        },
        {
          "id": "p3",
          "name": "PAIPA E RAIPA",
          "description": "Referência de teste; conteúdo a revisar.",
          "color": "#8B2332",
          "order": 2,
          "durationDays": null,
          "startDay": null
        },
        {
          "id": "p4",
          "name": "PGPA",
          "description": "Referência de teste; conteúdo a revisar.",
          "color": "#8B2332",
          "order": 3,
          "durationDays": null,
          "startDay": null
        }
      ],
      "tasks": [
        {
          "id": "t001",
          "phaseId": null,
          "title": "Elaboração do geo",
          "description": "Referência textual sem duração nem vínculo de fase comprovados.",
          "priority": "medium",
          "order": 0,
          "estimatedHours": null,
          "storyPoints": null,
          "durationDays": null,
          "startDay": null,
          "isMilestone": false
        },
        {
          "id": "t002",
          "phaseId": null,
          "title": "Elaboração da equipe técnica",
          "description": "Referência textual sem duração nem vínculo de fase comprovados.",
          "priority": "medium",
          "order": 1,
          "estimatedHours": null,
          "storyPoints": null,
          "durationDays": null,
          "startDay": null,
          "isMilestone": false
        },
        {
          "id": "t003",
          "phaseId": null,
          "title": "Elaboração e assinatura do endosso financeiro",
          "description": "Referência textual sem duração nem vínculo de fase comprovados.",
          "priority": "medium",
          "order": 2,
          "estimatedHours": null,
          "storyPoints": null,
          "durationDays": null,
          "startDay": null,
          "isMilestone": false
        },
        {
          "id": "t004",
          "phaseId": null,
          "title": "Aquisição do endosso Institucional",
          "description": "Referência textual sem duração nem vínculo de fase comprovados.",
          "priority": "medium",
          "order": 3,
          "estimatedHours": null,
          "storyPoints": null,
          "durationDays": null,
          "startDay": null,
          "isMilestone": false
        },
        {
          "id": "t005",
          "phaseId": null,
          "title": "Elaboração do projeto de pesquisa de arqueologia",
          "description": "Referência textual sem duração nem vínculo de fase comprovados.",
          "priority": "medium",
          "order": 4,
          "estimatedHours": null,
          "storyPoints": null,
          "durationDays": null,
          "startDay": null,
          "isMilestone": false
        },
        {
          "id": "t006",
          "phaseId": null,
          "title": "Revisão do cliente",
          "description": "Referência textual sem duração nem vínculo de fase comprovados.",
          "priority": "medium",
          "order": 5,
          "estimatedHours": null,
          "storyPoints": null,
          "durationDays": null,
          "startDay": null,
          "isMilestone": false
        },
        {
          "id": "t007",
          "phaseId": null,
          "title": "Revisão do Time Arqueo",
          "description": "Referência textual sem duração nem vínculo de fase comprovados.",
          "priority": "medium",
          "order": 6,
          "estimatedHours": null,
          "storyPoints": null,
          "durationDays": null,
          "startDay": null,
          "isMilestone": false
        },
        {
          "id": "t008",
          "phaseId": null,
          "title": "Protocolo IPHAN",
          "description": "Referência textual sem duração nem vínculo de fase comprovados.",
          "priority": "medium",
          "order": 7,
          "estimatedHours": null,
          "storyPoints": null,
          "durationDays": null,
          "startDay": null,
          "isMilestone": false
        },
        {
          "id": "t009",
          "phaseId": null,
          "title": "Análise do IPHAN",
          "description": "Referência textual sem duração nem vínculo de fase comprovados.",
          "priority": "medium",
          "order": 8,
          "estimatedHours": null,
          "storyPoints": null,
          "durationDays": null,
          "startDay": null,
          "isMilestone": false
        },
        {
          "id": "t010",
          "phaseId": null,
          "title": "Publicação de portaria",
          "description": "Referência textual sem duração nem vínculo de fase comprovados.",
          "priority": "medium",
          "order": 9,
          "estimatedHours": null,
          "storyPoints": null,
          "durationDays": null,
          "startDay": null,
          "isMilestone": false
        }
      ],
      "dependencies": []
    }
  },
  {
    "key": "reference-arqueologia-papipa",
    "sourceKind": "legacy-test-reference",
    "sourcePath": "server/templates-arqueologia.test.ts",
    "sourceSHA256": "8c12c04118bcce9c9c6d95aee634c508725950a372740693cd0804627f231766",
    "notes": "REFERÊNCIA PARCIAL extraída de literais de testes, não de catálogo homologado ou backup. Fases/tarefas sem relações/durações fornecidas permanecem sem estimativa. Revisar antes de aprovar; nenhum prazo de IPHAN ou marco financeiro foi presumido. Esboços sem tarefas permanecem sem tarefas, até cadastro autorizado.",
    "data": {
      "name": "PAPIPA — referência parcial",
      "description": "Esboço de planejamento a revisar; não comprova o cadastro completo do legado.",
      "category": "arqueologia",
      "methodology": "kanban",
      "phases": [
        {
          "id": "p1",
          "name": "ELABORAÇÃO DO PAPIPA",
          "description": "Referência de teste; conteúdo a revisar.",
          "color": "#8B2332",
          "order": 0,
          "durationDays": null,
          "startDay": null
        },
        {
          "id": "p2",
          "name": "ANÁLISE IPHAN",
          "description": "Referência de teste; conteúdo a revisar.",
          "color": "#8B2332",
          "order": 1,
          "durationDays": null,
          "startDay": null
        },
        {
          "id": "p3",
          "name": "ETAPA DE CAMPO",
          "description": "Referência de teste; conteúdo a revisar.",
          "color": "#8B2332",
          "order": 2,
          "durationDays": null,
          "startDay": null
        },
        {
          "id": "p4",
          "name": "RELATÓRIO",
          "description": "Referência de teste; conteúdo a revisar.",
          "color": "#8B2332",
          "order": 3,
          "durationDays": null,
          "startDay": null
        }
      ],
      "tasks": [],
      "dependencies": []
    }
  },
  {
    "key": "reference-arqueologia-monitoramento",
    "sourceKind": "legacy-test-reference",
    "sourcePath": "server/templates-arqueologia.test.ts",
    "sourceSHA256": "8c12c04118bcce9c9c6d95aee634c508725950a372740693cd0804627f231766",
    "notes": "REFERÊNCIA PARCIAL extraída de literais de testes, não de catálogo homologado ou backup. Fases/tarefas sem relações/durações fornecidas permanecem sem estimativa. Revisar antes de aprovar; nenhum prazo de IPHAN ou marco financeiro foi presumido. Esboços sem tarefas permanecem sem tarefas, até cadastro autorizado.",
    "data": {
      "name": "Monitoramento Arqueológico — referência parcial",
      "description": "Esboço de planejamento a revisar; não comprova o cadastro completo do legado.",
      "category": "arqueologia",
      "methodology": "kanban",
      "phases": [
        {
          "id": "p1",
          "name": "MOBILIZAÇÃO",
          "description": "Referência de teste; conteúdo a revisar.",
          "color": "#8B2332",
          "order": 0,
          "durationDays": null,
          "startDay": null
        },
        {
          "id": "p2",
          "name": "MONITORAMENTO",
          "description": "Referência de teste; conteúdo a revisar.",
          "color": "#8B2332",
          "order": 1,
          "durationDays": null,
          "startDay": null
        },
        {
          "id": "p3",
          "name": "RELATÓRIO FINAL",
          "description": "Referência de teste; conteúdo a revisar.",
          "color": "#8B2332",
          "order": 2,
          "durationDays": null,
          "startDay": null
        }
      ],
      "tasks": [],
      "dependencies": []
    }
  }
];

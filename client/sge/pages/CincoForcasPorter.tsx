import { useLocation } from "../../strategy/navigation.tsx";
import { ArrowLeft, Building2, Lightbulb } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card.tsx";
import { Button } from "../components/ui/button.tsx";
import { Textarea } from "../components/ui/textarea.tsx";
import { trpc } from "../../strategy/legacy.tsx";
import {useStrategy,useDocument,ReadOnly} from "../../strategy/context.tsx";

export default function CincoForcasPorter() {
  const ctx=useStrategy();
  const empresaId=ctx.data.plan.scope_id;
  const [, setLocation] = useLocation();

  const { data: empresas } = trpc.empresas.list.useQuery();
  const empresa = empresas?.find((e) => e.id === empresaId);

  const {value:formData,setValue:setFormData,save,status}=useDocument('porter-full',{
    ameacaNovoEntrantes: "",
    intensidadeNovoEntrantes: "media",
    poderFornecedores: "",
    intensidadeFornecedores: "media",
    poderClientes: "",
    intensidadeClientes: "media",
    ameacaSubstitutos: "",
    intensidadeSubstitutos: "media",
    rivalidadeCompetidores: "",
    intensidadeRivalidade: "media",
    observacoes: "",
  });

  const forcas = [
    { 
      key: "ameacaNovoEntrantes", 
      label: "Ameaça de Novos Entrantes", 
      icon: "🚀", intensityKey:"intensidadeNovoEntrantes",
      descricao: "Barreiras à entrada, capital necessário, acesso a canais de distribuição"
    },
    { 
      key: "poderFornecedores", 
      label: "Poder de Barganha dos Fornecedores", 
      icon: "🏭", intensityKey:"intensidadeFornecedores",
      descricao: "Concentração de fornecedores, custo de troca, importância do cliente"
    },
    { 
      key: "poderClientes", 
      label: "Poder de Barganha dos Clientes", 
      icon: "👤", intensityKey:"intensidadeClientes",
      descricao: "Número de clientes, volume de compra, sensibilidade ao preço"
    },
    { 
      key: "ameacaSubstitutos", 
      label: "Ameaça de Produtos Substitutos", 
      icon: "🔄", intensityKey:"intensidadeSubstitutos",
      descricao: "Produtos alternativos, preço relativo, desempenho relativo"
    },
    { 
      key: "rivalidadeCompetidores", 
      label: "Rivalidade entre Competidores", 
      icon: "⚔️", intensityKey:"intensidadeRivalidade",
      descricao: "Número de competidores, diferenciação, custos fixos, capacidade"
    },
  ];

  return (
    <ReadOnly><div className="mb-3"><Button onClick={()=>void save()}>Salvar variante porter-full</Button><span role="status">{status==='saved'?'Persistência confirmada':status==='error'?'Falha ao salvar':status==='saving'?'Salvando…':''}</span></div><div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="container max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => setLocation(`/empresa/${empresaId}`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-orange-600" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{empresa?.nome || "Empresa"}</h1>
                <p className="text-sm text-slate-600">5 Forças de Porter</p>
              </div>
            </div>
          </div>
        </div>

        {/* Introdução */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              O que são as 5 Forças de Porter?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-900 mb-3">
              O modelo de 5 Forças de Porter analisa a competitividade de uma indústria através de cinco forças que moldam a estratégia competitiva: novos entrantes, fornecedores, clientes, substitutos e rivalidade.
            </p>
            <p className="text-xs text-blue-800">
              Avalie cada força para entender a atratividade da indústria e a posição competitiva da sua empresa.
            </p>
          </CardContent>
        </Card>

        {/* Formulário de Análise */}
        <div className="space-y-6">
          {forcas.map((forca) => (
            <Card key={forca.key}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="text-2xl">{forca.icon}</span>
                  {forca.label}
                </CardTitle>
                <CardDescription className="text-xs">{forca.descricao}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Análise</label>
                  <Textarea
                    placeholder={`Descreva ${forca.label.toLowerCase()}...`}
                    value={formData[forca.key as keyof typeof formData] || ""}
                    onChange={(e) => setFormData({ ...formData, [forca.key]: e.target.value })}
                    className="min-h-20"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Intensidade</label>
                  <select 
                    className="w-full border rounded px-3 py-2"
                    aria-label={"Intensidade "+forca.label} value={formData[forca.intensityKey as keyof typeof formData]} onChange={e=>setFormData({...formData,[forca.intensityKey]:e.target.value})}
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Observações Gerais */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Observações Gerais</CardTitle>
            <CardDescription>Síntese da análise das 5 Forças</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Resumo da atratividade da indústria e posição competitiva..."
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              className="min-h-32"
            />
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={()=>setLocation("/")}>Voltar ao painel</Button>
              <Button className="bg-orange-600 hover:bg-orange-700" onClick={()=>void save()}>Salvar Análise</Button>
            </div>
          </CardContent>
        </Card>

        {/* Matriz de Intensidade */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Resumo de Intensidade</CardTitle>
            <CardDescription>Visualização das intensidades de cada força</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {forcas.map((forca) => (
                <div key={forca.key} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-48">{forca.label}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: formData[forca.intensityKey as keyof typeof formData]==='alta'?'100%':formData[forca.intensityKey as keyof typeof formData]==='media'?'66%':'33%' }}></div>
                  </div>
                  <span className="text-xs text-gray-600 w-12">{formData[forca.intensityKey as keyof typeof formData]==='alta'?'Alta':formData[forca.intensityKey as keyof typeof formData]==='media'?'Média':'Baixa'}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div></ReadOnly>
  );
}

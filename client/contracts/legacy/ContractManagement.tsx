import { useState } from "react";
import { useRoute, useLocation } from "../context.tsx";
import { trpc } from "../context.tsx";
import { Button } from "../../sge/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../sge/components/ui/card.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../context.tsx";
import { ArrowLeft, DollarSign, AlertTriangle, FileText, Users, Settings, CheckCircle2, Clock } from "lucide-react";
import {PageHeader} from "../context.tsx";
import {ClientLogo} from "../context.tsx";
import { toast } from "sonner";

export default function ContractManagement() {
  const [, params] = useRoute("/contracts/:id/manage");
  const [, setLocation] = useLocation();
  const contractId = String(params?.id??'');
  const isValidId = !!contractId;
  const [activeTab, setActiveTab] = useState("overview");

  const { data: contract, isLoading: contractLoading } = trpc.contracts.getById.useQuery({ id: contractId }, { enabled: isValidId });
  const { data: client } = trpc.clients.getById.useQuery({ id: contract?.clientId || 0 }, { enabled: !!contract?.clientId });
  const { data: milestones } = trpc.milestones.listByContract.useQuery({ contractId }, { enabled: isValidId });
  const { data: amendments } = trpc.amendments.listByContract.useQuery({ contractId }, { enabled: isValidId });
  const { data: risks } = trpc.contractRisks.listByContract.useQuery({ contractId }, { enabled: isValidId });

  if (contractLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="container py-8">
        <p className="text-muted-foreground">Contrato não encontrado</p>
        <Button onClick={() => setLocation("/contracts")} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  const totalMilestones = milestones?.length || 0;
  const completedMilestones = milestones?.filter((m: any) => m.status === "completed").length || 0;
  const pendingMilestones = milestones?.filter((m: any) => m.status === "pending").length || 0;
  const highRisks = risks?.filter((r: any) => r.severidade === "alta" || r.severidade === "critica").length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        {/* Header com botão voltar */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab("overview")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Visão geral
          </Button>
          <div className="flex-1">
            <PageHeader
              title={`Gestão: ${contract.title}`}
              description={`Centralize toda a gestão do contrato em um único lugar`}
            />
          </div>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Valor Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {contract.currency} {Number(contract.totalValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Marcos Concluídos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{completedMilestones}/{totalMilestones}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Marcos Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-orange-600">{pendingMilestones}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Riscos Altos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">Pendente de port</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de gestão */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="milestones" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Marcos ({totalMilestones})
            </TabsTrigger>
            <TabsTrigger value="risks" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Riscos (port pendente)
            </TabsTrigger>
            <TabsTrigger value="amendments" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Aditivos ({amendments?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Tab: Visão Geral */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Contrato</CardTitle>
                <CardDescription>Detalhes principais do contrato</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Código</p>
                    <p className="font-semibold">{contract.code || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cliente</p>
                    <p className="font-semibold">{client?.name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data Início</p>
                    <p className="font-semibold">
                      {contract.startDate ? new Date(contract.startDate).toLocaleDateString('pt-BR') : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data Término</p>
                    <p className="font-semibold">
                      {contract.endDate ? new Date(contract.endDate).toLocaleDateString('pt-BR') : "N/A"}
                    </p>
                  </div>
                </div>
                {contract.description && (
                  <div>
                    <p className="text-sm text-muted-foreground">Descrição</p>
                    <p className="text-sm">{contract.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => setActiveTab("milestones")}
                variant="outline"
                className="justify-start h-auto p-4"
              >
                <div className="text-left">
                  <p className="font-semibold flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Gerenciar Marcos
                  </p>
                  <p className="text-xs text-muted-foreground">Visualize e gerencie marcos contratuais</p>
                </div>
              </Button>
              <Button
                onClick={() => setActiveTab("risks")}
                variant="outline"
                className="justify-start h-auto p-4"
              >
                <div className="text-left">
                  <p className="font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Gerenciar Riscos
                  </p>
                  <p className="text-xs text-muted-foreground">Acompanhe riscos identificados</p>
                </div>
              </Button>
            </div>
          </TabsContent>

          {/* Tab: Marcos */}
          <TabsContent value="milestones" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Marcos Contratuais</CardTitle>
                <CardDescription>Total de {totalMilestones} marcos cadastrados</CardDescription>
              </CardHeader>
              <CardContent>
                {milestones && milestones.length > 0 ? (
                  <div className="space-y-3">
                    {milestones.map((milestone: any) => (
                      <div key={milestone.id} className="flex items-start justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{milestone.description}</p>
                          <p className="text-xs text-muted-foreground">
                            Vencimento: {new Date(milestone.dueDate).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{contract.currency} {Number(milestone.valorPrevisto).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                          <p className={`text-xs font-medium ${milestone.status === 'completed' ? 'text-green-600' : 'text-orange-600'}`}>
                            {milestone.status === 'completed' ? 'Concluído' : 'Pendente'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">Nenhum marco cadastrado</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Riscos */}
          <TabsContent value="risks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Riscos Identificados</CardTitle>
                <CardDescription>Total de {risks?.length || 0} riscos cadastrados</CardDescription>
              </CardHeader>
              <CardContent>
                {risks && risks.length > 0 ? (
                  <div className="space-y-3">
                    {risks.map((risk: any) => (
                      <div key={risk.id} className="flex items-start justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{risk.descricao}</p>
                          <p className="text-xs text-muted-foreground">
                            Tipo: {risk.tipo} | Responsável: {risk.responsavel || "N/A"}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            risk.severidade === 'critica' ? 'bg-red-100 text-red-700' :
                            risk.severidade === 'alta' ? 'bg-orange-100 text-orange-700' :
                            risk.severidade === 'media' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {risk.severidade}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">Nenhum risco contratual cadastrado. Use Novo risco contratual para registrar.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Aditivos */}
          <TabsContent value="amendments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Aditivos</CardTitle>
                <CardDescription>Total de {amendments?.length || 0} aditivos cadastrados</CardDescription>
              </CardHeader>
              <CardContent>
                {amendments && amendments.length > 0 ? (
                  <div className="space-y-3">
                    {amendments.map((amendment: any) => (
                      <div key={amendment.id} className="flex items-start justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{amendment.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Tipo: {amendment.tipo} | Vigência: {new Date(amendment.effectiveDate || amendment.startDate).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-blue-600">
                            {contract.currency} {Number(amendment.additionalValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">Nenhum aditivo cadastrado</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

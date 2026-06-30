"use client";

import React, { useState } from "react";
import { useLogistica, CargaLogistica, RotaLogistica } from "@/hooks/useLogistica";
import { useAuth } from "@/contexts/auth-context";
import { useVendas } from "@/hooks/useVendas";
import { OrdensCompra } from "@/components/logistica/OrdensCompra";
import { CadastroFornecedores } from "@/components/logistica/CadastroFornecedores";
import { AvaliacaoFornecedores } from "@/components/logistica/AvaliacaoFornecedores";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Truck,
  MapPin,
  Route,
  Zap,
  Play,
  CheckCircle,
  AlertTriangle,
  Clock,
  Navigation,
  Check,
  Plus,
  ArrowRight,
  User,
  Package,
  ShoppingCart,
  Users,
  Award,
  Trash2,
} from "lucide-react";

export default function LogisticaPage() {
  const { user } = useAuth();
  const {
    cargas,
    rotas,
    activeSimulations,
    adicionarCarga,
    atualizarCargaStatus,
    simularMovimentoCargo,
    otimizarRota,
    adicionarRota,
    removerRota,
  } = useLogistica();
  const { vendas } = useVendas();

  const cargoUser = user.cargo?.toLowerCase() || "";
  const canManage = user.role === "admin" || cargoUser.includes("logística") || cargoUser.includes("gerente") || cargoUser.includes("analista");

  const [abaAtiva, setAbaAtiva] = useState<"cargas" | "rotas" | "compras" | "fornecedores" | "avaliacoes">("cargas");
  const [cargoSelecionadaId, setCargoSelecionadaId] = useState<string | null>(
    cargas.length > 0 ? cargas[0].id : null
  );
  const [formOpen, setFormOpen] = useState(false);
  
  // Route Form Fields
  const [formRotaOpen, setFormRotaOpen] = useState(false);
  const [novaRotaNome, setNovaRotaNome] = useState("");
  const [novaRotaOrigem, setNovaRotaOrigem] = useState("CD Principal - São Paulo");
  const [novaRotaParadas, setNovaRotaParadas] = useState("");
  const [novaRotaDistancia, setNovaRotaDistancia] = useState(0);
  const [novaRotaCusto, setNovaRotaCusto] = useState(0);
  const [novaRotaTempo, setNovaRotaTempo] = useState("");

  // Form Fields
  const [pedidoId, setPedidoId] = useState("");
  const [cliente, setCliente] = useState("");
  const [destino, setDestino] = useState("Campinas - SP");
  const [motorista, setMotorista] = useState("");
  const [veiculo, setVeiculo] = useState("");
  const [rotaId, setRotaId] = useState("ROT-001");
  const [pesoKg, setPesoKg] = useState(200);

  // Set default values when sales or routes are available
  React.useEffect(() => {
    if (vendas.length > 0 && !pedidoId) {
      const pendingVenda = vendas[0];
      setPedidoId(pendingVenda.id);
      setCliente(pendingVenda.cliente);
    }
    if (rotas.length > 0 && !rotaId) {
      setRotaId(rotas[0].id);
    }
  }, [vendas, rotas, pedidoId, rotaId]);

  const handlePedidoChange = (id: string) => {
    setPedidoId(id);
    const venda = vendas.find((v) => v.id === id);
    if (venda) {
      setCliente(venda.cliente);
    }
  };

  const handleCreateCargo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente || !motorista || !veiculo) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const sucesso = adicionarCarga({
      pedidoId,
      cliente,
      destino,
      status: "preparando",
      motorista,
      veiculo,
      rotaId,
      pesoKg,
    });

    if (sucesso) {
      setFormOpen(false);
      setMotorista("");
      setVeiculo("");
      setPesoKg(200);
    }
  };

  const handleCreateRota = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaRotaNome || !novaRotaOrigem || !novaRotaParadas) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    const paradasArray = novaRotaParadas.split(",").map((p) => p.trim()).filter(Boolean);
    const sucesso = adicionarRota({
      nome: novaRotaNome,
      origem: novaRotaOrigem,
      paradas: paradasArray,
      paradasOriginais: paradasArray,
      distanciaKm: Number(novaRotaDistancia) || 0,
      custoCombustivel: Number(novaRotaCusto) || 0,
      tempoEstimado: novaRotaTempo || "0h",
    });

    if (sucesso) {
      setFormRotaOpen(false);
      setNovaRotaNome("");
      setNovaRotaOrigem("CD Principal - São Paulo");
      setNovaRotaParadas("");
      setNovaRotaDistancia(0);
      setNovaRotaCusto(0);
      setNovaRotaTempo("");
    }
  };

  // Convert Geo-coordinates (lat, lng) to SVG space (width 400, height 300)
  // Mapping bounds: Longitude -50 to -42, Latitude -22 to -26
  const projectCoords = (lat: number, lng: number) => {
    const minLng = -50.5;
    const maxLng = -42.0;
    const minLat = -22.0;
    const maxLat = -26.0;

    const x = ((lng - minLng) / (maxLng - minLng)) * 400;
    const y = ((lat - minLat) / (maxLat - minLat)) * 300;

    return { x, y };
  };

  const cityCoords = {
    "CD Principal - São Paulo": projectCoords(-23.5505, -46.6333),
    "Campinas - SP": projectCoords(-22.9099, -47.0626),
    "Rio de Janeiro - RJ": projectCoords(-22.9068, -43.1729),
    "Curitiba - PR": projectCoords(-25.4290, -49.2671),
  };

  const selectedCargo = cargas.find((c) => c.id === cargoSelecionadaId) || cargas[0];
  const selectedCargoCoords = selectedCargo
    ? projectCoords(selectedCargo.latitude, selectedCargo.longitude)
    : null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-4 no-print">
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            Logística e Trajetos
          </h2>
          <p className="text-sm text-muted-foreground">
            Acompanhe remessas em trânsito com simuladores de GPS e planeje trajetos otimizados.
          </p>
        </div>

        {canManage && (
          <Button
            onClick={() => setFormOpen(true)}
            className="h-9 shadow-md shadow-primary/20 shrink-0 gap-2 font-semibold"
          >
            <Plus className="h-4 w-4" /> Cadastrar Carga
          </Button>
        )}
      </div>

      <div className="flex border-b border-border no-print overflow-x-auto custom-scrollbar pb-px">
        <button
          onClick={() => setAbaAtiva("cargas")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
            abaAtiva === "cargas"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Truck className="h-4 w-4" />
          Acompanhamento de Cargas (GPS)
        </button>
        <button
          onClick={() => setAbaAtiva("compras")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
            abaAtiva === "compras"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <ShoppingCart className="h-4 w-4" />
          Ordens de Compra
        </button>
        <button
          onClick={() => setAbaAtiva("rotas")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
            abaAtiva === "rotas"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Route className="h-4 w-4" />
          Otimização de Rotas
        </button>
        <button
          onClick={() => setAbaAtiva("fornecedores")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
            abaAtiva === "fornecedores"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Users className="h-4 w-4" />
          Cadastro de Fornecedores
        </button>
        <button
          onClick={() => setAbaAtiva("avaliacoes")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
            abaAtiva === "avaliacoes"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Award className="h-4 w-4" />
          Avaliação de Desempenho
        </button>
      </div>

      {/* Page Content */}
      {abaAtiva === "cargas" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Cargo List Panel */}
          <div className="lg:col-span-1 space-y-4 max-h-[600px] overflow-y-auto pr-1">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
              Remessas Cadastradas
            </h3>
            {cargas.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-border rounded-xl">
                <Truck className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                <span className="text-xs text-muted-foreground">Nenhuma carga pendente.</span>
              </div>
            ) : (
              cargas.map((c) => {
                const isSimulating = activeSimulations[c.id];
                const isSelected = c.id === cargoSelecionadaId;

                return (
                  <div
                    key={c.id}
                    onClick={() => setCargoSelecionadaId(c.id)}
                    className={cn(
                      "p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md",
                      isSelected
                        ? "border-primary bg-primary/[0.02] shadow-sm"
                        : "border-border bg-card",
                      c.status === "problema" && "border-destructive/30"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-muted-foreground">{c.id}</span>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase",
                          c.status === "entregue"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : c.status === "em_transito"
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : c.status === "problema"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-accent text-muted-foreground"
                        )}
                      >
                        {c.status === "em_transito" ? "Em Trânsito" : c.status}
                      </span>
                    </div>

                    <div className="mt-2 space-y-1.5">
                      <h4 className="text-xs font-bold truncate">{c.cliente}</h4>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0" /> {c.destino}
                      </p>
                      
                      {/* Progress bar */}
                      <div className="space-y-1 pt-1">
                        <div className="h-1.5 w-full bg-accent rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-300",
                              c.status === "entregue" ? "bg-emerald-500" : "bg-primary"
                            )}
                            style={{ width: `${c.progresso}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[9px] text-muted-foreground font-semibold">
                          <span>{c.progresso}% concluído</span>
                          {isSimulating && (
                            <span className="text-primary animate-pulse flex items-center gap-0.5">
                              ● Transmitindo GPS
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Map and Tracking Details (US076) */}
          <div className="lg:col-span-2 space-y-6">
            {selectedCargo ? (
              <>
                {/* Visual SVG Map Tracker */}
                <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="space-y-0.5">
                      <h3 className="font-bold text-base tracking-tight flex items-center gap-2">
                        <Navigation className="h-4.5 w-4.5 text-primary" />
                        Simulador GPS de Carga
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Coordenadas em tempo real da entrega {selectedCargo.id}.
                      </p>
                    </div>

                    {canManage && selectedCargo.status !== "entregue" && (
                      <Button
                        size="sm"
                        onClick={() => simularMovimentoCargo(selectedCargo.id)}
                        disabled={activeSimulations[selectedCargo.id]}
                        className="h-8 gap-1.5 shadow-sm text-xs font-bold"
                      >
                        <Play className="h-3.5 w-3.5" />
                        {activeSimulations[selectedCargo.id]
                          ? "Simulando..."
                          : "Iniciar Simulação GPS"}
                      </Button>
                    )}
                  </div>

                  {/* SVG Canvas Map */}
                  <div className="relative bg-slate-950 rounded-xl overflow-hidden aspect-video max-h-[300px] flex items-center justify-center border border-border/80">
                    {/* Stylized background Grid */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />

                    <svg
                      viewBox="0 0 400 300"
                      className="w-full h-full relative z-10 p-4"
                    >
                      {/* Roads / Tracks */}
                      <path
                        d={`M ${cityCoords["CD Principal - São Paulo"].x} ${cityCoords["CD Principal - São Paulo"].y} L ${cityCoords["Campinas - SP"].x} ${cityCoords["Campinas - SP"].y}`}
                        fill="none"
                        className="stroke-border"
                        strokeWidth="3"
                        strokeDasharray="4"
                      />
                      <path
                        d={`M ${cityCoords["CD Principal - São Paulo"].x} ${cityCoords["CD Principal - São Paulo"].y} L ${cityCoords["Rio de Janeiro - RJ"].x} ${cityCoords["Rio de Janeiro - RJ"].y}`}
                        fill="none"
                        className="stroke-border"
                        strokeWidth="3"
                        strokeDasharray="4"
                      />
                      <path
                        d={`M ${cityCoords["CD Principal - São Paulo"].x} ${cityCoords["CD Principal - São Paulo"].y} L ${cityCoords["Curitiba - PR"].x} ${cityCoords["Curitiba - PR"].y}`}
                        fill="none"
                        className="stroke-border"
                        strokeWidth="3"
                        strokeDasharray="4"
                      />

                      {/* City Pins */}
                      {Object.entries(cityCoords).map(([name, coords]) => (
                        <g key={name} transform={`translate(${coords.x}, ${coords.y})`}>
                          <circle r="6" className="fill-card stroke-muted-foreground" strokeWidth="2" />
                          <circle r="3" className="fill-primary" />
                          <text
                            y="-10"
                            textAnchor="middle"
                            className="fill-muted-foreground select-none pointer-events-none"
                            fontSize="8"
                            fontWeight="bold"
                          >
                            {name.split(" - ")[0]}
                          </text>
                        </g>
                      ))}

                      {/* Active Cargo Moving Pin */}
                      {selectedCargoCoords && (
                        <g
                          transform={`translate(${selectedCargoCoords.x}, ${selectedCargoCoords.y})`}
                          className="transition-all duration-1000 ease-linear"
                        >
                          <circle
                            r="12"
                            className="fill-primary opacity-30 animate-ping"
                          />
                          <circle
                            r="8"
                            className={cn(
                              "stroke-background",
                              selectedCargo.status === "entregue" ? "fill-emerald-500" : "fill-primary"
                            )}
                            strokeWidth="1.5"
                          />
                          <path
                            d="M-3-3 L3 3 M3-3 L-3 3"
                            className="stroke-background"
                            strokeWidth="1"
                          />
                        </g>
                      )}
                    </svg>

                    {/* Coordinates Overlay Card */}
                    <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-lg text-[10px] font-mono z-20 space-y-0.5">
                      <div>GPS: {selectedCargo.latitude.toFixed(5)}, {selectedCargo.longitude.toFixed(5)}</div>
                      <div>Destino: {selectedCargo.destino}</div>
                    </div>
                  </div>
                </div>

                {/* Cargo Specifications and Logistics Log */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-5 rounded-xl border border-border bg-card shadow-sm space-y-3">
                    <h4 className="font-bold text-sm">Ficha Técnica da Carga</h4>
                    <div className="divide-y divide-border/60 text-xs space-y-2">
                      <div className="flex items-center justify-between py-1.5 pt-0">
                        <span className="text-muted-foreground flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Motorista</span>
                        <span className="font-bold">{selectedCargo.motorista}</span>
                      </div>
                      <div className="flex items-center justify-between py-1.5">
                        <span className="text-muted-foreground flex items-center gap-1.5"><Truck className="h-3.5 w-3.5" /> Veículo</span>
                        <span className="font-bold truncate max-w-[150px]">{selectedCargo.veiculo}</span>
                      </div>
                      <div className="flex items-center justify-between py-1.5">
                        <span className="text-muted-foreground flex items-center gap-1.5"><Package className="h-3.5 w-3.5" /> Peso Líquido</span>
                        <span className="font-bold">{selectedCargo.pesoKg} Kg</span>
                      </div>
                      <div className="flex items-center justify-between py-1.5">
                        <span className="text-muted-foreground flex items-center gap-1.5"><Route className="h-3.5 w-3.5" /> Rota do GPS</span>
                        <span className="font-bold">{selectedCargo.rotaId}</span>
                      </div>
                    </div>

                    {canManage && selectedCargo.status !== "entregue" && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => atualizarCargaStatus(selectedCargo.id, "entregue", "Entrega efetuada e assinada manualmente.")}
                          className="flex-1 text-[10px] font-bold h-8 border-emerald-500/20 text-emerald-600 hover:bg-emerald-500 hover:text-white"
                        >
                          <Check className="h-3 w-3 mr-1" /> Marcar Entregue
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => atualizarCargaStatus(selectedCargo.id, "problema", "Incidente reportado: problema no trajeto.")}
                          className="flex-1 text-[10px] font-bold h-8 border-destructive/20 text-destructive hover:bg-destructive hover:text-white"
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" /> Reportar Problema
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="p-5 rounded-xl border border-border bg-card shadow-sm space-y-3 flex flex-col">
                    <h4 className="font-bold text-sm flex items-center gap-1.5"><Clock className="h-4 w-4" /> Diário de Bordo (Status)</h4>
                    <div className="flex-1 space-y-3 overflow-y-auto max-h-[160px] pr-1 pt-1">
                      {selectedCargo.historico.map((h, idx) => (
                        <div key={idx} className="flex gap-2.5 text-xs">
                          <div className="flex flex-col items-center shrink-0">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                            {idx < selectedCargo.historico.length - 1 && <div className="w-0.5 bg-border flex-1" />}
                          </div>
                          <div className="space-y-0.5 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{h.status}</span>
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(h.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-snug">{h.detalhes}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center border border-dashed border-border rounded-xl">
                <Truck className="h-12 w-12 mx-auto text-muted-foreground/30 mb-2 animate-bounce" />
                <h4 className="text-sm font-bold text-muted-foreground">Carregando remessa de entrega...</h4>
              </div>
            )}
          </div>
        </div>
      )}

      {abaAtiva === "rotas" && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
            <div className="flex justify-between items-end border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-base tracking-tight flex items-center gap-2">
                  <Route className="h-4.5 w-4.5 text-primary" />
                  Otimização de Trajetos de Carga
                </h3>
                <p className="text-xs text-muted-foreground">
                  Planeje trajetos reordenando pontos de paradas para economizar combustível e tempo (US077).
                </p>
              </div>
              {canManage && (
                <Button
                  size="sm"
                  onClick={() => setFormRotaOpen(true)}
                  className="gap-2 font-semibold shadow-md shadow-primary/20"
                >
                  <Plus className="h-4 w-4" /> Nova Rota
                </Button>
              )}
            </div>

            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-accent/40 border-b border-border text-xs font-bold text-muted-foreground">
                    <th className="p-3 text-center">Identificador</th>
                    <th className="p-3 text-left">Nome da Rota</th>
                    <th className="p-3 text-center">Origem</th>
                    <th className="p-3 text-center">Sequência de Paradas</th>
                    <th className="p-3 text-center">Distância</th>
                    <th className="p-3 text-center">Combustível</th>
                    <th className="p-3 text-center">Status</th>
                    {canManage && <th className="p-3 text-center">Ação</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {rotas.map((r) => (
                    <tr key={r.id} className="hover:bg-accent/10 transition-colors">
                      <td className="p-3 font-bold text-center">{r.id}</td>
                      <td className="p-3 font-medium text-left">{r.nome}</td>
                      <td className="p-3 text-muted-foreground font-medium text-center">{r.origem}</td>
                      <td className="p-3 font-medium max-w-[280px] text-center">
                        <div className="flex flex-wrap items-center gap-1">
                          {r.paradas.map((p, idx) => (
                            <React.Fragment key={idx}>
                              <span className="bg-accent px-1.5 py-0.5 rounded text-[10px]">
                                {p}
                              </span>
                              {idx < r.paradas.length - 1 && (
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 font-extrabold text-center">{r.distanciaKm} Km</td>
                      <td className="p-3 font-extrabold text-center">R$ {r.custoCombustivel.toFixed(2)}</td>
                      <td className="p-3 text-center">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase flex items-center gap-1 w-fit",
                            r.otimizada
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-accent text-muted-foreground"
                          )}
                        >
                          {r.otimizada ? (
                            <>
                              <Zap className="h-3 w-3 text-emerald-500" />
                              Otimizada
                            </>
                          ) : (
                            "Padrão"
                          )}
                        </span>
                      </td>
                      {canManage && (
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="xs"
                              onClick={() => otimizarRota(r.id)}
                              disabled={r.otimizada}
                              className={cn(
                                "h-7 text-[10px] font-bold flex items-center gap-1",
                                r.otimizada
                                  ? "bg-accent text-muted-foreground border border-transparent"
                                  : "shadow-md shadow-primary/10"
                              )}
                            >
                              <Zap className="h-3 w-3" />
                              {r.otimizada ? "Otimizada" : "Otimizar Rota"}
                            </Button>
                            {r.otimizada && (
                              <Button
                                size="xs"
                                variant="destructive"
                                onClick={() => removerRota(r.id)}
                                className="h-7 w-7 p-0 flex items-center justify-center shadow-md shadow-destructive/20"
                                title="Remover Rota"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Comparative analysis carousel (US077) */}
          <div className="grid gap-6 md:grid-cols-3">
            {rotas.filter(r => r.otimizada).map((r) => {
              const kmSalvo = Math.round(r.distanciaKm / 0.85 - r.distanciaKm);
              const combustivelSalvo = Math.round(r.custoCombustivel / 0.82 - r.custoCombustivel);

              return (
                <div key={r.id} className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.01] shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                      Economia Otimizada: {r.id}
                    </h4>
                    <Zap className="h-4.5 w-4.5 text-emerald-500" />
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="p-3 bg-accent/30 rounded-xl border border-border/40">
                        <span className="text-[10px] text-muted-foreground block font-bold">Quilometragem</span>
                        <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">-{kmSalvo} Km</span>
                      </div>
                      <div className="p-3 bg-accent/30 rounded-xl border border-border/40">
                        <span className="text-[10px] text-muted-foreground block font-bold">Custos</span>
                        <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">-R$ {combustivelSalvo.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Comparação de Sequência</span>
                      <div className="text-[10px] space-y-1 p-2.5 bg-accent/20 rounded-lg border border-border/40 text-muted-foreground">
                        <div>
                          <strong className="text-foreground">Original:</strong>{" "}
                          {r.paradasOriginais.join(" ➔ ")}
                        </div>
                        <div className="border-t border-border/40 pt-1 mt-1">
                          <strong className="text-emerald-600 dark:text-emerald-400">Otimizado:</strong>{" "}
                          {r.paradas.join(" ➔ ")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {abaAtiva === "compras" && <OrdensCompra />}

      {abaAtiva === "fornecedores" && <CadastroFornecedores />}

      {abaAtiva === "avaliacoes" && <AvaliacaoFornecedores />}

      {/* Register Cargo Modal */}
      {formOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground border border-border shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden flex flex-col transform scale-100 animate-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                Cadastrar Carga Logística
              </h3>
              <button
                onClick={() => setFormOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateCargo} className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
              {/* Venda / Pedido select */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Venda Vinculada
                </label>
                <select
                  value={pedidoId}
                  onChange={(e) => handlePedidoChange(e.target.value)}
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-sm text-foreground cursor-pointer"
                >
                  {vendas.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.id} - {v.cliente} (R$ {v.valorTotal.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Cliente */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Destinatário (Cliente)
                </label>
                <input
                  type="text"
                  required
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-sm text-foreground"
                />
              </div>

              {/* Destino and Route Select */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">
                    Cidade de Destino
                  </label>
                  <select
                    value={destino}
                    onChange={(e) => setDestino(e.target.value)}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-sm text-foreground cursor-pointer"
                  >
                    <option value="Campinas - SP">Campinas - SP</option>
                    <option value="Rio de Janeiro - RJ">Rio de Janeiro - RJ</option>
                    <option value="Curitiba - PR">Curitiba - PR</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">
                    Trajeto Associado
                  </label>
                  <select
                    value={rotaId}
                    onChange={(e) => setRotaId(e.target.value)}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-sm text-foreground cursor-pointer"
                  >
                    {rotas.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Driver & Vehicle */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">
                    Nome do Motorista
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Pires"
                    value={motorista}
                    onChange={(e) => setMotorista(e.target.value)}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-sm text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">
                    Veículo / Placa
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Sprinter (ABC-1234)"
                    value={veiculo}
                    onChange={(e) => setVeiculo(e.target.value)}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-sm text-foreground"
                  />
                </div>
              </div>

              {/* Weight */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Peso da Carga (Kg)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={pesoKg}
                  onChange={(e) => setPesoKg(parseInt(e.target.value) || 0)}
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-sm text-foreground"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-border pt-4 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormOpen(false)}
                  className="h-9 font-semibold"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="h-9 shadow-md shadow-primary/20 font-semibold"
                >
                  Confirmar Carga
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Nova Rota */}
      {formRotaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-border flex items-center justify-between bg-accent/30 shrink-0">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Route className="h-5 w-5 text-primary" />
                Nova Rota Logística
              </h3>
              <button
                onClick={() => setFormRotaOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateRota} className="p-4 space-y-4 overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Nome da Rota</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Rota Nordeste Rápida"
                  value={novaRotaNome}
                  onChange={(e) => setNovaRotaNome(e.target.value)}
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-sm text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Origem</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: CD Principal - São Paulo"
                  value={novaRotaOrigem}
                  onChange={(e) => setNovaRotaOrigem(e.target.value)}
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-sm text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Paradas (separadas por vírgula)</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Campinas, Ribeirão Preto, Uberaba"
                  value={novaRotaParadas}
                  onChange={(e) => setNovaRotaParadas(e.target.value)}
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-sm text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Distância (Km)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={novaRotaDistancia}
                    onChange={(e) => setNovaRotaDistancia(parseInt(e.target.value) || 0)}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-sm text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Custo Combustível (R$)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={novaRotaCusto}
                    onChange={(e) => setNovaRotaCusto(parseFloat(e.target.value) || 0)}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-sm text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Tempo Estimado</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 8h 30m"
                  value={novaRotaTempo}
                  onChange={(e) => setNovaRotaTempo(e.target.value)}
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-sm text-foreground"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border pt-4 mt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setFormRotaOpen(false)} className="h-9 font-semibold">
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="h-9 shadow-md shadow-primary/20 font-semibold">
                  Salvar Rota
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

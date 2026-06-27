"use client";

import { useState, useEffect } from "react";
import { useNotifications } from "@/contexts/notifications-context";

export interface HistoricoStatus {
  status: string;
  timestamp: string;
  detalhes: string;
}

export interface CargaLogistica {
  id: string;
  pedidoId: string;
  cliente: string;
  destino: string;
  status: "preparando" | "em_transito" | "entregue" | "problema";
  motorista: string;
  veiculo: string;
  rotaId: string;
  latitude: number;
  longitude: number;
  progresso: number; // 0 to 100
  pesoKg: number;
  historico: HistoricoStatus[];
}

export interface RotaLogistica {
  id: string;
  nome: string;
  origem: string;
  paradas: string[];
  paradasOriginais: string[]; // for before/after comparison
  distanciaKm: number;
  custoCombustivel: number;
  otimizada: boolean;
  tempoEstimado: string;
}

const rotasIniciais: RotaLogistica[] = [
  {
    id: "ROT-001",
    nome: "Rota Interior Expressa",
    origem: "CD Principal - São Paulo",
    paradas: ["São José do Rio Preto", "Ribeirão Preto", "Campinas"],
    paradasOriginais: ["São José do Rio Preto", "Ribeirão Preto", "Campinas"],
    distanciaKm: 460,
    custoCombustivel: 920.00,
    otimizada: false,
    tempoEstimado: "6h 15m",
  },
  {
    id: "ROT-002",
    nome: "Rota Litoral Norte - Rio",
    origem: "CD Principal - São Paulo",
    paradas: ["São Sebastião", "Angra dos Reis", "Ubatuba", "Rio de Janeiro"],
    paradasOriginais: ["São Sebastião", "Angra dos Reis", "Ubatuba", "Rio de Janeiro"],
    distanciaKm: 510,
    custoCombustivel: 1020.00,
    otimizada: false,
    tempoEstimado: "7h 30m",
  },
  {
    id: "ROT-003",
    nome: "Rota Eixo Sul",
    origem: "CD Principal - São Paulo",
    paradas: ["Joinville", "Curitiba", "Sorocaba"],
    paradasOriginais: ["Joinville", "Curitiba", "Sorocaba"],
    distanciaKm: 420,
    custoCombustivel: 840.00,
    otimizada: false,
    tempoEstimado: "5h 45m",
  },
];

const cargasIniciais: CargaLogistica[] = [
  {
    id: "CRG-001",
    pedidoId: "VEN-2026-001",
    cliente: "Ana Silva",
    destino: "Campinas - SP",
    status: "preparando",
    motorista: "Marcos Souza",
    veiculo: "Caminhão Iveco Daily (Placa: ABC-1234)",
    rotaId: "ROT-001",
    latitude: -23.5505, // São Paulo
    longitude: -46.6333,
    progresso: 0,
    pesoKg: 350,
    historico: [
      {
        status: "Preparando",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        detalhes: "Carga consolidada e paletizada no galpão.",
      },
    ],
  },
  {
    id: "CRG-002",
    pedidoId: "VEN-2026-003",
    cliente: "Juliana Santos",
    status: "em_transito",
    destino: "Rio de Janeiro - RJ",
    motorista: "Carlos Pires",
    veiculo: "Caminhão Mercedes Accelo (Placa: XYZ-9876)",
    rotaId: "ROT-002",
    latitude: -22.9068, // Simulated moving position
    longitude: -43.1729,
    progresso: 65,
    pesoKg: 1200,
    historico: [
      {
        status: "Preparando",
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        detalhes: "Pedido liberado pela expedição.",
      },
      {
        status: "Em Trânsito",
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        detalhes: "Veículo saiu do CD de São Paulo.",
      },
    ],
  },
  {
    id: "CRG-003",
    pedidoId: "VEN-2026-005",
    cliente: "Fernanda Lima",
    status: "entregue",
    destino: "Curitiba - PR",
    motorista: "Roberto Alves",
    veiculo: "Van Sprinter (Placa: DEF-5678)",
    rotaId: "ROT-003",
    latitude: -25.4290, // Curitiba
    longitude: -49.2671,
    progresso: 100,
    pesoKg: 180,
    historico: [
      {
        status: "Preparando",
        timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        detalhes: "Consolidação concluída.",
      },
      {
        status: "Em Trânsito",
        timestamp: new Date(Date.now() - 3600000 * 10).toISOString(),
        detalhes: "Em trânsito pela BR-116.",
      },
      {
        status: "Entregue",
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        detalhes: "Entregue ao cliente com comprovante digital assinado.",
      },
    ],
  },
];

// Coordinate endpoints mapping
const coordenadasCidades: Record<string, { lat: number; lng: number }> = {
  "CD Principal - São Paulo": { lat: -23.5505, lng: -46.6333 },
  "Campinas - SP": { lat: -22.9099, lng: -47.0626 },
  "Rio de Janeiro - RJ": { lat: -22.9068, lng: -43.1729 },
  "Curitiba - PR": { lat: -25.4290, lng: -49.2671 },
};

export function useLogistica() {
  const { addNotification } = useNotifications();

  const [cargas, setCargas] = useState<CargaLogistica[]>(cargasIniciais);
  const [rotas, setRotas] = useState<RotaLogistica[]>(rotasIniciais);
  const [activeSimulations, setActiveSimulations] = useState<Record<string, boolean>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedCargas = localStorage.getItem("erp_cargas");
    if (savedCargas) {
      try {
        setCargas(JSON.parse(savedCargas));
      } catch (e) {}
    }
    
    const savedRotas = localStorage.getItem("erp_rotas");
    if (savedRotas) {
      try {
        setRotas(JSON.parse(savedRotas));
      } catch (e) {}
    }
    
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("erp_cargas", JSON.stringify(cargas));
    }
  }, [cargas, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("erp_rotas", JSON.stringify(rotas));
    }
  }, [rotas, isLoaded]);

  // Sync tabs
  useEffect(() => {
    const handleStorageChange = () => {
      const savedCargas = localStorage.getItem("erp_cargas");
      const savedRotas = localStorage.getItem("erp_rotas");
      if (savedCargas) {
        try { setCargas(JSON.parse(savedCargas)); } catch (e) {}
      }
      if (savedRotas) {
        try { setRotas(JSON.parse(savedRotas)); } catch (e) {}
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const adicionarCarga = (novaCarga: Omit<CargaLogistica, "id" | "latitude" | "longitude" | "progresso" | "historico">) => {
    const id = `CRG-${String(cargas.length + 1).padStart(3, "0")}`;
    const startCoords = coordenadasCidades["CD Principal - São Paulo"];
    const cargaCompleta: CargaLogistica = {
      ...novaCarga,
      id,
      latitude: startCoords.lat,
      longitude: startCoords.lng,
      progresso: 0,
      historico: [
        {
          status: "Preparando",
          timestamp: new Date().toISOString(),
          detalhes: `Carga agendada sob responsabilidade de ${novaCarga.motorista}.`,
        },
      ],
    };

    setCargas((prev) => [cargaCompleta, ...prev]);
    addNotification(
      "Expedição de Carga",
      `Carga ${id} destinada a ${novaCarga.cliente} foi agendada.`,
      "info",
      "logistica"
    );

    setTimeout(() => {
      window.dispatchEvent(new Event("storage"));
    }, 100);
    return true;
  };

  const atualizarCargaStatus = (id: string, status: CargaLogistica["status"], detalhes: string = "") => {
    setCargas((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const timestamp = new Date().toISOString();
          const novoStatusNome = status.charAt(0).toUpperCase() + status.slice(1);
          
          // coordinate snaps
          let lat = c.latitude;
          let lng = c.longitude;
          if (status === "entregue") {
            const destCoords = coordenadasCidades[c.destino] || coordenadasCidades["CD Principal - São Paulo"];
            lat = destCoords.lat;
            lng = destCoords.lng;
          }

          return {
            ...c,
            status,
            latitude: lat,
            longitude: lng,
            progresso: status === "entregue" ? 100 : c.progresso,
            historico: [
              ...c.historico,
              { status: novoStatusNome, timestamp, detalhes: detalhes || `Status atualizado para ${novoStatusNome}.` },
            ],
          };
        }
        return c;
      })
    );

    const c = cargas.find((c) => c.id === id);
    if (c) {
      addNotification(
        `Carga ${status === "entregue" ? "Entregue" : "Status Alterado"}`,
        `A entrega ${id} para ${c.cliente} está agora: ${status === "em_transito" ? "Em trânsito" : status}.`,
        status === "entregue" ? "success" : status === "problema" ? "error" : "info",
        "logistica"
      );
    }

    setTimeout(() => {
      window.dispatchEvent(new Event("storage"));
    }, 100);
  };

  // Simulate movements (US076)
  const simularMovimentoCargo = (id: string) => {
    if (activeSimulations[id]) return;

    setActiveSimulations((prev) => ({ ...prev, [id]: true }));
    
    // Set to transit if preparing
    const targetCarga = cargas.find((c) => c.id === id);
    if (!targetCarga) return;

    if (targetCarga.status === "preparando") {
      atualizarCargaStatus(id, "em_transito", "Iniciando rota de entrega simulada.");
    }

    let currentProgress = targetCarga.progresso === 100 ? 0 : targetCarga.progresso;

    const startCoords = coordenadasCidades["CD Principal - São Paulo"];
    const destCoords = coordenadasCidades[targetCarga.destino] || startCoords;

    const interval = setInterval(() => {
      currentProgress += 10;
      
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setActiveSimulations((prev) => ({ ...prev, [id]: false }));
        
        // Final state: Entregue
        setCargas((prev) =>
          prev.map((c) => {
            if (c.id === id) {
              return {
                ...c,
                status: "entregue",
                progresso: 100,
                latitude: destCoords.lat,
                longitude: destCoords.lng,
                historico: [
                  ...c.historico,
                  {
                    status: "Entregue",
                    timestamp: new Date().toISOString(),
                    detalhes: "Simulação finalizada. Veículo chegou ao destino final.",
                  },
                ],
              };
            }
            return c;
          })
        );

        addNotification(
          "Carga Entregue (Simulador)",
          `A entrega ${id} para ${targetCarga.cliente} em ${targetCarga.destino} foi concluída.`,
          "success",
          "logistica"
        );
      } else {
        // Interpolate coordinates
        const ratio = currentProgress / 100;
        const currentLat = startCoords.lat + (destCoords.lat - startCoords.lat) * ratio;
        const currentLng = startCoords.lng + (destCoords.lng - startCoords.lng) * ratio;

        setCargas((prev) =>
          prev.map((c) => {
            if (c.id === id) {
              return {
                ...c,
                progresso: currentProgress,
                latitude: Number(currentLat.toFixed(6)),
                longitude: Number(currentLng.toFixed(6)),
              };
            }
            return c;
          })
        );
      }
    }, 1000); // update every 1 second for a smooth simulation
  };

  // Route Optimization (US077)
  const otimizarRota = (rotaId: string) => {
    const rotaAtual = rotas.find((r) => r.id === rotaId);
    if (!rotaAtual) return;

    const paradasOtimizadas = [...rotaAtual.paradas].reverse();
    const kmOriginal = rotaAtual.distanciaKm;
    const novoKm = Math.round(kmOriginal * 0.85); // 15% reduction
    const custoOriginal = rotaAtual.custoCombustivel;
    const novoCusto = Math.round(custoOriginal * 0.82); // 18% reduction
    const economia = custoOriginal - novoCusto;

    addNotification(
      "Trajeto Otimizado",
      `A rota "${rotaAtual.nome}" foi reordenada. Reduziu ${kmOriginal - novoKm}km e economizou R$ ${economia.toFixed(2)} em combustível.`,
      "success",
      "logistica"
    );

    setRotas((prev) =>
      prev.map((r) => {
        if (r.id === rotaId) {
          return {
            ...r,
            paradas: paradasOtimizadas,
            distanciaKm: novoKm,
            custoCombustivel: novoCusto,
            otimizada: true,
            tempoEstimado: `${Math.floor(novoKm / 80)}h ${Math.round((novoKm % 80) * 0.75)}m`,
          };
        }
        return r;
      })
    );

    setTimeout(() => {
      window.dispatchEvent(new Event("storage"));
    }, 100);
  };

  const adicionarRota = (novaRota: Omit<RotaLogistica, "id" | "otimizada">) => {
    const id = `ROT-${String(rotas.length + 1).padStart(3, "0")}`;
    const rotaCompleta: RotaLogistica = {
      ...novaRota,
      id,
      otimizada: false,
    };

    setRotas((prev) => [...prev, rotaCompleta]);
    addNotification(
      "Nova Rota",
      `A rota "${rotaCompleta.nome}" foi cadastrada com sucesso.`,
      "success",
      "logistica"
    );

    setTimeout(() => {
      window.dispatchEvent(new Event("storage"));
    }, 100);
    return true;
  };

  const removerRota = (rotaId: string) => {
    const rota = rotas.find(r => r.id === rotaId);
    if (!rota) return false;

    setRotas(prev => prev.filter(r => r.id !== rotaId));
    addNotification(
      "Rota Removida",
      `A rota "${rota.nome}" foi removida com sucesso.`,
      "info",
      "logistica"
    );

    setTimeout(() => {
      window.dispatchEvent(new Event("storage"));
    }, 100);
    return true;
  };

  return {
    cargas,
    rotas,
    activeSimulations,
    adicionarCarga,
    atualizarCargaStatus,
    simularMovimentoCargo,
    otimizarRota,
    adicionarRota,
    removerRota,
  };
}

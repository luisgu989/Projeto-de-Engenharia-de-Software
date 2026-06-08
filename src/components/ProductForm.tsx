import React, { useState, useEffect } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductFormProps {
  mode: "add" | "edit";
  initialData?: {
    sku?: string;
    nome?: string;
    categoria?: string;
    quantidade?: number;
    estoqueMinimo?: number;
    precoCusto?: number;
    precoVenda?: number;
  };
  onSubmit: (data: {
    sku: string;
    nome: string;
    categoria: string;
    quantidade: number;
    estoqueMinimo: number;
    precoCusto: number;
    precoVenda: number;
  }) => boolean;
  onClose: () => void;
  existingItems: { sku: string }[]; // for SKU duplicate check
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export function ProductForm({
  mode,
  initialData = {},
  onSubmit,
  onClose,
  existingItems,
  errors,
  setErrors,
}: ProductFormProps) {
  const [sku, setSku] = useState(initialData.sku ?? "");
  const [skuAvailability, setSkuAvailability] = useState<"available" | "unavailable" | null>(null);
  const [isCheckingSku, setIsCheckingSku] = useState(false);
  const [nome, setNome] = useState(initialData.nome ?? "");
  const [categoria, setCategoria] = useState(initialData.categoria ?? "Periféricos");
  const [quantidade, setQuantidade] = useState(initialData.quantidade ?? 0);
  const [estoqueMinimo, setEstoqueMinimo] = useState(initialData.estoqueMinimo ?? 10);
  const [precoCusto, setPrecoCusto] = useState(initialData.precoCusto ?? 0);
  const [precoVenda, setPrecoVenda] = useState(initialData.precoVenda ?? 0);

  const handleSkuChange = (value: string) => {
    const cleaned = value.trim().toUpperCase();
    setSku(cleaned);
    setSkuAvailability(null);
    if (!cleaned) {
      setErrors((prev) => ({ ...prev, sku: "SKU é obrigatório." }));
      return;
    }
    const skuRegex = /^[A-Z0-9-]+$/;
    if (!skuRegex.test(cleaned)) {
      setErrors((prev) => ({ ...prev, sku: "Formato inválido. Use apenas letras maiúsculas, números e hífens." }));
      return;
    }
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.sku;
      return copy;
    });
    setIsCheckingSku(true);
    setTimeout(() => {
      const duplicado = existingItems.some((item) => item.sku.trim().toUpperCase() === cleaned);
      if (duplicado) {
        setSkuAvailability("unavailable");
        setErrors((prev) => ({ ...prev, sku: `O SKU "${cleaned}" já está em uso.` }));
      } else {
        setSkuAvailability("available");
        setErrors((prev) => {
          const copy = { ...prev };
          delete copy.sku;
          return copy;
        }));
      }
      setIsCheckingSku(false);
    }, 400);
  };

  const handleNomeChange = (value: string) => {
    setNome(value);
    if (value.trim().length < 3) {
      setErrors((prev) => ({ ...prev, nome: "O nome deve ter ao menos 3 caracteres." }));
    } else {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.nome;
        return copy;
      });
    }
  };

  const handlePrecoChange = (custo: number, venda: number) => {
    setPrecoCusto(custo);
    setPrecoVenda(venda);
    const temp: Record<string, string> = {};
    if (custo < 0) temp.precoCusto = "Preço de custo não pode ser negativo.";
    if (venda <= 0) temp.precoVenda = "Preço de venda deve ser maior que zero.";
    if (venda <= custo) temp.precoVenda = "Preço de venda deve ser maior que o preço de custo.";
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.precoCusto;
      delete copy.precoVenda;
      return { ...copy, ...temp };
    });
  };

  const handleQuantidadeChange = (val: number) => {
    setQuantidade(val);
    if (val < 0) {
      setErrors((prev) => ({ ...prev, quantidade: "A quantidade não pode ser negativa." }));
    } else {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.quantidade;
        return copy;
      });
    }
  };

  const handleEstoqueMinimoChange = (val: number) => {
    setEstoqueMinimo(val);
    if (val < 1) {
      setErrors((prev) => ({ ...prev, estoqueMinimo: "Estoque mínimo deve ser ao menos 1." }));
    } else {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.estoqueMinimo;
        return copy;
      });
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(errors).length > 0 || !nome || !sku || (mode === "add" && skuAvailability !== "available")) {
      return;
    }
    const success = onSubmit({
      sku,
      nome: nome.trim(),
      categoria,
      quantidade: Number(quantidade),
      estoqueMinimo: Number(estoqueMinimo),
      precoCusto: Number(precoCusto),
      precoVenda: Number(precoVenda),
    });
    if (success) {
      // reset only in add mode
      if (mode === "add") {
        setSku("");
        setSkuAvailability(null);
        setNome("");
        setCategoria("Periféricos");
        setQuantidade(0);
        setEstoqueMinimo(10);
        setPrecoCusto(0);
        setPrecoVenda(0);
        setErrors({});
      }
      onClose();
    }
  };

  return (
    <form onSubmit={submit} className="p-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">
            SKU / Código <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="PRD-TEC-001"
            value={sku}
            onChange={(e) => handleSkuChange(e.target.value)}
            className={cn(
              "w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm uppercase font-mono",
              errors.sku && "border-destructive focus:border-destructive"
            )}
          />
          <div className="flex items-center justify-between mt-1 min-h-[16px]">
            {isCheckingSku ? (
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin text-primary" />
                Verificando...
              </span>
            ) : skuAvailability === "available" ? (
              <span className="text-[10px] text-emerald-500 font-bold">SKU disponível</span>
            ) : errors.sku ? (
              <span className="text-[10px] text-destructive font-bold">{errors.sku}</span>
            ) : null}
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Categoria</label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm"
          >
            <option value="Periféricos">Periféricos</option>
            <option value="Monitores">Monitores</option>
            <option value="Acessórios">Acessórios</option>
            <option value="Áudio">Áudio</option>
            <option value="Componentes">Componentes</option>
          </select>
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold text-muted-foreground">
          Nome do Produto <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          required
          placeholder="Nome descritivo"
          value={nome}
          onChange={(e) => handleNomeChange(e.target.value)}
          className={cn(
            "w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm",
            errors.nome && "border-destructive focus:border-destructive"
          )}
        />
        {errors.nome && <span className="text-[10px] text-destructive font-bold mt-1 block">{errors.nome}</span>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">
            Estoque Inicial <span className="text-destructive">*</span>
          </label>
          <input
            type="number"
            min="0"
            step="1"
            required
            value={quantidade}
            onChange={(e) => handleQuantidadeChange(Number(e.target.value))}
            onKeyDown={(e) => {
              if (["-", "+", "e", "E", ".", ","].includes(e.key)) e.preventDefault();
            }}
            className={cn(
              "w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm",
              errors.quantidade && "border-destructive"
            )}
          />
          {errors.quantidade && <span className="text-[10px] text-destructive font-bold mt-1 block">{errors.quantidade}</span>}
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">
            Estoque Mínimo <span className="text-destructive">*</span>
          </label>
          <input
            type="number"
            min="1"
            step="1"
            required
            value={estoqueMinimo}
            onChange={(e) => handleEstoqueMinimoChange(Number(e.target.value))}
            className={cn(
              "w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm",
              errors.estoqueMinimo && "border-destructive"
            )}
          />
          {errors.estoqueMinimo && <span className="text-[10px] text-destructive font-bold mt-1 block">{errors.estoqueMinimo}</span>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Preço Custo</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={precoCusto}
            onChange={(e) => handlePrecoChange(Number(e.target.value), precoVenda)}
            className={cn(
              "w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm",
              errors.precoCusto && "border-destructive"
            )}
          />
          {errors.precoCusto && <span className="text-[10px] text-destructive font-bold mt-1 block">{errors.precoCusto}</span>}
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Preço Venda</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={precoVenda}
            onChange={(e) => handlePrecoChange(precoCusto, Number(e.target.value))}
            className={cn(
              "w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm",
              errors.precoVenda && "border-destructive"
            )}
          />
          {errors.precoVenda && <span className="text-[10px] text-destructive font-bold mt-1 block">{errors.precoVenda}</span>}
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
          Cancelar
        </button>
        <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
          {mode === "add" ? "Cadastrar" : "Salvar"}
        </button>
      </div>
    </form>
  );
}

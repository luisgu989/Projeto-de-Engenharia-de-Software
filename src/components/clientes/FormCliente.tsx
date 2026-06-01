"use client";

import React, { useState, useEffect } from "react";
import { Cliente } from "@/hooks/useClientes";
import { Button } from "@/components/ui/button";
import { Lock, Unlock, AlertOctagon, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormClienteProps {
  clienteExistente?: Cliente | null;
  onSave: (dados: Omit<Cliente, "id" | "criadoEm" | "criadoPor" | "atualizadoEm" | "atualizadoPor">) => boolean;
  onClose: () => void;
  errorMessage?: string | null;
  clearError?: () => void;
}

export function FormCliente({
  clienteExistente,
  onSave,
  onClose,
  errorMessage,
  clearError,
}: FormClienteProps) {
  const isEditing = !!clienteExistente;

  // Form states
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<"PF" | "PJ">("PF");
  const [documento, setDocumento] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [status, setStatus] = useState<"ativo" | "inativo">("ativo");

  // Critical field locking states (Bloqueio de Campos Chave)
  const [isDocLocked, setIsDocLocked] = useState(isEditing);
  const [showUnlockConfirm, setShowUnlockConfirm] = useState(false);

  // Form validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Initialize form with existing client details on edit
  useEffect(() => {
    if (clienteExistente) {
      setNome(clienteExistente.nome);
      setTipo(clienteExistente.tipo);
      setDocumento(clienteExistente.documento);
      setEmail(clienteExistente.email);
      setTelefone(clienteExistente.telefone);
      setCidade(clienteExistente.cidade);
      setEstado(clienteExistente.estado);
      setStatus(clienteExistente.status);
      setIsDocLocked(true); // Lock document initially when editing
    } else {
      setNome("");
      setTipo("PF");
      setDocumento("");
      setEmail("");
      setTelefone("");
      setCidade("");
      setEstado("");
      setStatus("ativo");
      setIsDocLocked(false);
    }
    if (clearError) clearError();
    setValidationErrors({});
  }, [clienteExistente, clearError]);

  // Helper to format Documento as user types (CPF/CNPJ masking)
  const formatDocumentMask = (value: string, currentTipo: "PF" | "PJ") => {
    const numbers = value.replace(/\D/g, "");
    if (currentTipo === "PF") {
      // CPF: 000.000.000-00
      if (numbers.length <= 3) return numbers;
      if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
      if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
    } else {
      // CNPJ: 00.000.000/0001-00
      if (numbers.length <= 2) return numbers;
      if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
      if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
      if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const maskedVal = formatDocumentMask(rawVal, tipo);
    setDocumento(maskedVal);
  };

  // Change mask when tipo changes
  const handleTipoChange = (newTipo: "PF" | "PJ") => {
    setTipo(newTipo);
    setDocumento("");
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!nome.trim()) {
      errors.nome = "O nome ou razão social é obrigatório.";
    }

    const cleanDoc = documento.replace(/\D/g, "");
    if (!cleanDoc) {
      errors.documento = "O documento é obrigatório.";
    } else if (tipo === "PF" && cleanDoc.length !== 11) {
      errors.documento = "CPF inválido. Deve conter 11 dígitos.";
    } else if (tipo === "PJ" && cleanDoc.length !== 14) {
      errors.documento = "CNPJ inválido. Deve conter 14 dígitos.";
    }

    if (!email.trim()) {
      errors.email = "O email é obrigatório.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.email = "Email com formato inválido.";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const success = onSave({
      nome,
      tipo,
      documento,
      email,
      telefone,
      cidade,
      estado,
      status,
    });

    if (success) {
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="w-full max-w-lg bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-4 shrink-0">
            <h3 className="text-base font-semibold">
              {isEditing ? `Editar Cadastro - ${clienteExistente?.id}` : "Cadastrar Novo Cliente"}
            </h3>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground text-sm font-semibold"
            >
              Cancelar
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[80vh]">
            {/* Global API/Uniqueness Error Alert */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-destructive/15 text-destructive text-xs font-semibold flex items-center gap-2 border border-destructive/20 animate-pulse">
                <AlertOctagon className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Nome / Razão Social */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Nome Completo / Razão Social <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Carlos Oliveira ou Empresa XYZ Ltda"
                className={cn(
                  "w-full bg-accent/40 border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm transition-all",
                  validationErrors.nome ? "border-destructive" : "border-border"
                )}
              />
              {validationErrors.nome && (
                <p className="text-[10px] text-destructive font-semibold">{validationErrors.nome}</p>
              )}
            </div>

            {/* Tipo and Documento Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Tipo */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Tipo de Pessoa</label>
                <div className="flex gap-2 h-[38px] items-center">
                  <button
                    type="button"
                    disabled={isDocLocked}
                    onClick={() => handleTipoChange("PF")}
                    className={cn(
                      "flex-1 text-center py-1.5 rounded-md text-xs font-semibold border transition-all h-full",
                      tipo === "PF"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-accent/40 hover:bg-accent border-border text-muted-foreground"
                    )}
                  >
                    Física (PF)
                  </button>
                  <button
                    type="button"
                    disabled={isDocLocked}
                    onClick={() => handleTipoChange("PJ")}
                    className={cn(
                      "flex-1 text-center py-1.5 rounded-md text-xs font-semibold border transition-all h-full",
                      tipo === "PJ"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-accent/40 hover:bg-accent border-border text-muted-foreground"
                    )}
                  >
                    Jurídica (PJ)
                  </button>
                </div>
              </div>

              {/* Documento (CPF/CNPJ) */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                  <span>
                    {tipo === "PF" ? "CPF" : "CNPJ"} <span className="text-destructive">*</span>
                  </span>
                  {isEditing && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold">
                      Campos fiscais bloqueados
                    </span>
                  )}
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    disabled={isDocLocked}
                    value={documento}
                    onChange={handleDocumentChange}
                    maxLength={tipo === "PF" ? 14 : 18}
                    placeholder={tipo === "PF" ? "000.000.000-00" : "00.000.000/0001-00"}
                    className={cn(
                      "w-full bg-accent/40 border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md pl-3 pr-10 py-2 text-sm font-mono transition-all",
                      isDocLocked && "opacity-60 bg-muted cursor-not-allowed",
                      validationErrors.documento ? "border-destructive" : "border-border"
                    )}
                  />
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => {
                        if (isDocLocked) {
                          setShowUnlockConfirm(true);
                        } else {
                          setIsDocLocked(true);
                        }
                      }}
                      className={cn(
                        "absolute right-2.5 p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground",
                        !isDocLocked && "text-emerald-500 hover:text-emerald-600"
                      )}
                      title={isDocLocked ? "Desbloquear documento" : "Bloquear documento"}
                    >
                      {isDocLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                    </button>
                  )}
                </div>
                {validationErrors.documento && (
                  <p className="text-[10px] text-destructive font-semibold">{validationErrors.documento}</p>
                )}
              </div>
            </div>

            {/* Email and Telefone Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  E-mail de Contato <span className="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  className={cn(
                    "w-full bg-accent/40 border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm transition-all",
                    validationErrors.email ? "border-destructive" : "border-border"
                  )}
                />
                {validationErrors.email && (
                  <p className="text-[10px] text-destructive font-semibold">{validationErrors.email}</p>
                )}
              </div>

              {/* Telefone */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Telefone</label>
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Cidade and Estado Row */}
            <div className="grid grid-cols-3 gap-4">
              {/* Cidade */}
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Cidade</label>
                <input
                  type="text"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Ex: Belo Horizonte"
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm"
                />
              </div>

              {/* Estado */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Estado (UF)</label>
                <input
                  type="text"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value.toUpperCase())}
                  maxLength={2}
                  placeholder="MG"
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm font-semibold text-center"
                />
              </div>
            </div>

            {/* Status Option */}
            <div className="space-y-1 pt-1">
              <label className="text-xs font-medium text-muted-foreground">Status do Cliente</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="ativo"
                    checked={status === "ativo"}
                    onChange={() => setStatus("ativo")}
                    className="accent-primary h-4 w-4"
                  />
                  Ativo
                </label>
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="inativo"
                    checked={status === "inativo"}
                    onChange={() => setStatus("inativo")}
                    className="accent-primary h-4 w-4"
                  />
                  Inativo
                </label>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-border flex justify-end gap-3 shrink-0">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="text-xs"
              >
                Voltar
              </Button>
              <Button type="submit" className="text-xs">
                {isEditing ? "Salvar Alterações" : "Salvar Cadastro"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Dialog for Unlocking Critical Field */}
      {showUnlockConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-card border border-border rounded-xl shadow-lg p-5 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-destructive/10 text-destructive shrink-0">
                <Lock className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-sm text-foreground">Alteração Fiscal Crítica</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Alterar o CPF ou CNPJ de um cliente existente pode afetar o histórico comercial, relatórios de faturamento e notas fiscais já geradas.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3 text-xs">
              <Button
                variant="ghost"
                onClick={() => setShowUnlockConfirm(false)}
                className="h-8"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  setIsDocLocked(false);
                  setShowUnlockConfirm(false);
                }}
                className="h-8 shadow-sm bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                Sim, Desbloquear
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

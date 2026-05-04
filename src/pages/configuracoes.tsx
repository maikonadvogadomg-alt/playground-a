import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Save, Database, Cpu, Key, CheckCircle, XCircle, Loader2, ArrowLeft, Shield, RefreshCw, FlaskConical, Zap, AlertCircle } from "lucide-react";
import { Link } from "wouter";

function MaskedInput({ value, onChange, placeholder, id, testId, disabled }: {
  value: string; onChange: (v: string) => void; placeholder?: string; id?: string; testId?: string; disabled?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input id={id} data-testid={testId} type={show ? "text" : "password"} value={value}
        onChange={e => onChange(e.target.value)} placeholder={placeholder}
        disabled={disabled}
        className="pr-9 font-mono text-xs h-9" autoComplete="off" />
      <button type="button" onClick={() => setShow(s => !s)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
        {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

function StatusDot({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1">
      {ok
        ? <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
        : <XCircle className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />}
      <span className={`text-[11px] ${ok ? "text-foreground font-medium" : "text-muted-foreground"}`}>{label}</span>
    </div>
  );
}

function detectProvider(key: string): string {
  if (!key) return "";
  if (key.startsWith("AIza")) return "Gemini ✓";
  if (key.startsWith("gsk_")) return "Groq ✓";
  if (key.startsWith("sk-ant-")) return "Anthropic ✓";
  if (key.startsWith("sk-or-")) return "OpenRouter ✓";
  if (key.startsWith("sk-")) return "OpenAI ✓";
  if (key.startsWith("pplx-")) return "Perplexity ✓";
  if (key.startsWith("or-")) return "OpenRouter ✓";
  if (key.length > 10) return "API personalizada";
  return "";
}

type SystemStatus = {
  dbMode: "postgres" | "memory";
  hasDbUrl: boolean;
  hasGeminiKey: boolean;
  hasOpenAiKey: boolean;
  hasPerplexityKey: boolean;
  hasDemoKey: boolean;
  hasAppPassword: boolean;
};

type AiConfig = {
  gemini_api_key: string;
  openai_api_key: string;
  perplexity_api_key: string;
  demo_api_key: string;
  demo_api_url: string;
  demo_api_model: string;
  database_url: string;
};

function lsGet(k: string) { try { return localStorage.getItem(k) || ""; } catch { return ""; } }
function lsSet(k: string, v: string) { try { if (v) localStorage.setItem(k, v); else localStorage.removeItem(k); } catch {} }

export default function Configuracoes() {
  const { toast } = useToast();
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [config, setConfig] = useState<AiConfig>({
    gemini_api_key: "", openai_api_key: "", perplexity_api_key: "",
    demo_api_key: "", demo_api_url: "", demo_api_model: "", database_url: "",
  });
  const [neonUrl, setNeonUrl] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingAi, setSavingAi] = useState(false);
  const [connectingDb, setConnectingDb] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, { ok: boolean; msg: string }>>({});

  // Chave Livre — só localStorage, zero servidor
  const [livreKey, setLivreKey] = useState(() => lsGet("custom_api_key"));
  const [livreUrl, setLivreUrl] = useState(() => lsGet("custom_api_url"));
  const [livreModel, setLivreModel] = useState(() => lsGet("custom_api_model"));
  const [livreSaved, setLivreSaved] = useState(false);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [cfgRes, statusRes] = await Promise.all([
        fetch("/api/settings/ai-config"),
        fetch("/api/settings/system-status"),
      ]);
      if (cfgRes.ok) { const d = await cfgRes.json(); setConfig(prev => ({ ...prev, ...d })); }
      if (statusRes.ok) setStatus(await statusRes.json());
    } catch {}
    setLoading(false);
  }

  function set(k: keyof AiConfig, v: string) { setConfig(prev => ({ ...prev, [k]: v })); }

  function saveLivre() {
    lsSet("custom_api_key", livreKey);
    lsSet("custom_api_url", livreUrl);
    lsSet("custom_api_model", livreModel);
    setLivreSaved(true);
    toast({ title: "Chave Livre salva!", description: "Só no navegador — zero servidor, zero Replit." });
    setTimeout(() => setLivreSaved(false), 2500);
  }

  async function testKey(field: string, keyValue: string, provider?: string) {
    if (!keyValue.trim()) {
      toast({ title: "Campo vazio", description: "Cole a chave antes de testar.", variant: "destructive" });
      return;
    }
    setTestingKey(field);
    setTestResult(prev => ({ ...prev, [field]: undefined as any }));
    try {
      const autoProvider = provider || (
        keyValue.startsWith("AIza") ? "gemini" :
        keyValue.startsWith("sk-") ? "openai" :
        keyValue.startsWith("gsk_") ? "groq" :
        keyValue.startsWith("pplx-") ? "perplexity" : "gemini"
      );
      const r = await fetch("/api/settings/test-ai-key", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: keyValue, provider: autoProvider }),
      });
      const data = await r.json();
      setTestResult(prev => ({ ...prev, [field]: { ok: data.ok, msg: data.message } }));
    } catch (e: any) {
      setTestResult(prev => ({ ...prev, [field]: { ok: false, msg: e.message } }));
    }
    setTestingKey(null);
  }

  async function saveAiKeys() {
    setSavingAi(true);
    try {
      const r = await fetch("/api/settings/ai-config", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (r.ok) {
        toast({ title: "Chaves salvas!", description: "Salvas no arquivo local do servidor." });
        loadAll();
      } else {
        const e = await r.json().catch(() => ({ message: "Erro" }));
        toast({ title: "Erro", description: e.message, variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
    setSavingAi(false);
  }

  async function connectDatabase() {
    const url = neonUrl.trim();
    if (!url) return;
    setConnectingDb(true);
    try {
      const r = await fetch("/api/settings/database-reconnect", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ database_url: url }),
      });
      const data = await r.json();
      if (r.ok) {
        toast({ title: "Banco conectado!", description: data.message });
        setNeonUrl("");
        loadAll();
      } else {
        toast({ title: "Erro ao conectar", description: data.message, variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
    setConnectingDb(false);
  }

  async function saveAppPassword() {
    if (!appPassword.trim()) return;
    setSavingPwd(true);
    try {
      const r = await fetch("/api/settings/app-password", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: appPassword }),
      });
      if (r.ok) { toast({ title: "Senha salva!" }); setAppPassword(""); loadAll(); }
      else { const e = await r.json().catch(() => ({ message: "Erro" })); toast({ title: "Erro", description: e.message, variant: "destructive" }); }
    } catch (e: any) { toast({ title: "Erro", description: e.message, variant: "destructive" }); }
    setSavingPwd(false);
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
    </div>
  );

  const isMemory = status?.dbMode === "memory";
  const livreProvider = detectProvider(livreKey);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-3 py-4 pb-20 space-y-3">

        {/* Header */}
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold leading-tight">Configurações</h1>
            <p className="text-[11px] text-muted-foreground truncate">Chaves de IA, banco de dados e acesso</p>
          </div>
          <Badge className={`text-[10px] px-2 py-0.5 shrink-0 ${isMemory ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"}`}>
            {isMemory ? "Memória" : "PostgreSQL"}
          </Badge>
          <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={loadAll} data-testid="button-refresh-status">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Status compacto */}
        <div className="grid grid-cols-4 gap-1.5 px-1">
          <StatusDot ok={!isMemory} label="Banco" />
          <StatusDot ok={!!status?.hasGeminiKey} label="Gemini" />
          <StatusDot ok={!!status?.hasOpenAiKey} label="OpenAI" />
          <StatusDot ok={!!status?.hasPerplexityKey} label="Perplexity" />
          <StatusDot ok={!!status?.hasDemoKey} label="Demo" />
          <StatusDot ok={!!livreKey} label="Livre" />
          <StatusDot ok={!!status?.hasAppPassword} label="Senha" />
        </div>

        {/* ── CHAVE LIVRE (navegador) ─────────────────────── */}
        <Card className="border-2 border-primary/20">
          <CardHeader className="py-2.5 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500 shrink-0" />
              <span>Chave Livre</span>
              <span className="ml-auto text-[10px] font-normal text-muted-foreground">Só no navegador</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Cole qualquer chave — Groq (gratuito!), Gemini, OpenAI, OpenRouter, Anthropic, custom.
              Fica <strong>só no seu celular/navegador</strong>. Zero servidor, zero Replit.
            </p>

            {/* Chave */}
            <div className="space-y-1">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <Label className="text-[11px] font-semibold">Chave API</Label>
                {livreProvider && (
                  <span className="text-[10px] text-green-600 dark:text-green-400 font-semibold">{livreProvider}</span>
                )}
              </div>
              <div className="flex gap-1.5">
                <div className="flex-1 min-w-0">
                  <MaskedInput value={livreKey} onChange={setLivreKey}
                    placeholder="AIzaSy... / sk-... / gsk_... / qualquer" testId="input-livre-key" />
                </div>
                <Button size="sm" variant="outline" className="h-9 px-2.5 shrink-0"
                  onClick={() => testKey("livre", livreKey)}
                  disabled={testingKey === "livre" || !livreKey.trim()}
                  data-testid="button-test-livre"
                  title="Testar chave">
                  {testingKey === "livre" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FlaskConical className="h-4 w-4" />}
                </Button>
              </div>
              {testResult.livre && (
                <p className={`text-[11px] px-2 py-1.5 rounded-md ${testResult.livre.ok ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300" : "bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400"}`}>
                  {testResult.livre.ok ? "✓ " : "✗ "}{testResult.livre.msg}
                </p>
              )}
            </div>

            {/* URL + Modelo — empilhados no celular */}
            <div className="space-y-2">
              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">URL da API <span className="text-muted-foreground/60">(deixe vazio para Gemini/OpenAI padrão)</span></Label>
                <Input value={livreUrl} onChange={e => setLivreUrl(e.target.value)}
                  placeholder="https://api.groq.com/openai/v1"
                  className="font-mono text-xs h-9" />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">Modelo <span className="text-muted-foreground/60">(deixe vazio para usar o padrão)</span></Label>
                <Input value={livreModel} onChange={e => setLivreModel(e.target.value)}
                  placeholder="llama-3.3-70b-versatile / gemini-2.0-flash"
                  className="font-mono text-xs h-9" />
              </div>
            </div>

            <div className="flex gap-2 pt-0.5">
              <Button onClick={saveLivre} size="sm" className="flex-1 h-9 text-xs gap-1.5"
                variant={livreSaved ? "outline" : "default"} data-testid="button-save-livre">
                {livreSaved ? <><CheckCircle className="h-3.5 w-3.5 text-green-500" />Salvo!</> : <><Save className="h-3.5 w-3.5" />Salvar no Navegador</>}
              </Button>
              {livreKey && (
                <Button size="sm" variant="ghost" className="h-9 text-xs text-muted-foreground" onClick={() => {
                  setLivreKey(""); setLivreUrl(""); setLivreModel("");
                  lsSet("custom_api_key", ""); lsSet("custom_api_url", ""); lsSet("custom_api_model", "");
                  toast({ title: "Chave Livre removida." });
                }}>Remover</Button>
              )}
            </div>

            {/* Links gratuitos */}
            <div className="text-[11px] bg-muted/50 rounded-lg px-3 py-2 space-y-1">
              <p className="font-semibold text-foreground/70 mb-1">Chaves gratuitas:</p>
              <p>• <strong>Groq</strong> (rápido, grátis): <a href="https://console.groq.com" target="_blank" rel="noreferrer" className="text-blue-500 underline">console.groq.com</a> → API Keys → Create</p>
              <p>• <strong>Gemini</strong> (Google, grátis): <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-500 underline">aistudio.google.com</a> → Get API Key</p>
            </div>
          </CardContent>
        </Card>

        {/* ── BANCO DE DADOS ──────────────────────────────── */}
        <Card>
          <CardHeader className="py-2.5 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-500 shrink-0" />
              <span>Banco de Dados</span>
              {!isMemory
                ? <CheckCircle className="h-3.5 w-3.5 text-green-500 ml-auto shrink-0" />
                : <AlertCircle className="h-3.5 w-3.5 text-yellow-500 ml-auto shrink-0" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2.5">
            {isMemory && (
              <div className="text-[11px] bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg px-3 py-2 text-yellow-800 dark:text-yellow-300">
                Usando <strong>memória</strong> — dados somem ao reiniciar. Conecte o Neon para persistir tudo.
              </div>
            )}
            {config.database_url && (
              <p className="text-[10px] font-mono bg-muted px-2 py-1.5 rounded text-muted-foreground break-all">
                {config.database_url.replace(/:([^:@]+)@/, ":***@")}
              </p>
            )}
            <div className="space-y-1">
              <Label className="text-[11px]">
                URL do Neon — <a href="https://neon.tech" target="_blank" rel="noreferrer" className="text-blue-500 underline">neon.tech</a> (gratuito)
              </Label>
              <Input data-testid="input-neon-url" type="password" value={neonUrl}
                onChange={e => setNeonUrl(e.target.value)}
                placeholder="postgresql://usuario:senha@ep-xxx.neon.tech/neondb"
                className="font-mono text-[11px] h-9" autoComplete="off" />
              <p className="text-[10px] text-muted-foreground">
                SSL é adicionado automaticamente para Neon. Copie a URL direto do painel do Neon.
              </p>
            </div>
            <Button data-testid="button-connect-db" onClick={connectDatabase}
              disabled={connectingDb || !neonUrl.trim()} className="w-full h-9 text-xs gap-1.5" size="sm">
              {connectingDb
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Conectando...</>
                : <><Database className="h-3.5 w-3.5" />Conectar e Criar Tabelas</>}
            </Button>
          </CardContent>
        </Card>

        {/* ── CHAVES DE IA (servidor) ─────────────────────── */}
        <Card>
          <CardHeader className="py-2.5 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Cpu className="h-4 w-4 text-purple-500 shrink-0" />
              <span>Chaves de IA — Servidor</span>
              <span className="ml-auto text-[10px] font-normal text-muted-foreground">Arquivo local</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            <p className="text-[11px] text-muted-foreground">
              Estas chaves ficam no servidor (arquivo local). Todos os usuários do app as usam.
              Para uso só seu, prefira a <strong>Chave Livre</strong> acima.
            </p>

            {/* Gemini */}
            <KeyField
              label="Gemini (Google)"
              link={{ href: "https://aistudio.google.com/app/apikey", text: "Grátis →" }}
              value={config.gemini_api_key}
              onChange={v => set("gemini_api_key", v)}
              placeholder="AIzaSy..."
              testId="input-gemini-key"
              testBtnId="button-test-gemini"
              testing={testingKey === "gemini"}
              result={testResult.gemini}
              onTest={() => testKey("gemini", config.gemini_api_key, "gemini")}
            />

            {/* OpenAI */}
            <KeyField
              label="OpenAI — GPT"
              link={{ href: "https://platform.openai.com/api-keys", text: "Obter →" }}
              value={config.openai_api_key}
              onChange={v => set("openai_api_key", v)}
              placeholder="sk-..."
              testId="input-openai-key"
              testBtnId="button-test-openai"
              testing={testingKey === "openai"}
              result={testResult.openai}
              onTest={() => testKey("openai", config.openai_api_key, "openai")}
            />

            {/* Perplexity */}
            <KeyField
              label="Perplexity"
              link={{ href: "https://www.perplexity.ai/settings/api", text: "Obter →" }}
              value={config.perplexity_api_key}
              onChange={v => set("perplexity_api_key", v)}
              placeholder="pplx-..."
              testId="input-perplexity-key"
              testBtnId="button-test-perplexity"
              testing={testingKey === "perplexity"}
              result={testResult.perplexity}
              onTest={() => testKey("perplexity", config.perplexity_api_key, "perplexity")}
            />

            <div className="border-t pt-2.5 space-y-2">
              <p className="text-[11px] font-semibold text-muted-foreground">Chave Demo — compartilhada com visitantes</p>
              <MaskedInput value={config.demo_api_key} onChange={v => set("demo_api_key", v)}
                placeholder="Qualquer chave OpenAI-compatível..." testId="input-demo-key" />
              <div className="space-y-1.5">
                <Input value={config.demo_api_url} onChange={e => set("demo_api_url", e.target.value)}
                  placeholder="URL: https://api.openai.com/v1" className="font-mono text-xs h-9" />
                <Input value={config.demo_api_model} onChange={e => set("demo_api_model", e.target.value)}
                  placeholder="Modelo: gpt-4o-mini" className="font-mono text-xs h-9" />
              </div>
            </div>

            <Button data-testid="button-save-ai" onClick={saveAiKeys} disabled={savingAi}
              className="w-full h-9 text-sm gap-1.5 font-semibold" size="sm">
              {savingAi
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Salvando...</>
                : <><Save className="h-3.5 w-3.5" />Salvar Chaves no Servidor</>}
            </Button>
          </CardContent>
        </Card>

        {/* ── ACESSO ──────────────────────────────────────── */}
        <Card>
          <CardHeader className="py-2.5 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-orange-500 shrink-0" />
              <span>Acesso ao App</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            <Label className="text-[11px] font-semibold">Senha de acesso</Label>
            <p className="text-[10px] text-muted-foreground">Deixe vazio = sem senha. Com senha, todos precisam digitar para entrar.</p>
            <div className="flex gap-1.5">
              <div className="flex-1">
                <MaskedInput value={appPassword} onChange={setAppPassword}
                  placeholder="Nova senha..." testId="input-app-password" />
              </div>
              <Button size="sm" className="h-9 px-3 shrink-0" onClick={saveAppPassword}
                disabled={savingPwd || !appPassword.trim()} data-testid="button-save-password">
                {savingPwd ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

function KeyField({ label, link, value, onChange, placeholder, testId, testBtnId, testing, result, onTest }: {
  label: string;
  link: { href: string; text: string };
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  testId: string;
  testBtnId: string;
  testing: boolean;
  result?: { ok: boolean; msg: string };
  onTest: () => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-[11px] font-semibold flex items-center gap-1">
          <Key className="h-3 w-3 shrink-0" /> {label}
        </Label>
        <a href={link.href} target="_blank" rel="noreferrer"
          className="text-[10px] text-blue-500 underline shrink-0">{link.text}</a>
      </div>
      <div className="flex gap-1.5">
        <div className="flex-1 min-w-0">
          <MaskedInput value={value} onChange={onChange} placeholder={placeholder} testId={testId} />
        </div>
        <Button size="sm" variant="outline" className="h-9 px-2.5 shrink-0"
          onClick={onTest} disabled={testing || !value.trim()} data-testid={testBtnId} title="Testar chave">
          {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FlaskConical className="h-3.5 w-3.5" />}
        </Button>
      </div>
      {result && (
        <p className={`text-[11px] px-2 py-1.5 rounded-md ${result.ok ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300" : "bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400"}`}>
          {result.ok ? "✓ " : "✗ "}{result.msg}
        </p>
      )}
    </div>
  );
}

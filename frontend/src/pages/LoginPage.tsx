import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PinInput } from '../components/ui/PinInput';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { AuthUser } from '../types';

const DISCORD_BOT_URL = 'https://discord.com/users/1540424028471169125';
const DISCORD_INVITE_URL = 'https://discord.com/oauth2/authorize?client_id=1540424028471169125&permissions=8&integration_type=0&scope=bot+applications.commands';

type Step = 'pin' | 'discord_required' | 'discord_confirm';

function IconLink() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto var(--space-4)' }}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto var(--space-4)' }}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function IconDiscord() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

export function LoginPage() {
  const { user, token, setSession, loading: authLoading } = useAuth();
  const navigate  = useNavigate();

  const [step, setStep]         = useState<Step>('pin');
  const [pin, setPin]           = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [showToken, setShowToken]   = useState(false);
  const [code, setCode]         = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [message, setMessage]   = useState('');

  // Se já estiver logado, redireciona direto sem exibir o formulário
  useEffect(() => {
    if (!authLoading && user && token) {
      if (user.role === 'ROOT') {
        navigate('/root/equipes', { replace: true });
      } else {
        navigate('/tarefas', { replace: true });
      }
    }
  }, [authLoading, user, token, navigate]);

  // Limpa mensagem de erro automaticamente após 4 segundos
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(''), 4000);
    return () => clearTimeout(timer);
  }, [error]);

  const handlePinChange = (v: string) => {
    setPin(v);
    if (error) setError('');
    setShowToken(v === '000000');
    if (v !== '000000') setAdminToken('');
  };

  // ── Passo 1: submete PIN ─────────────────────────────────────────────────
  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 6) return setError('Digite os 6 dígitos do PIN.');
    if (showToken && !adminToken) return setError('Token administrativo é obrigatório.');
    setLoading(true); setError('');

    try {
      const res = await authService.login(pin, showToken ? adminToken : undefined);

      if (res.status === 'ok' && res.token && res.user) {
        // Root entra direto sem chamada duplicada
        setSession(res.token, res.user as AuthUser);
        navigate('/root/equipes', { replace: true });
        return;
      }

      if (res.status === 'discord_required') {
        setMessage(res.message ?? '');
        setStep('discord_required');
        return;
      }

      if (res.status === 'discord_confirmation_required') {
        setMessage(res.message ?? '');
        setStep('discord_confirm');
        return;
      }
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } }).response?.data?.error;
      setError(msg ?? 'PIN ou token inválido.');
    } finally { setLoading(false); }
  };

  // ── Passo 3: confirma código Discord ────────────────────────────────────
  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length < 6) return setError('Digite o código de 6 caracteres.');
    setLoading(true); setError('');

    try {
      const res = await authService.confirmar(code.trim());
      if (res.status === 'ok' && res.token && res.user) {
        setSession(res.token, res.user as AuthUser);
        navigate('/minhas-tarefas', { replace: true });
        return;
      }
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } }).response?.data?.error;
      setError(msg ?? 'Código inválido ou expirado.');
    } finally { setLoading(false); }
  };

  // ── Verifica se o usuário já realizou o vínculo no Discord ────────────────
  const handleVerificarVinculo = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authService.login(pin);
      if (res.status === 'ok' && res.token && res.user) {
        setSession(res.token, res.user as AuthUser);
        navigate('/minhas-tarefas', { replace: true });
        return;
      }
      if (res.status === 'discord_confirmation_required') {
        setMessage(res.message ?? '');
        setStep('discord_confirm');
        return;
      }
      if (res.status === 'discord_required') {
        setError('O vínculo ainda não foi concluído no Discord. Envie seu PIN por mensagem privada para o bot.');
      }
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } }).response?.data?.error;
      setError(msg ?? 'Erro ao verificar vínculo no Discord.');
    } finally { setLoading(false); }
  };

  const handleVoltar = () => {
    setStep('pin');
    setPin('');
    setCode('');
    setError('');
    setMessage('');
    setShowToken(false);
    setAdminToken('');
  };

  // ════════════════════════════════════════════════════════════════════════
  return (
    <div className="login-page">
      <div className="login-card">

        {/* ── PASSO 1: PIN ────────────────────────────────────────────── */}
        {step === 'pin' && (
          <>
            <img src="/logoklg.png" alt="KLG" className="login-logo-img" />
            <h1 className="login-title">Portal de Tarefas</h1>
            <p className="login-sub">Digite seu PIN de 6 dígitos para acessar a plataforma</p>

            <form onSubmit={handlePinSubmit} autoComplete="off">
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <PinInput value={pin} onChange={handlePinChange} disabled={loading} />
              </div>

              {showToken && (
                <div className="form-group" style={{ marginBottom: 'var(--space-4)', textAlign: 'left' }}>
                  <label className="form-label">Token Administrativo</label>
                  <input
                    id="root-admin-token"
                    type="password"
                    className="form-input"
                    value={adminToken}
                    onChange={e => { setAdminToken(e.target.value); if (error) setError(''); }}
                    placeholder="Token secreto do Root"
                    autoComplete="new-password"
                    spellCheck={false}
                    autoFocus
                  />
                </div>
              )}

              {error && <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)', textAlign: 'left' }}>{error}</div>}

              <button
                type="submit"
                disabled={loading || pin.length < 6}
                className="login-submit-btn"
              >
                {loading ? (
                  <>
                    <span className="spinner" style={{ width: 15, height: 15, borderWidth: 2 }} />
                    <span>Acessando...</span>
                  </>
                ) : (
                  <>
                    <span>Acessar Plataforma →</span>
                  </>
                )}
              </button>
            </form>

            <p style={{ marginTop: 'var(--space-6)', fontSize: 'var(--font-xs)', color: 'var(--stone-400)', lineHeight: 1.6 }}>
              Acesso restrito a colaboradores autorizados.
            </p>
          </>
        )}

        {/* ── PASSO 2: Discord não vinculado ──────────────────────────── */}
        {step === 'discord_required' && (
          <>
            <IconLink />
            <h1 className="login-title" style={{ fontSize: 'var(--font-lg)' }}>Vincule seu Discord</h1>
            <p className="login-sub" style={{ marginBottom: 'var(--space-4)' }}>
              Para acessar o portal, vincule sua conta do Discord uma única vez por mensagem privada.
            </p>

            <a
              href="discord://-/users/1540424028471169125"
              className="btn btn-primary full-width"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-2)',
                marginBottom: 'var(--space-4)',
                background: '#5865F2',
                borderColor: '#4752C4',
                color: '#fff',
                height: 44,
                fontWeight: 600,
                fontSize: 'var(--font-sm)',
              }}
            >
              <IconDiscord />
              <span>Abrir no App do Discord</span>
            </a>

            <div style={{
              background: 'var(--stone-50)',
              border: '1px solid var(--stone-200)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-4) var(--space-5)',
              textAlign: 'left',
              marginBottom: 'var(--space-4)',
            }}>
              <p style={{ fontSize: 'var(--font-sm)', color: 'var(--stone-700)', marginBottom: 'var(--space-2)' }}>
                Envie apenas o seu PIN por <strong>mensagem privada (DM)</strong> para o bot <strong>Portal de Tarefas</strong>:
              </p>

              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--stone-200)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{
                  fontFamily: "'SF Mono', 'Fira Code', monospace",
                  fontSize: 'var(--font-md)',
                  fontWeight: 700,
                  color: 'var(--stone-900)',
                  letterSpacing: '0.15em',
                }}>
                  {pin}
                </span>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(pin)}
                  style={{
                    background: 'var(--stone-100)',
                    border: '1px solid var(--stone-200)',
                    color: 'var(--stone-700)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '4px 10px',
                    fontSize: 'var(--font-xs)',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Copiar PIN
                </button>
              </div>
            </div>

            {error && <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)', textAlign: 'left' }}>{error}</div>}

            <Button
              variant="primary"
              className="full-width"
              style={{ marginBottom: 'var(--space-2)' }}
              loading={loading}
              onClick={handleVerificarVinculo}
            >
              Já enviei no Discord, entrar no portal →
            </Button>
            <Button
              variant="ghost"
              className="full-width"
              onClick={handleVoltar}
            >
              ← Digitar outro PIN
            </Button>
          </>
        )}

        {/* ── PASSO 3: Confirmação de código Discord ───────────────────── */}
        {step === 'discord_confirm' && (
          <>
            <IconMail />
            <h1 className="login-title" style={{ fontSize: 'var(--font-lg)' }}>Confirme no Discord</h1>
            <p className="login-sub" style={{ marginBottom: 'var(--space-6)' }}>
              Um código de confirmação foi enviado para o seu Discord.<br />
              Digite-o abaixo para concluir o acesso.
            </p>

            <form onSubmit={handleCodeSubmit}>
              <div className="form-group" style={{ marginBottom: 'var(--space-5)', textAlign: 'left' }}>
                <label className="form-label">Código de confirmação</label>
                <input
                  id="discord-code"
                  className="form-input"
                  value={code}
                  onChange={e => { setCode(e.target.value.toUpperCase()); if (error) setError(''); }}
                  placeholder="A3F7K2"
                  maxLength={6}
                  autoFocus
                  style={{
                    textAlign: 'center',
                    fontSize: 'var(--font-xl)',
                    fontWeight: 700,
                    letterSpacing: '0.3em',
                    fontFamily: "'SF Mono', 'Fira Code', monospace",
                  }}
                />
                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--stone-400)', marginTop: 'var(--space-1)', textAlign: 'center' }}>
                  O código expira em 5 minutos.
                </p>
              </div>

              {error && <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)', textAlign: 'left' }}>{error}</div>}

              <button
                type="submit"
                disabled={loading || code.trim().length < 6}
                className="login-submit-btn"
              >
                {loading ? (
                  <>
                    <span className="spinner" style={{ width: 15, height: 15, borderWidth: 2 }} />
                    <span>Confirmando...</span>
                  </>
                ) : (
                  <>
                    <span>Confirmar Acesso</span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
              <a
                href={DISCORD_BOT_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 'var(--font-xs)',
                  color: '#5865F2',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-family)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4
                }}
              >
                <IconDiscord />
                <span>Abrir conversa com o Bot no Discord ↗</span>
              </a>

              <button
                onClick={handleVoltar}
                style={{ background: 'none', border: 'none', color: 'var(--stone-400)', fontSize: 'var(--font-xs)', cursor: 'pointer', fontFamily: 'var(--font-family)', padding: 4 }}
              >
                Voltar ao login
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

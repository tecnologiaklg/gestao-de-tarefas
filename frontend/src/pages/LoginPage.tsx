import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PinInput } from '../components/ui/PinInput';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

type Step = 'pin' | 'discord_required' | 'discord_confirm';

export function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [step, setStep]         = useState<Step>('pin');
  const [pin, setPin]           = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [showToken, setShowToken]   = useState(false);
  const [code, setCode]         = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [message, setMessage]   = useState('');

  const handlePinChange = (v: string) => {
    setPin(v);
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
        // Root entra direto
        await login(pin, showToken ? adminToken : undefined);
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
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        // Força reload do contexto e redireciona
        window.location.href = '/minhas-tarefas';
      }
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } }).response?.data?.error;
      setError(msg ?? 'Código inválido ou expirado.');
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
            <div className="login-logo">GT</div>
            <h1 className="login-title">Portal de Tarefas</h1>
            <p className="login-sub">Digite seu PIN de 6 dígitos para entrar</p>

            <form onSubmit={handlePinSubmit}>
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
                    onChange={e => setAdminToken(e.target.value)}
                    placeholder="Token secreto do Root"
                    autoFocus
                  />
                </div>
              )}

              {error && <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)', textAlign: 'left' }}>{error}</div>}

              <Button type="submit" variant="primary" loading={loading} className="full-width btn-lg">
                Entrar
              </Button>
            </form>
          </>
        )}

        {/* ── PASSO 2: Discord não vinculado ──────────────────────────── */}
        {step === 'discord_required' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 'var(--space-4)' }}>🔗</div>
            <h1 className="login-title" style={{ fontSize: 'var(--font-xl)' }}>Vincule seu Discord</h1>
            <p className="login-sub" style={{ marginBottom: 'var(--space-6)' }}>
              Você ainda não vinculou sua conta Discord.<br />
              <strong>É obrigatório para acessar o sistema.</strong>
            </p>

            <div style={{
              background: 'var(--slate-50)',
              border: '1px solid var(--slate-200)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-5)',
              textAlign: 'left',
              marginBottom: 'var(--space-6)',
            }}>
              <p style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--slate-700)', marginBottom: 'var(--space-3)' }}>
                📱 Como vincular:
              </p>
              <ol style={{ fontSize: 'var(--font-sm)', color: 'var(--slate-600)', paddingLeft: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <li>Abra o Discord e localize o <strong>bot do portal</strong></li>
                <li>Envie a mensagem:</li>
              </ol>
              <div style={{
                background: 'var(--slate-800)',
                color: '#7CFC00',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3)',
                fontFamily: 'monospace',
                fontSize: 'var(--font-base)',
                marginTop: 'var(--space-3)',
                textAlign: 'center',
                letterSpacing: '0.05em',
              }}>
                /vincular &lt;seu PIN&gt;
              </div>
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--slate-400)', marginTop: 'var(--space-3)', textAlign: 'center' }}>
                Após vincular, volte aqui e faça login normalmente.
              </p>
            </div>

            <Button variant="secondary" className="full-width" onClick={handleVoltar}>
              ← Voltar ao login
            </Button>
          </>
        )}

        {/* ── PASSO 3: Confirmação de código Discord ───────────────────── */}
        {step === 'discord_confirm' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 'var(--space-4)' }}>📨</div>
            <h1 className="login-title" style={{ fontSize: 'var(--font-xl)' }}>Confirme no Discord</h1>
            <p className="login-sub" style={{ marginBottom: 'var(--space-6)' }}>
              Um código de confirmação foi enviado para o seu Discord.<br />
              Digite-o abaixo para concluir o login.
            </p>

            <form onSubmit={handleCodeSubmit}>
              <div className="form-group" style={{ marginBottom: 'var(--space-5)', textAlign: 'left' }}>
                <label className="form-label">Código de confirmação</label>
                <input
                  id="discord-code"
                  className="form-input"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="Ex: A3F7K2"
                  maxLength={6}
                  autoFocus
                  style={{
                    textAlign: 'center',
                    fontSize: 'var(--font-xl)',
                    fontWeight: 700,
                    letterSpacing: '0.3em',
                    fontFamily: 'monospace',
                  }}
                />
                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--slate-400)', marginTop: 'var(--space-1)' }}>
                  O código expira em 5 minutos.
                </p>
              </div>

              {error && <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)', textAlign: 'left' }}>{error}</div>}

              <Button type="submit" variant="primary" loading={loading} className="full-width btn-lg">
                ✓ Confirmar acesso
              </Button>
            </form>

            <button
              onClick={handleVoltar}
              style={{ background: 'none', border: 'none', color: 'var(--slate-400)', fontSize: 'var(--font-sm)', marginTop: 'var(--space-4)', cursor: 'pointer' }}
            >
              Não recebi o código — voltar
            </button>
          </>
        )}

      </div>
    </div>
  );
}

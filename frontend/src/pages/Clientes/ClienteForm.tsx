import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { PageHeader } from '../../components/PageHeader';
import { Select } from '../../components/Select';
import { api, extractApiError } from '../../lib/api';
import { Cliente } from '../../types';

const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

export function ClienteForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numeroEndereco, setNumeroEndereco] = useState('');
  const [bairro, setBairro] = useState('');
  const [complemento, setComplemento] = useState('');
  const [cep, setCep] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit || !id) return;
    api.get<Cliente>(`/clientes/${id}`).then((res) => {
      const c = res.data;
      setNome(c.nome);
      setCpf(c.cpf);
      setTelefone(c.telefone);
      setEmail(c.email ?? '');
      setLogradouro(c.logradouro ?? '');
      setNumeroEndereco(c.numeroEndereco ?? '');
      setBairro(c.bairro ?? '');
      setComplemento(c.complemento ?? '');
      setCep(c.cep ?? '');
      setCidade(c.cidade ?? '');
      setEstado(c.estado ?? '');
    });
  }, [isEdit, id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        nome,
        cpf,
        telefone,
        email: email || undefined,
        logradouro,
        numeroEndereco,
        bairro,
        complemento: complemento || undefined,
        cep,
        cidade,
        estado,
      };
      if (isEdit && id) {
        await api.put(`/clientes/${id}`, payload);
      } else {
        await api.post('/clientes', payload);
      }
      navigate('/clientes');
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    if (!confirm('Excluir este cliente?')) return;
    try {
      await api.delete(`/clientes/${id}`);
      navigate('/clientes');
    } catch (err) {
      setError(extractApiError(err));
    }
  }

  return (
    <div className="max-w-3xl">
      <PageHeader title={isEdit ? 'Editar cliente' : 'Novo cliente'} back />
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-md border border-slate-200 bg-white p-5"
      >
        <section>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Dados pessoais</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
            <Input
              label="CPF (apenas dígitos)"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              required
              maxLength={14}
            />
            <Input
              label="Telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Endereço</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <Input
                label="Logradouro"
                placeholder="Rua, avenida, etc."
                value={logradouro}
                onChange={(e) => setLogradouro(e.target.value)}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Input
                label="Número"
                value={numeroEndereco}
                onChange={(e) => setNumeroEndereco(e.target.value)}
                required
              />
            </div>
            <div className="sm:col-span-3">
              <Input
                label="Bairro"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                required
              />
            </div>
            <div className="sm:col-span-3">
              <Input
                label="Complemento (opcional)"
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Input
                label="CEP (8 dígitos)"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                required
                maxLength={9}
              />
            </div>
            <div className="sm:col-span-3">
              <Input
                label="Cidade"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                required
              />
            </div>
            <div className="sm:col-span-1">
              <Select
                label="UF"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                options={UFS.map((uf) => ({ value: uf, label: uf }))}
                placeholder="--"
                required
              />
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-between">
          <div>
            {isEdit && (
              <Button type="button" variant="danger" onClick={handleDelete}>
                Excluir
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../../components/Button';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { Table } from '../../components/Table';
import { api, extractApiError } from '../../lib/api';
import { formatCPF, formatDate, formatMoney } from '../../lib/format';
import { Cliente, Contrato } from '../../types';

interface ClienteFull extends Cliente {
  contratos: Array<
    Contrato & {
      lote: {
        id: string;
        numero: string;
        quadra: { id: string; nome: string };
      };
    }
  >;
}

function formatCep(cep: string | null) {
  if (!cep) return '-';
  const d = cep.replace(/\D/g, '');
  if (d.length !== 8) return cep;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

function buildEndereco(c: ClienteFull): string {
  const partes: string[] = [];
  if (c.logradouro) partes.push(c.logradouro);
  if (c.numeroEndereco) partes.push(`nº ${c.numeroEndereco}`);
  if (c.complemento) partes.push(c.complemento);
  if (c.bairro) partes.push(c.bairro);
  if (c.cidade && c.estado) partes.push(`${c.cidade}/${c.estado}`);
  return partes.length > 0 ? partes.join(' · ') : '-';
}

export function ClienteDetalhe() {
  const { id } = useParams<{ id: string }>();
  const [cliente, setCliente] = useState<ClienteFull | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api
      .get<ClienteFull>(`/clientes/${id}`)
      .then((res) => setCliente(res.data))
      .catch((e) => setError(extractApiError(e)));
  }, [id]);

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {error}
      </div>
    );
  }
  if (!cliente) return <p className="text-slate-500">Carregando...</p>;

  return (
    <div>
      <PageHeader
        back
        title={cliente.nome}
        subtitle={`Cliente desde ${formatDate(cliente.createdAt)}`}
        actions={
          <Link to={`/clientes/${cliente.id}/editar`}>
            <Button>Editar</Button>
          </Link>
        }
      />

      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold text-slate-700">Dados pessoais</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Info label="Nome" value={cliente.nome} />
          <Info label="CPF" value={formatCPF(cliente.cpf)} />
          <Info label="Telefone" value={cliente.telefone} />
          <Info label="Email" value={cliente.email ?? '-'} />
        </div>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold text-slate-700">Endereço</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Info label="Logradouro" value={cliente.logradouro ?? '-'} />
          <Info label="Número" value={cliente.numeroEndereco ?? '-'} />
          <Info label="Bairro" value={cliente.bairro ?? '-'} />
          <Info label="Complemento" value={cliente.complemento ?? '-'} />
          <Info label="CEP" value={formatCep(cliente.cep)} />
          <Info
            label="Cidade/UF"
            value={cliente.cidade && cliente.estado ? `${cliente.cidade}/${cliente.estado}` : '-'}
          />
        </div>
        <p className="mt-3 text-xs text-slate-500">{buildEndereco(cliente)}</p>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-slate-700">Contratos</h2>
        <Table
          data={cliente.contratos}
          keyExtractor={(c) => c.id}
          emptyMessage="Nenhum contrato deste cliente."
          columns={[
            { header: 'Data', cell: (c) => formatDate(c.dataVenda) },
            {
              header: 'Lote',
              cell: (c) => (
                <Link to={`/quadras/${c.lote.quadra.id}`} className="text-primary-600 hover:underline">
                  Quadra {c.lote.quadra.nome} • Lote {c.lote.numero}
                </Link>
              ),
            },
            { header: 'Valor total', cell: (c) => formatMoney(c.valorTotal) },
            { header: 'Parcelas', cell: (c) => c.numParcelas },
            { header: 'Status', cell: (c) => <StatusBadge status={c.status} /> },
            {
              header: '',
              cell: (c) => (
                <Link to={`/contratos/${c.id}`} className="text-xs text-primary-600 hover:underline">
                  Ver contrato
                </Link>
              ),
            },
          ]}
        />
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-1 text-sm font-medium text-slate-800">{value}</div>
    </div>
  );
}

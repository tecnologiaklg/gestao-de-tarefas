// services/SetorService.ts
import { SetorRepository } from '../repositories/SetorRepository';
import { LogRepository } from '../repositories/LogRepository';
import { NotFoundError, ConflictError } from '../errors/AppError';

export const SetorService = {
  listar: () => SetorRepository.findAll(),

  criar: async (nome: string, reqUserId?: number | null) => {
    const existente = await SetorRepository.findByNome(nome);
    if (existente) throw new ConflictError('Setor com esse nome já existe');
    const setor = await SetorRepository.create(nome);
    await LogRepository.registrar({ usuario_id: reqUserId ?? null, tipo_evento: 'CRIACAO_SETOR', descricao: `Setor '${nome}' criado` });
    return setor;
  },

  atualizar: async (id: number, nome: string, reqUserId?: number | null) => {
    const setor = await SetorRepository.findById(id);
    if (!setor) throw new NotFoundError('Setor não encontrado');
    const existente = await SetorRepository.findByNome(nome);
    if (existente && existente.id !== id) throw new ConflictError('Já existe um setor com esse nome');
    const atualizado = await SetorRepository.update(id, nome);
    await LogRepository.registrar({
      usuario_id: reqUserId ?? null, tipo_evento: 'EDICAO_SETOR',
      valor_antes: setor.nome, valor_depois: nome,
    });
    return atualizado;
  },
};

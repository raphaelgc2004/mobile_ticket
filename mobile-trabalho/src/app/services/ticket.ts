import { Injectable } from '@angular/core';

export interface Ticket {
  id: string; // ex: 251129-SP01
  tipo: 'SP' | 'SG' | 'SE';
  dataEmissao: Date;
  status: 'aguardando' | 'atendido' | 'desistiu';
  // Campos úteis para relatórios
  dataAtendimento?: Date;
  guiche?: string | number;
  sequencia?: number; // sequência diária por tipo
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  // As filas onde as senhas ficam guardadas
  private filaSP: Ticket[] = [];
  private filaSE: Ticket[] = [];
  private filaSG: Ticket[] = [];

  // Onde guardamos o histórico para o painel (últimos 5 chamados)
  public ultimosChamados: Ticket[] = [];

  // Controle de prioridade (alternância controlada)
  private proximaPrioridade: 'SP' | 'SE' | 'SG' = 'SP';

  // Persistência de sequências diárias (para reiniciar ao mudar o dia)
  private sequencesKey = 'ticket_sequences_v1';
  private sequences: { date: string; SP: number; SG: number; SE: number } = {
    date: '',
    SP: 0,
    SG: 0,
    SE: 0
  };

  constructor() {
    // Carrega as sequências do storage quando o serviço é inicializado
    this.loadSequences();
  }

  // -------------------------
  // Gerenciamento de sequências
  // -------------------------
  private loadSequences() {
    try {
      const raw = localStorage.getItem(this.sequencesKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          parsed &&
          typeof parsed.date === 'string' &&
          typeof parsed.SP === 'number' &&
          typeof parsed.SG === 'number' &&
          typeof parsed.SE === 'number'
        ) {
          this.sequences = parsed;
          // Garante que se a data do registro for diferente da data atual reiniciamos
          this.ensureToday();
          return;
        }
      }
    } catch (e) {
      console.warn('[TicketService] Erro ao carregar sequences do localStorage:', e);
    }

    // Se nada válido, inicializa com o dia de hoje
    this.sequences = { date: this.formatYYMMDD(new Date()), SP: 0, SG: 0, SE: 0 };
    this.saveSequences();
  }

  private saveSequences() {
    try {
      localStorage.setItem(this.sequencesKey, JSON.stringify(this.sequences));
    } catch (e) {
      console.warn('[TicketService] Erro ao salvar sequences no localStorage:', e);
    }
  }

  private ensureToday() {
    const hoje = this.formatYYMMDD(new Date());
    if (this.sequences.date !== hoje) {
      this.sequences = { date: hoje, SP: 0, SG: 0, SE: 0 };
      this.saveSequences();
    }
  }

  private formatYYMMDD(d: Date) {
    const yy = d.getFullYear().toString().slice(-2);
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    return `${yy}${mm}${dd}`;
  }

  // -------------------------
  // Geração de senha (Totem)
  // -------------------------
  public gerarSenha(tipo: 'SP' | 'SG' | 'SE'): Ticket {
    // garante sequência do dia atual
    this.ensureToday();

    // incrementa a sequência do tipo
    this.sequences[tipo] = (this.sequences[tipo] || 0) + 1;
    this.saveSequences();

    const seqNumber = this.sequences[tipo];
    const seqStr = seqNumber.toString().padStart(2, '0'); // 01, 02, ...
    const datePart = this.formatYYMMDD(new Date());
    const id = `${datePart}-${tipo}${seqStr}`;

    const ticket: Ticket = {
      id,
      tipo,
      dataEmissao: new Date(),
      status: 'aguardando',
      sequencia: seqNumber
    };

    // salva na fila correspondente
    if (tipo === 'SP') this.filaSP.push(ticket);
    else if (tipo === 'SE') this.filaSE.push(ticket);
    else this.filaSG.push(ticket);

    console.log(`[TicketService] Senha gerada: ${id}`, 'Tamanhos filas:', this.getTamanhoFilas());
    return ticket;
  }

  // -------------------------
  // Chamar próximo (Guichê)
  // -------------------------
  /**
   * chamaProximo
   * - procura um ticket seguindo a prioridade atual (proximaPrioridade)
   * - altera proximaPrioridade para a próxima na sequência quando retorna um ticket
   * - se não encontrar, faz até 3 tentativas (passando pelas prioridades)
   */
  chamarProximo(): Ticket | null {
    for (let i = 0; i < 3; i++) {
      if (this.proximaPrioridade === 'SP') {
        if (this.filaSP.length > 0) {
          // depois de atender SP, a próxima prioridade será SE
          this.proximaPrioridade = 'SE';
          return this.finalizarAtendimento(this.filaSP.shift()!);
        }
        this.proximaPrioridade = 'SE';
      } else if (this.proximaPrioridade === 'SE') {
        if (this.filaSE.length > 0) {
          // depois de atender SE, próxima será SG
          this.proximaPrioridade = 'SG';
          return this.finalizarAtendimento(this.filaSE.shift()!);
        }
        this.proximaPrioridade = 'SG';
      } else if (this.proximaPrioridade === 'SG') {
        if (this.filaSG.length > 0) {
          // depois de atender SG, próxima será SP
          this.proximaPrioridade = 'SP';
          return this.finalizarAtendimento(this.filaSG.shift()!);
        }
        this.proximaPrioridade = 'SP';
      }
    }
    return null;
  }

  // -------------------------
  // Finalizar atendimento
  // -------------------------
  private finalizarAtendimento(ticket: Ticket): Ticket {
    // 5% de chance de desistir (simula cliente que não foi atendido)
    if (Math.random() < 0.05) {
      ticket.status = 'desistiu';
      // não registra como atendido no painel; chama o próximo
      const proximo = this.chamarProximo();
      return proximo ? proximo : ticket;
    }

    // marca como atendido
    ticket.status = 'atendido';
    ticket.dataAtendimento = new Date();

    
    this.ultimosChamados.unshift(ticket);
    if (this.ultimosChamados.length > 5) this.ultimosChamados.pop();

    return ticket;
  }

 
  getTamanhoFilas() {
    return {
      sp: this.filaSP.length,
      se: this.filaSE.length,
      sg: this.filaSG.length,
      total: this.filaSP.length + this.filaSE.length + this.filaSG.length
    };
  }

  // Função opcional que permite limpar filas 
  clearAll() {
    this.filaSP = [];
    this.filaSE = [];
    this.filaSG = [];
    this.ultimosChamados = [];
    // reset sequences (!!!)
    this.sequences = { date: this.formatYYMMDD(new Date()), SP: 0, SG: 0, SE: 0 };
    this.saveSequences();
  }
}

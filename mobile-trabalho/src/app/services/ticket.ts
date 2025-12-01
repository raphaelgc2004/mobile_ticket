import { Injectable } from '@angular/core';

export interface Ticket {
  id: string; 
  tipo: 'SP' | 'SG' | 'SE';
  dataEmissao: Date;
  status: 'aguardando' | 'atendido' | 'desistiu';
  
  dataAtendimento?: Date;
  guiche?: string | number;
  sequencia?: number;
  tempoDespendido?: number; 
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  private filaSP: Ticket[] = [];
  private filaSE: Ticket[] = [];
  private filaSG: Ticket[] = [];

  public ultimosChamados: Ticket[] = [];

  public historicoGeral: Ticket[] = [];

  private proximaPrioridade: 'SP' | 'SE' | 'SG' = 'SP';

  private sequencesKey = 'ticket_sequences_v1';
  private historyKey = 'historico_atendimento_dia';

  private sequences: { date: string; SP: number; SG: number; SE: number } = {
    date: '', SP: 0, SG: 0, SE: 0
  };

  constructor() {
    this.loadSequences();
    this.loadHistorico(); 
  }

  private loadSequences() {
    try {
      const raw = localStorage.getItem(this.sequencesKey);
      if (raw) {
        this.sequences = JSON.parse(raw);
        this.ensureToday(); // Verifica se virou o dia
      } else {
        this.sequences = { date: this.formatYYMMDD(new Date()), SP: 0, SG: 0, SE: 0 };
      }
    } catch (e) {
      console.warn('Erro ao carregar sequências', e);
    }
  }

  private loadHistorico() {
    const salvo = localStorage.getItem(this.historyKey);
    if (salvo) {
      this.historicoGeral = JSON.parse(salvo);
    }
  }

  private saveSequences() {
    localStorage.setItem(this.sequencesKey, JSON.stringify(this.sequences));
  }

  private saveHistorico() {
    localStorage.setItem(this.historyKey, JSON.stringify(this.historicoGeral));
  }

  
  private ensureToday() {
    const hoje = this.formatYYMMDD(new Date());
    if (this.sequences.date !== hoje) {
      this.sequences = { date: hoje, SP: 0, SG: 0, SE: 0 };
      this.saveSequences();
      
    
      this.historicoGeral = [];
      localStorage.removeItem(this.historyKey);
    }
  }

  // formato da senha em ano/mês/dia/numero/tipo
  private formatYYMMDD(d: Date) {
    const yy = d.getFullYear().toString().slice(-2);
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    return `${yy}${mm}${dd}`; 
  }


  public gerarSenha(tipo: 'SP' | 'SG' | 'SE'): Ticket {
    this.ensureToday();
    this.sequences[tipo] = (this.sequences[tipo] || 0) + 1;
    this.saveSequences();

    const seqNumber = this.sequences[tipo];
    const seqStr = seqNumber.toString().padStart(2, '0');
    const id = `${this.formatYYMMDD(new Date())}-${tipo}${seqStr}`;

    const ticket: Ticket = {
      id,
      tipo,
      dataEmissao: new Date(),
      status: 'aguardando',
      sequencia: seqNumber
    };

    if (tipo === 'SP') this.filaSP.push(ticket);
    else if (tipo === 'SE') this.filaSE.push(ticket);
    else this.filaSG.push(ticket);

    return ticket;
  }

  // LÓGICA DO GUICHÊ  
  chamarProximo(): Ticket | null {
    for (let i = 0; i < 3; i++) {
      if (this.proximaPrioridade === 'SP') {
        if (this.filaSP.length > 0) {
          this.proximaPrioridade = 'SE'; // Próxima será Exame
          return this.finalizarAtendimento(this.filaSP.shift()!);
        }
        this.proximaPrioridade = 'SE';
      } else if (this.proximaPrioridade === 'SE') {
        if (this.filaSE.length > 0) {
          this.proximaPrioridade = 'SG'; // Próxima será Geral
          return this.finalizarAtendimento(this.filaSE.shift()!);
        }
        this.proximaPrioridade = 'SG';
      } else if (this.proximaPrioridade === 'SG') {
        if (this.filaSG.length > 0) {
          this.proximaPrioridade = 'SP'; // Volta para Prioridade
          return this.finalizarAtendimento(this.filaSG.shift()!);
        }
        this.proximaPrioridade = 'SP';
      }
    }
    return null;
  }


  private finalizarAtendimento(ticket: Ticket): Ticket {
   
    if (Math.random() < 0.05) {
      ticket.status = 'desistiu';
      return this.chamarProximo() || ticket;
    }

    ticket.status = 'atendido';
    ticket.dataAtendimento = new Date();
    
    ticket.tempoDespendido = this.calcularTempoSimulado(ticket.tipo);

    
    this.ultimosChamados.unshift(ticket);
    if (this.ultimosChamados.length > 5) this.ultimosChamados.pop();

   
    this.historicoGeral.push(ticket);
    this.saveHistorico(); 

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

  // Limpa tudo (Usado no botão "Encerrar Expediente")
  clearAll() {
    this.filaSP = [];
    this.filaSE = [];
    this.filaSG = [];
    this.ultimosChamados = [];
    this.historicoGeral = [];
    
    // Limpa do armazenamento
    localStorage.removeItem(this.historyKey);
    
    this.sequences = { date: this.formatYYMMDD(new Date()), SP: 0, SG: 0, SE: 0 };
    this.saveSequences();
  }

  private calcularTempoSimulado(tipo: 'SP' | 'SG' | 'SE'): number {
    if (tipo === 'SP') {
      // SP: Média 15 min (+- 5 min)
      const variacao = (Math.random() * 10) - 5;
      return Math.floor(15 + variacao);
    } else if (tipo === 'SG') {
      // SG: Média 5 min (+- 3 min)
      const variacao = (Math.random() * 6) - 3;
      return Math.floor(5 + variacao);
    } else {
      // SE: 95% < 1 min, 5% = 5 min
      return Math.random() <= 0.95 ? 1 : 5;
    }
  }
}
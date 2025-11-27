import { Injectable } from '@angular/core';

export interface Ticket {
  id: string;
  tipo: 'SP' | 'SG' | 'SE';
  dataEmissao: Date;
  status: 'aguardando' | 'atendido' | 'desistiu';
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  // As filas onde as senhas ficam guardadas
  private filaSP: Ticket[] = [];
  private filaSE: Ticket[] = [];
  private filaSG: Ticket[] = [];

  // Onde guardamos o histórico para o painel
  public ultimosChamados: Ticket[] = [];

  // Contadores
  private countSP = 0;
  private countSE = 0;
  private countSG = 0;

  // Controle de Prioridade (SP -> SE -> SG)
  private proximaPrioridade: 'SP' | 'SE' | 'SG' = 'SP';

  constructor() { }

  // --- TOTEM: GERA E GUARDA ---
  gerarSenha(tipo: 'SP' | 'SG' | 'SE'): Ticket {
    const hoje = new Date();
    
    // Formata Data YYMMDD
    const ano = hoje.getFullYear().toString().slice(-2);
    const mes = (hoje.getMonth() + 1).toString().padStart(2, '0');
    const dia = hoje.getDate().toString().padStart(2, '0');
    const prefixo = `${ano}${mes}${dia}`;

    // Incrementa Contador
    let seq = 0;
    if (tipo === 'SP') seq = ++this.countSP;
    else if (tipo === 'SE') seq = ++this.countSE;
    else seq = ++this.countSG;

    // Cria ID
    const id = `${prefixo}-${tipo}${seq.toString().padStart(2, '0')}`;

    const ticket: Ticket = {
      id, tipo, dataEmissao: hoje, status: 'aguardando'
    };

    // --- AQUI ESTÁ A MÁGICA: SALVAR NA FILA ---
    if (tipo === 'SP') this.filaSP.push(ticket);
    else if (tipo === 'SE') this.filaSE.push(ticket);
    else this.filaSG.push(ticket);

    console.log('Fila Atualizada:', this.getTamanhoFilas()); 
    return ticket;
  }

  // --- GUICHÊ: TIRA DA FILA ---
  chamarProximo(): Ticket | null {
    // Tenta achar alguém 3 vezes (rodando as prioridades)
    for (let i = 0; i < 3; i++) {
      
      if (this.proximaPrioridade === 'SP') {
        if (this.filaSP.length > 0) {
          this.proximaPrioridade = 'SE';
          return this.finalizarAtendimento(this.filaSP.shift()!);
        }
        this.proximaPrioridade = 'SE';
      } 
      else if (this.proximaPrioridade === 'SE') {
        if (this.filaSE.length > 0) {
          this.proximaPrioridade = 'SG';
          return this.finalizarAtendimento(this.filaSE.shift()!);
        }
        this.proximaPrioridade = 'SG';
      } 
      else if (this.proximaPrioridade === 'SG') {
        if (this.filaSG.length > 0) {
          this.proximaPrioridade = 'SP';
          return this.finalizarAtendimento(this.filaSG.shift()!);
        }
        this.proximaPrioridade = 'SP';
      }
    }
    return null;
  }

  // Atualiza status e move para o painel
  private finalizarAtendimento(ticket: Ticket): Ticket {
    // 5% de chance de desistir
    if (Math.random() < 0.05) {
      ticket.status = 'desistiu';
      // Se desistiu, chama o próximo recursivo
      const proximo = this.chamarProximo();
      return proximo ? proximo : ticket; 
    }

    ticket.status = 'atendido';
    // Adiciona ao Painel
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
}
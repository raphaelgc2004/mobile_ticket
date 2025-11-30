import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';

import { TicketService, Ticket } from '../../services/ticket';

@Component({
  selector: 'app-guiche',
  templateUrl: './guiche.page.html',
  styleUrls: ['./guiche.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class GuichePage implements OnInit {

  public senhaAtual?: Ticket;
  public qtdEspera = 0;

  // Identificador do guichê — ajuste se quiser (p.ex. 'G1', 'Guichê 2')
  public guicheId: string = 'G1';

  constructor(
    public ticketService: TicketService,
    private alertController: AlertController
  ) {}

  ngOnInit(): void {
    this.atualizarStatus();
  }

  // Chamado pelo botão no HTML
  async chamarProximo() {
    // Pega próximo da fila
    const ticket = this.ticketService.chamarProximo();

    if (!ticket) {
      // Nenhuma senha disponível
      await this.presentAlert('Sem senhas', 'Não há senhas na fila no momento.');
      return;
    }

    
    ticket.guiche = this.guicheId;
    if (!ticket.dataAtendimento) ticket.dataAtendimento = new Date();

    // Atribui a senha atual para mostrar na tela
    this.senhaAtual = ticket;

    // Atualiza quantidade de espera visível
    this.atualizarStatus();

    // Mostra um alerta resumido
    await this.presentAlert('Chamando', `Senha: ${ticket.id}\nTipo: ${ticket.tipo}\nGuichê: ${this.guicheId}`);
  }

  atualizarStatus() {
    const filas = this.ticketService.getTamanhoFilas();
    this.qtdEspera = filas.total;
  }

  async presentAlert(titulo: string, mensagem: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensagem,
      buttons: ['OK']
    });
    await alert.present();
  }
}

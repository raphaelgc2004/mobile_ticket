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

  public senhaAtual?: Ticket | null = null;
  public qtdEspera = 0;
  public guicheId: string = 'G1';
  public dataAtual = new Date(); // Para mostrar no relatório

  constructor(
    public ticketService: TicketService,
    private alertController: AlertController
  ) {}

  ngOnInit(): void {
    this.atualizarStatus();
  }

  // --- CHAMAR PRÓXIMO ---
  async chamarProximo() {
    const ticket = this.ticketService.chamarProximo();

    if (!ticket) {
      await this.presentAlert('Sem senhas', 'Não há senhas na fila no momento.');
      return;
    }

    ticket.guiche = this.guicheId;
    if (!ticket.dataAtendimento) ticket.dataAtendimento = new Date();

    this.senhaAtual = ticket;
    this.atualizarStatus();
  }

  atualizarStatus() {
    const filas = this.ticketService.getTamanhoFilas();
    this.qtdEspera = filas.total;
  }

 
  imprimirRelatorio() {
    const historico = this.ticketService.historicoGeral || [];

    if (historico.length === 0) {
      this.presentAlert('Vazio', 'Não há atendimentos para gerar relatório.');
      return;
    }

    this.dataAtual = new Date();

    setTimeout(() => {
      window.print();
    }, 100);
  }

 
  async encerrarExpediente() {
    const alert = await this.alertController.create({
      header: 'Encerrar Expediente?',
      message: 'Isso vai imprimir o relatório e limpar o sistema. Confirmar?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Encerrar',
          handler: () => {
            this.imprimirRelatorio();
            
            setTimeout(() => {
              this.ticketService.clearAll();
              this.senhaAtual = null;
              this.atualizarStatus();
            }, 1000);
          }
        }
      ]
    });
    await alert.present();
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
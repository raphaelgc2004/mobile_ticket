import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';

// IMPORT AJUSTADO (Lê do arquivo ticket.ts)
import { TicketService, Ticket } from '../../services/ticket';

@Component({
  selector: 'app-guiche',
  templateUrl: './guiche.page.html',
  styleUrls: ['./guiche.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class GuichePage {

  // Guarda a senha que está na tela agora
  senhaAtual: Ticket | null = null;
  
  // Mostra quantas pessoas tem na fila
  qtdEspera = 0;

  constructor(
    public ticketService: TicketService, 
    private alertController: AlertController
  ) { }

  // Toda vez que você entrar na aba, atualiza o contador
  ionViewWillEnter() {
    this.atualizarStatus();
  }

  chamarProximo() {
    // 1. Pede a próxima senha para o serviço
    const ticket = this.ticketService.chamarProximo();

    if (ticket) {
      // 2. Se veio alguém, mostra na tela
      this.senhaAtual = ticket;
      
      // Se a pessoa desistiu (5% de chance), avisa
      if (ticket.status === 'desistiu') {
        this.presentAlert('Aviso', `A senha ${ticket.id} desistiu/foi embora.`);
      }
    } else {
      // 3. Se não veio ninguém, avisa que está vazio
      this.presentAlert('Fila Vazia', 'Não há senhas aguardando.');
    }
    
    // Atualiza o contador de espera
    this.atualizarStatus();
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
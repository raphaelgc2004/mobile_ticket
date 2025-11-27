import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { TicketService } from '../../services/ticket'; 

@Component({
  selector: 'app-totem',
  templateUrl: './totem.page.html',
  styleUrls: ['./totem.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class TotemPage {

  constructor(
    private ticketService: TicketService, // <--- Injetou o serviço?
    private alertController: AlertController
  ) { }

  async solicitarSenha(tipo: 'SP' | 'SE' | 'SG') {
    console.log('Botão clicado!', tipo); // <--- Teste de vida no console

    // Chama o serviço
    const ticket = this.ticketService.gerarSenha(tipo);

    // Mostra o Alerta
    const alert = await this.alertController.create({
      header: 'Senha Gerada',
      subHeader: ticket.id,
      message: 'Aguarde ser chamado no painel.',
      buttons: ['OK']
    });
    await alert.present();
  }
}
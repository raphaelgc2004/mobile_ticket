import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TicketService } from '../../services/ticket';

@Component({
  selector: 'app-painel',
  templateUrl: './painel.page.html',
  styleUrls: ['./painel.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class PainelPage {

  constructor(public ticketService: TicketService) { }
}
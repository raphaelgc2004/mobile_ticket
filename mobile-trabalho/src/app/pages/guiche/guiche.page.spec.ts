import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necessário
import { IonicModule } from '@ionic/angular';   // Necessário para os botões Ionic
import { RouterLink } from '@angular/router';   // <--- O SEGREDO ESTÁ AQUI

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  // Aqui embaixo nós listamos tudo que o HTML pode usar
  imports: [IonicModule, CommonModule, RouterLink],
})
export class HomePage {
  constructor() {}
}

# MOBILE-ALTA-PERFOMANCE

# Sistema de Controle de Atendimento  
Aplicação mobile desenvolvida em **Ionic + Angular** simulando um sistema de senhas com Totem, Guichê e Painel.

O sistema organiza atendimentos do tipo **SP (Prioritário)**, **SE (Exames)** e **SG (Geral)**, seguindo regras de prioridade e exibindo a ordem dos últimos chamados.

---

##  Funcionalidades Implementadas

### Totem de Atendimento
- Geração de senhas dos tipos:
  - **SP** – Prioritário  
  - **SE** – Exames  
  - **SG** – Geral  
- Formato da senha:  
  `YYMMDD-TTNN`  
  Exemplo: `251130-SP03`
- Sequência reinicia a cada dia.
- Contador salvo no `localStorage`:
  ```json
  {
    "date": "YYMMDD",
    "SP": n,
    "SE": n,
    "SG": n
  }


##  Equipe

- **Maria Carolina Bezerra Melo** – 01837312  
- **Raphael Guedes Corrêa** – 01746290  
- **Alex Campos Ferreira** – 01690931  
- **Aquiles de Melo Albuquerque** – 01725424  

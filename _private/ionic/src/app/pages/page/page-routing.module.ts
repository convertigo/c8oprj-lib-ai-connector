import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GuardsService } from '../../services/guards.service';

import { Page } from "./page";


const routes: Routes = [
{ path: '', component: Page, canActivate: [GuardsService], canDeactivate: [GuardsService], children: []},

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PageRoutingModule { }

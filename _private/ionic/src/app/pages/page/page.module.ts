import { NgModule, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { Page } from "./page";
import { PageRoutingModule } from "./page-routing.module";


@NgModule({
  declarations: [
	Page
  ],
  imports: [
  	CommonModule,
	FormsModule,
	ReactiveFormsModule,
	IonicModule,
	TranslateModule.forChild(),
	PageRoutingModule,
  ],
  exports: [RouterModule],
  entryComponents: [
  ],
  providers: [
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class PageModule {}
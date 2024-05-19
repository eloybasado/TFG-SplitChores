import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TabsPageModule } from './tabs/tabs.module';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ComponentsModule } from './components/components.module';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
@NgModule({
  declarations: [AppComponent],
    imports: [BrowserModule,
    HttpClientModule,
    TabsPageModule,
    ComponentsModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    FormsModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}

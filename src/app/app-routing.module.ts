import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IncomeComponent } from './income/income.component';
import { ExpensesComponent } from './expenses/expenses.component';
import { SummaryComponent } from './summary/summary.component';

const routes: Routes = [
  { path: 'income', component: IncomeComponent },
  { path: 'expenses', component: ExpensesComponent },
  { path: 'summary', component: SummaryComponent },
  { path: '', redirectTo: '/income', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
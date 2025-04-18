import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { 
  trigger,
  state,
  style,
  animate,
  transition,
  query,
  stagger
} from '@angular/animations';
@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', 
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(50px)' }),
        animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)', 
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('stagger', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateX(-20px)' }),
          stagger('100ms', [
            animate('300ms ease-out', 
              style({ opacity: 1, transform: 'translateX(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('pulse', [
      transition(':enter', [
        style({ transform: 'scale(0.8)' }),
        animate('500ms ease-in-out', 
          style({ transform: 'scale(1.1)' })),
        animate('500ms ease-in-out', 
          style({ transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class SummaryComponent {
  totalBudget = 9456;
  remainingBudget = 7456;
  spentAmount = 2000;
  showCalendar = false;
  currentYear = new Date().getFullYear();
  selectedMonth: string = '';
  @ViewChild('monthTabs') monthTabs!: ElementRef;
  months = ['January', 'February', 'March', 'April', 'May', 'June', 
           'July', 'August', 'September', 'October', 'November', 'December'];
  allMonths: string[] = [];
  constructor() {
    // Create a continuous loop of months (3 sets)
    this.allMonths = [...this.months, ...this.months, ...this.months];
  }
  ngAfterViewInit() {
    // Scroll to current month in the middle section
    setTimeout(() => {
      const middleSectionStart = this.months.length;
      const currentMonthElement = this.monthTabs.nativeElement.children[middleSectionStart + this.currentMonthIndex];
      currentMonthElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }, 100);
  }

  isSelectedMonth(month: string): boolean {
    return month === this.months[this.currentMonthIndex];
  }

  selectMonth(month: string) {
    const index = this.months.indexOf(month);
    if (index >= 0) {
      this.currentMonthIndex = index;
    }
  }
  currentMonthIndex = new Date().getMonth();
  visibleMonths = ['January', 'February', 'March', 'April', 'May', 'June'];
  isScrolled = false;
  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 10;
  }
  expenses = [
    { title: 'Medicine', amount: 2680, date: new Date('2019-04-15'), category: 'health', icon: 'local_hospital' },
    { title: 'Restaurant', amount: 680, date: new Date('2019-04-19'), category: 'food', icon: 'restaurant' },
    { title: 'Clothing', amount: 1200, date: new Date('2019-04-20'), category: 'shopping', icon: 'checkroom' },
    { title: 'Grocery', amount: 300, date: new Date('2019-04-22'), category: 'food', icon: 'shopping_cart' }
  ];

  openCalendar() {
    this.showCalendar = !this.showCalendar;
    if (!this.selectedMonth) {
      this.selectedMonth = this.months[new Date().getMonth()];
    }
  }



  isCurrentMonth(month: string): boolean {
    return this.selectedMonth === month;
  }

  prevYear() {
    this.currentYear--;
  }

  nextYear() {
    this.currentYear++;
  }
  
}

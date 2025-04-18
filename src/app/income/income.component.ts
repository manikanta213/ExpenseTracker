import { Component, OnInit, ViewChild, ElementRef, TemplateRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-income',
  templateUrl: './income.component.html',
  styleUrls: ['./income.component.css']
})
export class IncomeComponent implements OnInit, AfterViewInit {
  @ViewChild('summaryCard') summaryCard!: ElementRef;
  @ViewChild('incomeList') incomeList!: ElementRef;
  @ViewChild('addIncomeDialog') addIncomeDialog!: TemplateRef<any>;
  @ViewChild('dialogContainer') dialogContainer!: ElementRef;

  currentMonth: string;
  currentYear: number;
  incomeForm!: FormGroup;
  incomeEntries: any[] = [];
  totalIncome: number = 0;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    const date = new Date();
    this.currentMonth = date.toLocaleString('default', { month: 'long' });
    this.currentYear = date.getFullYear();
    gsap.registerPlugin(ScrollTrigger);
  }

  ngOnInit(): void {
    this.incomeForm = this.fb.group({
      date: [new Date(), Validators.required],
      description: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      received: [false]
    });

    // Sample data - in real app this would come from backend
    this.incomeEntries = [
      { date: new Date(), description: 'Monthly Salary', amount: 3000, received: true },
      { date: new Date(), description: 'Freelance Work', amount: 500, received: false },
      { date: new Date(2023, 5, 15), description: 'Bonus', amount: 750, received: true },
      { date: new Date(2023, 5, 10), description: 'Investment Dividends', amount: 120, received: false }
    ];
    this.calculateTotal();
  }

  ngAfterViewInit(): void {
    this.initAnimations();
  }

  initAnimations(): void {
    // Summary card animation
    gsap.from(this.summaryCard.nativeElement, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: "back.out(1.2)"
    });

    // Income list items animation
    const cards = this.incomeList.nativeElement.querySelectorAll('.income-card');
    gsap.from(cards, {
      y: 20,
      opacity: 0,
      stagger: 0.1,
      duration: 0.5,
      delay: 0.3,
      ease: "sine.out"
    });

    // Scroll animations
    gsap.utils.toArray('.income-card').forEach((card: any, i) => {
      ScrollTrigger.create({
        trigger: card,
        start: "top 80%",
        onEnter: () => {
          gsap.to(card, {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power2.out"
          });
        }
      });
    });
  }

  openAddIncomeDialog(): void {
    const dialogRef = this.dialog.open(this.addIncomeDialog, {
      width: '450px',
      maxWidth: '90vw'
    });

    // Dialog animation
    dialogRef.afterOpened().subscribe(() => {
      gsap.from(this.dialogContainer.nativeElement, {
        y: 50,
        opacity: 0,
        duration: 0.3,
        ease: "power2.out"
      });
    });
  }

  addIncome(): void {
    if (this.incomeForm.valid) {
      const newIncome = this.incomeForm.value;
      this.incomeEntries.unshift(newIncome);
      this.calculateTotal();
      
      // Animate the new card
      setTimeout(() => {
        const newCard = this.incomeList.nativeElement.querySelector('.income-card:first-child');
        gsap.from(newCard, {
          y: 50,
          opacity: 0,
          scale: 0.8,
          duration: 0.5,
          ease: "back.out(1.2)"
        });
      }, 0);
      
      this.dialog.closeAll();
      this.incomeForm.reset({
        date: new Date(),
        amount: 0,
        received: false
      });
    }
  }

  editIncome(index: number): void {
    const incomeToEdit = this.incomeEntries[index];
    this.incomeForm.patchValue(incomeToEdit);
    
    const dialogRef = this.dialog.open(this.addIncomeDialog, {
      width: '450px',
      maxWidth: '90vw',
      data: { editMode: true }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.incomeEntries[index] = this.incomeForm.value;
        this.calculateTotal();
        
        // Pulse animation for edited card
        gsap.to(`.income-card[data-index="${index}"]`, {
          scale: 1.05,
          boxShadow: "0 0 15px rgba(76, 175, 80, 0.4)",
          duration: 0.3,
          yoyo: true,
          repeat: 2
        });
      }
      
      this.incomeForm.reset({
        date: new Date(),
        amount: 0,
        received: false
      });
    });
  }

  toggleReceived(index: number): void {
    // Animate the toggle change
    const card = this.incomeList.nativeElement.querySelector(`.income-card[data-index="${index}"]`);
    gsap.to(card, {
      backgroundColor: this.incomeEntries[index].received ? "#e8f5e9" : "#ffffff",
      duration: 0.3,
      ease: "power2.out"
    });
    
    this.calculateTotal();
  }

  calculateTotal(): void {
    this.totalIncome = this.incomeEntries
      .filter(entry => entry.received)
      .reduce((sum, entry) => sum + entry.amount, 0);
    
    // Animate the number change
    this.animateNumberChange('totalIncome', this.totalIncome);
  }

  animateNumberChange(property: 'totalIncome', newValue: number): void {
    const obj = { val: this[property] }; // Property is now constrained to 'totalIncome'

    gsap.to(obj, {
      val: newValue,
      duration: 0.8,
      ease: "power2.out",
      onUpdate: () => {
        this[property] = parseFloat(obj.val.toFixed(2));
      }
    });
  }
  updateMonthYear(change: number): void {
    // Animation for month change
    gsap.to('.month-title', {
      y: -20,
      opacity: 0,
      duration: 0.2,
      onComplete: () => {
        const date = new Date();
        date.setMonth(date.getMonth() + change);
        this.currentMonth = date.toLocaleString('default', { month: 'long' });
        this.currentYear = date.getFullYear();
        
        gsap.fromTo('.month-title', 
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.3 }
        );
        
        // In real app, you would load data for the new month here
      }
    });
  }
}
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.css']
})
export class ExpensesComponent implements OnInit, AfterViewInit {
  @ViewChild('formContainer') formContainer!: ElementRef;
  @ViewChild('expenseList') expenseList!: ElementRef;
  @ViewChild('totalCard') totalCard!: ElementRef;
  @ViewChild('remainingCard') remainingCard!: ElementRef;

  currentMonth: string;
  currentYear: number;
  expenseForm!: FormGroup;
  expenseEntries: any[] = [];
  categories: string[] = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Rent'];
  totalExpenses: number = 0;
  remainingAmount: number = 3500; // Starting with $3500 budget
  editingIndex: number | null = null;

  constructor(private fb: FormBuilder) {
    const date = new Date();
    this.currentMonth = date.toLocaleString('default', { month: 'long' });
    this.currentYear = date.getFullYear();
    gsap.registerPlugin(ScrollTrigger);
  }

  ngOnInit(): void {
    this.expenseForm = this.fb.group({
      date: [new Date(), Validators.required],
      category: ['', Validators.required],
      description: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]]
    });

    // Sample data
    this.expenseEntries = [
      { date: new Date(), category: 'Food', description: 'Groceries', amount: 150.75 },
      { date: new Date(), category: 'Transport', description: 'Bus tickets', amount: 50.00 },
      { date: new Date(2023, 5, 15), category: 'Entertainment', description: 'Movie tickets', amount: 24.50 },
      { date: new Date(2023, 5, 10), category: 'Utilities', description: 'Electricity bill', amount: 85.30 }
    ];
    this.calculateTotals();
  }

  ngAfterViewInit(): void {
    this.initAnimations();
  }

  initAnimations(): void {
    // Form container animation
    gsap.from(this.formContainer.nativeElement, {
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out"
    });

    // Summary cards animation
    gsap.from([this.totalCard.nativeElement, this.remainingCard.nativeElement], {
      y: 30,
      opacity: 0,
      stagger: 0.1,
      duration: 0.6,
      ease: "back.out(1.7)"
    });

    // Expense list items animation
    const cards = this.expenseList.nativeElement.querySelectorAll('.expense-card');
    gsap.from(cards, {
      y: 20,
      opacity: 0,
      stagger: 0.1,
      duration: 0.5,
      delay: 0.3,
      ease: "sine.out"
    });

    // Scroll animations
    gsap.utils.toArray('.expense-card').forEach((card: any, i) => {
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

  addExpense(): void {
    if (this.expenseForm.valid) {
      const formValue = this.expenseForm.value;
      
      // Animation for adding/updating
      if (this.editingIndex !== null) {
        // Update animation
        gsap.to(`.expense-card[data-index="${this.editingIndex}"]`, {
          scale: 0.9,
          backgroundColor: "#f5f5f5",
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            this.expenseEntries[this.editingIndex!] = formValue;
            this.editingIndex = null;
            this.calculateTotals();
            this.resetForm();
          }
        });
      } else {
        // Add animation
        this.expenseEntries.unshift(formValue);
        this.calculateTotals();
        this.resetForm();
        
        // Animate the new card
        setTimeout(() => {
          const newCard = this.expenseList.nativeElement.querySelector('.expense-card:first-child');
          gsap.from(newCard, {
            y: 50,
            opacity: 0,
            scale: 0.8,
            duration: 0.5,
            ease: "back.out(1.2)"
          });
        }, 0);
      }
    }
  }

  editExpense(index: number): void {
    this.editingIndex = index;
    this.expenseForm.patchValue(this.expenseEntries[index]);
    
    // Scroll to form
    this.formContainer.nativeElement.scrollIntoView({ behavior: 'smooth' });
    
    // Pulse animation for the edited card
    gsap.to(`.expense-card[data-index="${index}"]`, {
      scale: 1.05,
      boxShadow: "0 0 15px rgba(25, 118, 210, 0.4)",
      duration: 0.3,
      yoyo: true,
      repeat: 2
    });
  }

  cancelEdit(): void {
    this.editingIndex = null;
    this.resetForm();
  }

  removeExpense(index: number): void {
    // Animation for removal
    const card = this.expenseList.nativeElement.querySelector(`.expense-card[data-index="${index}"]`);
    
    gsap.to(card, {
      x: 100,
      opacity: 0,
      height: 0,
      marginBottom: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        this.expenseEntries.splice(index, 1);
        this.calculateTotals();
        
        // Re-index remaining cards
        setTimeout(() => {
          const cards = this.expenseList.nativeElement.querySelectorAll('.expense-card');
          cards.forEach((card: any, i: number) => {
            card.setAttribute('data-index', i);
          });
        }, 0);
      }
    });
  }

  calculateTotals(): void {
    this.totalExpenses = this.expenseEntries.reduce((sum, entry) => sum + entry.amount, 0);
    this.remainingAmount = 3500 - this.totalExpenses;
    
    // Animate the numbers
    this.animateNumberChange('totalExpenses', this.totalExpenses);
    this.animateNumberChange('remainingAmount', this.remainingAmount);
  }

  animateNumberChange(property: 'totalExpenses' | 'remainingAmount', newValue: number): void {
    // We now explicitly allow only the properties 'totalExpenses' and 'remainingAmount'
    const obj = { val: this[property] as number };
  
    gsap.to(obj, {
      val: newValue,
      duration: 0.8,
      ease: "power2.out",
      onUpdate: () => {
        // Update the property value
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
      }
    });
  }

  addCategory(newCategory: string): void {
    if (newCategory && !this.categories.includes(newCategory)) {
      this.categories.push(newCategory);
      
      // Animation for new category
      const select = document.querySelector('mat-select') as HTMLElement;
      gsap.from(select, {
        backgroundColor: "#e3f2fd",
        duration: 0.5,
        ease: "power2.out"
      });
    }
  }

  resetForm(): void {
    this.expenseForm.reset({
      date: new Date(),
      amount: 0
    });
  }
}
// Default data structure
const defaultConfig = {
  year: 2026,
  coverTitle: "Budget Planner",
  fontFamily: "'Arial', sans-serif",
  primaryColor: "#2C3E50",
  secondaryColor: "#3498DB",

  incomeRows: [
    { label: "Salary" },
    { label: "Freelance" },
    { label: "Investments" },
    { label: "Other" }
  ],

  expenseCategories: [
    { label: "Housing" },
    { label: "Transportation" },
    { label: "Food & Groceries" },
    { label: "Utilities" },
    { label: "Healthcare" },
    { label: "Entertainment" },
    { label: "Subscriptions" },
    { label: "Debt Payments" },
    { label: "Savings" },
    { label: "Other" }
  ],

  goals: [
    { name: "Emergency Fund", targetAmount: "10000" },
    { name: "Vacation", targetAmount: "3000" },
    { name: "New Car", targetAmount: "15000" }
  ],

  months: ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"]
};
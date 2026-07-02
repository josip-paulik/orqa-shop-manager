export type OrderStatus = "In Progress" | "Incoming" | "Deployed" | "Cancelled";

export type Order = {
  id: string;
  customer: string;
  handler: string;
  initials: string;
  date: string;
  status: OrderStatus;
  amount: number;
  receipt: string;
};

export type UserStatus = "Active" | "Invited" | "Inactive";

export type User = {
  id: string;
  name: string;
  role: string;
  team: string;
  status: UserStatus;
  email: string;
};

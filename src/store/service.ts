import { createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState, AppThunk } from "./index";
import type { Order, OrderStatus, User } from "./types";

const THROTTLE_BASE_MS = 800;
const THROTTLE_JITTER_MS = 600;
let isDangerModeEnabled = false;

const mockOrders: Order[] = [
  {
    id: "#2847",
    customer: "Marko Petrović",
    handler: "Ana Kostić",
    initials: "AK",
    date: "Jun 28, 2026",
    status: "In Progress",
    amount: 23.9,
    receipt: "Order #2847\nReceiver: Marko Petrović\nAmount: 23,90 €",
  },
  {
    id: "#2846",
    customer: "Sarah Chen",
    handler: "Ivan Kovačević",
    initials: "IK",
    date: "Jun 27, 2026",
    status: "Incoming",
    amount: 130.9,
    receipt: "Order #2846\nReceiver: Sarah Chen\nAmount: 130,90 €",
  },
  {
    id: "#2845",
    customer: "Lucas Weber",
    handler: null,
    initials: "",
    date: "Jun 27, 2026",
    status: "Incoming",
    amount: 100,
    receipt: "Order #2845\nReceiver: Lucas Weber\nAmount: 100,00 €",
  },
  {
    id: "#2844",
    customer: "Ana Novak",
    handler: "Ivan Kovačević",
    initials: "IK",
    date: "Jun 26, 2026",
    status: "Deployed",
    amount: 123.9,
    receipt: "Order #2844\nReceiver: Ana Novak\nAmount: 123,90 €",
  },
  {
    id: "#2843",
    customer: "James Taylor",
    handler: "Ana Kostić",
    initials: "AK",
    date: "Jun 25, 2026",
    status: "Cancelled",
    amount: 253.9,
    receipt: "Order #2843\nReceiver: James Taylor\nAmount: 253,90 €",
  },
  {
    id: "#2842",
    customer: "Nina Müller",
    handler: "Marko Markić",
    initials: "MM",
    date: "Jun 24, 2026",
    status: "Deployed",
    amount: 301.23,
    receipt: "Order #2842\nReceiver: Nina Müller\nAmount: 301,23 €",
  },
];

const mockUsers: User[] = [
  {
    id: "U-104",
    name: "Ana Kostić",
    role: "Administrator",
    team: "Operations",
    status: "Active",
    email: "ana.kostic@orqa.local",
  },
  {
    id: "U-105",
    name: "Ivan Kovačević",
    role: "Dispatcher",
    team: "Orders",
    status: "Active",
    email: "ivan.kovacevic@orqa.local",
  },
  {
    id: "U-106",
    name: "Sarah Chen",
    role: "Support Lead",
    team: "Support",
    status: "Invited",
    email: "sarah.chen@orqa.local",
  },
  {
    id: "U-107",
    name: "Marko Markić",
    role: "Warehouse",
    team: "Logistics",
    status: "Inactive",
    email: "marko.markic@orqa.local",
  },
];

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

const throttledResponse = async <T>(data: T): Promise<T> => {
  const jitter = Math.floor(Math.random() * THROTTLE_JITTER_MS);
  await sleep(THROTTLE_BASE_MS + jitter);

  if (isDangerModeEnabled) {
    throw new Error(
      "Server Error, please try again later.",
    );
  }

  return data;
};

export const setDangerModeEnabled = (enabled: boolean) => {
  isDangerModeEnabled = enabled;
};

export const getDangerModeEnabled = () => isDangerModeEnabled;

const cloneOrder = (order: Order): Order => ({ ...order });
const cloneUser = (user: User): User => ({ ...user });

const fetchOrdersRequest = async () =>
  throttledResponse(mockOrders.map(cloneOrder));
const fetchUsersRequest = async () =>
  throttledResponse(mockUsers.map(cloneUser));

export type CreateOrderInput = {
  customer: string;
  handler: string | null;
  amount: number;
  status: OrderStatus;
  receipt: string;
};

export type UpdateOrderInput = {
  id: string;
  customer: string;
  handler: string | null;
  amount: number;
  status: OrderStatus;
  receipt: string;
};

export type CreateUserInput = {
  name: string;
  role: string;
  team: string;
  status: "Active" | "Invited" | "Inactive";
  email: string;
};

export type UpdateUserInput = {
  id: string;
  name: string;
  role: string;
  team: string;
  status: "Active" | "Invited" | "Inactive";
  email: string;
};

type CreateOrderResult = {
  created: Order;
  orders: Order[];
};

const getHandlerInitials = (handler: string | null) => {
  if (!handler) {
    return "";
  }

  return handler
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
};

const nextOrderId = () => {
  const maxId = mockOrders.reduce((max, order) => {
    const numeric = Number.parseInt(order.id.replace("#", ""), 10);
    return Number.isNaN(numeric) ? max : Math.max(max, numeric);
  }, 0);

  return `#${maxId + 1}`;
};

const formatOrderDate = () => {
  const now = new Date();
  return now.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const createOrderRequest = async (
  input: CreateOrderInput,
): Promise<CreateOrderResult> => {
  await throttledResponse(null);

  const created: Order = {
    id: nextOrderId(),
    customer: input.customer,
    handler: input.handler,
    initials: getHandlerInitials(input.handler),
    date: formatOrderDate(),
    status: input.status,
    amount: input.amount,
    receipt: input.receipt,
  };

  mockOrders.unshift(created);

  return {
    created: cloneOrder(created),
    orders: mockOrders.map(cloneOrder),
  };
};

type UpdateOrderResult = {
  updated: Order;
  orders: Order[];
};

const updateOrderRequest = async (
  input: UpdateOrderInput,
): Promise<UpdateOrderResult> => {
  const index = mockOrders.findIndex((order) => order.id === input.id);

  if (index === -1) {
    throw new Error("Order not found.");
  }

  await throttledResponse(null);

  const current = mockOrders[index];
  const updated: Order = {
    ...current,
    customer: input.customer,
    handler: input.handler,
    initials: getHandlerInitials(input.handler),
    amount: input.amount,
    status: input.status,
    receipt: input.receipt,
  };

  mockOrders[index] = updated;

  return {
    updated: cloneOrder(updated),
    orders: mockOrders.map(cloneOrder),
  };
};

type DeleteOrderResult = {
  deletedId: string;
  orders: Order[];
};

const deleteOrderRequest = async (
  orderId: string,
): Promise<DeleteOrderResult> => {
  const index = mockOrders.findIndex((order) => order.id === orderId);

  if (index === -1) {
    throw new Error("Order not found.");
  }

  await throttledResponse(null);

  mockOrders.splice(index, 1);

  return {
    deletedId: orderId,
    orders: mockOrders.map(cloneOrder),
  };
};

const nextUserId = () => {
  const maxId = mockUsers.reduce((max, user) => {
    const numeric = Number.parseInt(user.id.replace("U-", ""), 10);
    return Number.isNaN(numeric) ? max : Math.max(max, numeric);
  }, 0);

  return `U-${maxId + 1}`;
};

type CreateUserResult = {
  created: User;
  users: User[];
};

const createUserRequest = async (
  input: CreateUserInput,
): Promise<CreateUserResult> => {
  await throttledResponse(null);

  const created: User = {
    id: nextUserId(),
    name: input.name,
    role: input.role,
    team: input.team,
    status: input.status,
    email: input.email,
  };

  mockUsers.unshift(created);

  return {
    created: cloneUser(created),
    users: mockUsers.map(cloneUser),
  };
};

type UpdateUserResult = {
  updated: User;
  users: User[];
};

const updateUserRequest = async (
  input: UpdateUserInput,
): Promise<UpdateUserResult> => {
  const index = mockUsers.findIndex((user) => user.id === input.id);

  if (index === -1) {
    throw new Error("User not found.");
  }

  await throttledResponse(null);

  const updated: User = {
    id: input.id,
    name: input.name,
    role: input.role,
    team: input.team,
    status: input.status,
    email: input.email,
  };

  mockUsers[index] = updated;

  return {
    updated: cloneUser(updated),
    users: mockUsers.map(cloneUser),
  };
};

type DeleteUserResult = {
  deletedId: string;
  users: User[];
};

const deleteUserRequest = async (userId: string): Promise<DeleteUserResult> => {
  const index = mockUsers.findIndex((user) => user.id === userId);

  if (index === -1) {
    throw new Error("User not found.");
  }

  await throttledResponse(null);

  mockUsers.splice(index, 1);

  return {
    deletedId: userId,
    users: mockUsers.map(cloneUser),
  };
};

export const loadOrders = createAsyncThunk("orders/load", async () =>
  fetchOrdersRequest(),
);
export const loadUsers = createAsyncThunk("users/load", async () =>
  fetchUsersRequest(),
);
export const createOrder = createAsyncThunk(
  "orders/create",
  async (input: CreateOrderInput) => createOrderRequest(input),
);
export const updateOrder = createAsyncThunk(
  "orders/update",
  async (input: UpdateOrderInput) => updateOrderRequest(input),
);
export const deleteOrder = createAsyncThunk(
  "orders/delete",
  async (orderId: string) => deleteOrderRequest(orderId),
);
export const createUser = createAsyncThunk(
  "users/create",
  async (input: CreateUserInput) => createUserRequest(input),
);
export const updateUser = createAsyncThunk(
  "users/update",
  async (input: UpdateUserInput) => updateUserRequest(input),
);
export const deleteUser = createAsyncThunk(
  "users/delete",
  async (userId: string) => deleteUserRequest(userId),
);

export const selectOrdersState = (state: RootState) => state.orders;
export const selectUsersState = (state: RootState) => state.users;
export const selectOrderById = (state: RootState, orderId: string) =>
  state.orders.items.find((order) => order.id === orderId);

export const formatAmountEUR = (amount: number) =>
  `${amount.toFixed(2).replace(".", ",")} €`;

export const loadOrdersIfNeeded = (): AppThunk => (dispatch, getState) => {
  const { status } = getState().orders;
  if (status !== "idle") {
    return;
  }
  void dispatch(loadOrders());
};

export const loadUsersIfNeeded = (): AppThunk => (dispatch, getState) => {
  const { status } = getState().users;

  if (status !== "idle") {
    return;
  }
  void dispatch(loadUsers());
};

export const retryLoadOrders = (): AppThunk => (dispatch) => {
  void dispatch(loadOrders());
};

export const retryLoadUsers = (): AppThunk => (dispatch) => {
  void dispatch(loadUsers());
};

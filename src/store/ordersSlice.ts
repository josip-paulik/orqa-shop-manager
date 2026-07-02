import { createSlice } from "@reduxjs/toolkit";
import { createOrder, deleteOrder, loadOrders, updateOrder } from "./service";
import type { Order } from "./types";

type LoadStatus = "idle" | "loading" | "succeeded" | "failed";

type OrdersState = {
  items: Order[];
  status: LoadStatus;
  error: string | null;
  lastFetchedAt: number | null;
};

const initialState: OrdersState = {
  items: [],
  status: "idle",
  error: null,
  lastFetchedAt: null,
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadOrders.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loadOrders.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
        state.lastFetchedAt = Date.now();
      })
      .addCase(loadOrders.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to load orders.";
      })
      .addCase(createOrder.pending, (state) => {
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.lastFetchedAt = Date.now();

        if (state.items.length === 0) {
          state.items = action.payload.orders;
          return;
        }

        state.items = [
          action.payload.created,
          ...state.items.filter(
            (order) => order.id !== action.payload.created.id,
          ),
        ];
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to create order.";
      })
      .addCase(updateOrder.pending, (state) => {
        state.error = null;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.lastFetchedAt = Date.now();

        if (state.items.length === 0) {
          state.items = action.payload.orders;
          return;
        }

        state.items = state.items.map((order) =>
          order.id === action.payload.updated.id
            ? action.payload.updated
            : order,
        );
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to update order.";
      })
      .addCase(deleteOrder.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.lastFetchedAt = Date.now();
        state.items = action.payload.orders;
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to delete order.";
      });
  },
});

export default ordersSlice.reducer;

import { type FormEvent, useState } from "react";
import { ArrowLeft, CurrencyEur, PencilSimple, X } from "@phosphor-icons/react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/Button/Button";
import { Input } from "../../components/Input/Input";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import Spinner from "../../components/Spinner/Spinner";
import {
  createOrder,
  loadOrdersIfNeeded,
  loadUsersIfNeeded,
  retryLoadUsers,
  selectOrderById,
  selectOrdersState,
  selectUsersState,
  updateOrder,
} from "../../store/service";
import type { OrderStatus } from "../../store/types";
import "./OrderFormPage.css";

function OrderFormPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId?: string }>();
  const resolvedOrderId = orderId ? `#${orderId}` : undefined;
  const existingOrder = useAppSelector((state) =>
    resolvedOrderId ? selectOrderById(state, resolvedOrderId) : undefined,
  );
  const { status: ordersStatus } = useAppSelector(selectOrdersState);
  const {
    items: users,
    status: usersStatus,
    error: usersError,
  } = useAppSelector(selectUsersState);
  const isEditMode = Boolean(resolvedOrderId);
  const [customer, setCustomer] = useState("");
  const [handler, setHandler] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [status, setStatus] = useState<OrderStatus>("In Progress");
  const [receipt, setReceipt] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isHandlerModalOpen, setIsHandlerModalOpen] = useState(false);

  useEffect(() => {
    dispatch(loadOrdersIfNeeded());
  }, [dispatch]);

  useEffect(() => {
    if (isHandlerModalOpen) {
      dispatch(loadUsersIfNeeded());
    }
  }, [dispatch, isHandlerModalOpen]);

  const isLoadingEditOrder =
    isEditMode && ordersStatus === "loading" && !existingOrder;
  const isEditOrderMissing =
    isEditMode && ordersStatus === "succeeded" && !existingOrder;

  useEffect(() => {
    if (!existingOrder) {
      return;
    }

    setCustomer(existingOrder.customer);
    setHandler(existingOrder.handler);
    setAmountInput(existingOrder.amount.toFixed(2));
    setStatus(existingOrder.status);
    setReceipt(existingOrder.receipt);
  }, [existingOrder]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    const amount = Number.parseFloat(amountInput);
    if (Number.isNaN(amount)) {
      setSubmitError("Amount must be a valid number.");
      return;
    }

    setIsSaving(true);
    setSubmitError(null);
    try {
      if (isEditMode && resolvedOrderId) {
        await dispatch(
          updateOrder({
            id: resolvedOrderId,
            customer,
            handler,
            amount,
            status,
            receipt,
          }),
        ).unwrap();
      } else {
        await dispatch(
          createOrder({
            customer,
            handler,
            amount,
            status,
            receipt,
          }),
        ).unwrap();
      }
      navigate("/");
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to save order. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingEditOrder) {
    return (
      <section className="data-state-card" role="status" aria-live="polite">
        <Spinner size={32} />
      </section>
    );
  }

  if (isEditOrderMissing) {
    return (
      <section className="data-state-card data-state-error" role="alert">
        <p>Order was not found.</p>
        <Button
          buttonStyle="Secondary"
          type="button"
          onClick={() => navigate("/")}
        >
          Back to Orders
        </Button>
      </section>
    );
  }

  const closeHandlerModal = () => {
    setIsHandlerModalOpen(false);
  };

  const assignHandler = (handlerName: string) => {
    setHandler(handlerName);
    closeHandlerModal();
  };

  return (
    <>
      <section className="content-header">
        <div>
          <h1>{isEditMode ? "Edit Order" : "Create Order"}</h1>
          <p>
            {isEditMode
              ? "Update order details and receipt content."
              : "Fill out order details and receipt content."}
          </p>
        </div>
      </section>

      <form className="create-order-form" onSubmit={handleSubmit}>
        {submitError && (
          <section className="form-error" role="alert" aria-live="assertive">
            <p>{submitError}</p>
          </section>
        )}

        <div className="create-order-grid">
          <div>
            <label className="form-label" htmlFor="customer">
              Customer
            </label>
            <Input
              id="customer"
              value={customer}
              onChange={(event) => setCustomer(event.target.value)}
              disabled={isSaving}
              required
              placeholder="Customer name"
            />
          </div>

          <div>
            <label className="form-label" htmlFor="handler">
              Handler
            </label>
            <div className="handler-input-row">
              <Input
                id="handler"
                value={handler}
                onChange={(event) => setHandler(event.target.value)}
                disabled={true}
                required
                placeholder="Assigned person(choose with right button)"
              />
              <button
                type="button"
                className="handler-picker-button"
                onClick={() => setIsHandlerModalOpen(true)}
                disabled={isSaving}
                aria-label="Pick handler from users"
              >
                <PencilSimple size={16} />
              </button>
            </div>
          </div>

          <div>
            <label className="form-label" htmlFor="amount">
              Amount
            </label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              icon={CurrencyEur}
              value={amountInput}
              onChange={(event) => setAmountInput(event.target.value)}
              disabled={isSaving}
              required
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="form-label" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              className="form-select"
              value={status}
              disabled={isSaving}
              onChange={(event) => setStatus(event.target.value as OrderStatus)}
            >
              <option>In Progress</option>
              <option>Incoming</option>
              <option>Deployed</option>
              <option>Cancelled</option>
            </select>
          </div>
        </div>

        <div>
          <label className="form-label" htmlFor="receipt">
            Receipt
          </label>
          <textarea
            id="receipt"
            className="form-textarea"
            value={receipt}
            onChange={(event) => setReceipt(event.target.value)}
            disabled={isSaving}
            rows={8}
            placeholder="Edit receipt text here..."
          />
        </div>

        <div className="form-actions">
          <Button
            buttonStyle="Secondary"
            type="button"
            onClick={() => navigate("/")}
            disabled={isSaving}
          >
            <ArrowLeft size={16} />
            Back
          </Button>
          <Button buttonStyle="Primary" type="submit" isLoading={isSaving}>
            {isSaving
              ? "Saving..."
              : isEditMode
                ? "Update Order"
                : "Save Order"}
          </Button>
        </div>
      </form>

      {isHandlerModalOpen && (
        <div
          className="assign-modal-backdrop"
          role="presentation"
          onClick={closeHandlerModal}
        >
          <div
            className="assign-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Assign handler"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="assign-modal-header">
              <div>
                <h2>Select Handler</h2>
                <p>Pick a user from the system.</p>
              </div>
              <button
                type="button"
                className="assign-modal-close"
                onClick={closeHandlerModal}
                aria-label="Close handler picker"
              >
                <X size={18} />
              </button>
            </div>

            {usersStatus === "loading" && users.length === 0 && (
              <div className="assign-modal-state">
                <Spinner size={28} />
              </div>
            )}

            {usersStatus === "failed" && (
              <div className="assign-modal-state">
                <p>{usersError ?? "Failed to load users."}</p>
                <Button
                  buttonStyle="Secondary"
                  type="button"
                  onClick={() => dispatch(retryLoadUsers())}
                >
                  Retry
                </Button>
              </div>
            )}

            {users.length > 0 && (
              <div className="assign-user-list">
                {users.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    className="assign-user-item"
                    onClick={() => assignHandler(user.name)}
                  >
                    <span className="assign-user-avatar">
                      {user.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </span>
                    <span className="assign-user-name">{user.name}</span>
                    <span className="assign-user-meta">{user.role}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default OrderFormPage;

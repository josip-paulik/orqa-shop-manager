import {
	CaretDown,
	X,
	PencilSimple,
	WarningCircle,
} from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Spinner from '../../components/Spinner/Spinner'
import { Button } from '../../components/Button/Button'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
	deleteOrder,
	formatAmountEUR,
	loadOrders,
	loadOrdersIfNeeded,
	loadUsersIfNeeded,
	retryLoadOrders,
	retryLoadUsers,
	selectOrdersState,
	selectUsersState,
	updateOrder,
} from '../../store/service'
import type { OrderStatus } from '../../store/types'
import './OrdersPage.css'

function OrdersPage() {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const { items: orders, status, error } = useAppSelector(selectOrdersState)
	const { items: users, status: usersStatus, error: usersError } = useAppSelector(selectUsersState)
	const [assignOrderId, setAssignOrderId] = useState<string | null>(null)
	const [isAssigning, setIsAssigning] = useState(false)
	const [updatingStatusOrderId, setUpdatingStatusOrderId] = useState<string | null>(null)
	const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null)
	const isStatusUpdating = updatingStatusOrderId !== null
	const isDeleting = deletingOrderId !== null
	const isOperationInProgress = isAssigning || isStatusUpdating || isDeleting
	const operationLoadingMessage = isDeleting
		? 'Deleting order and refreshing list...'
		: isAssigning
			? 'Assigning handler...'
			: 'Updating order status...'

	const selectedOrder = useMemo(
		() => orders.find((order) => order.id === assignOrderId),
		[assignOrderId, orders],
	)

	useEffect(() => {
		dispatch(loadOrdersIfNeeded())
	}, [dispatch])

	useEffect(() => {
		if (assignOrderId) {
			dispatch(loadUsersIfNeeded())
		}
	}, [assignOrderId, dispatch])

	const openAssignModal = (orderId: string) => {
		setAssignOrderId(orderId)
	}

	const closeAssignModal = () => {
		if (isOperationInProgress) {
			return
		}
		setAssignOrderId(null)
		setIsAssigning(false)
	}

	const assignOrderToUser = async (userName: string) => {
		if (!selectedOrder || isOperationInProgress) {
			return
		}

		setIsAssigning(true)
		try {
			await dispatch(updateOrder({
				id: selectedOrder.id,
				customer: selectedOrder.customer,
				handler: userName,
				amount: selectedOrder.amount,
				status: selectedOrder.status,
				receipt: selectedOrder.receipt,
			})).unwrap()
			closeAssignModal()
		} finally {
			setIsAssigning(false)
		}
	}

	const updateOrderStatus = async (orderId: string, nextStatus: OrderStatus) => {
		if (isOperationInProgress) {
			return
		}

		const target = orders.find((order) => order.id === orderId)
		if (!target || target.status === nextStatus) {
			return
		}

		setUpdatingStatusOrderId(orderId)
		try {
			await dispatch(updateOrder({
				id: target.id,
				customer: target.customer,
				handler: target.handler,
				amount: target.amount,
				status: nextStatus,
				receipt: target.receipt,
			})).unwrap()
		} finally {
			setUpdatingStatusOrderId(null)
		}
	}

	const removeOrder = async (orderId: string) => {
		if (isOperationInProgress) {
			return
		}

		const target = orders.find((order) => order.id === orderId)
		if (!target) {
			return
		}

		const confirmed = window.confirm(`Delete order ${target.id}? This action cannot be undone.`)
		if (!confirmed) {
			return
		}

		setDeletingOrderId(orderId)
		try {
			await dispatch(deleteOrder(orderId)).unwrap()
			await dispatch(loadOrders()).unwrap()
		} finally {
			setDeletingOrderId(null)
		}
	}

	const statusClassName = (statusValue: OrderStatus) => {
		switch (statusValue) {
			case 'Incoming':
				return 'status-badge incoming'
			case 'Deployed':
				return 'status-badge deployed'
			case 'Cancelled':
				return 'status-badge cancelled'
			default:
				return 'status-badge in-progress'
		}
	}

	return (
		<>
			<section className="content-header">
				<div>
					<h1>Order Management</h1>
					<p>Manage and track all orders</p>
				</div>
			</section>

			<section className="content-actions" aria-label="Order actions">
				<Button buttonStyle="Primary" type="button" onClick={() => navigate('/orders/new')}>
					Create Order
				</Button>
			</section>

			{status === 'loading' && orders.length === 0 && (
				<section className="data-state-card" role="status" aria-live="polite">
					<Spinner size={32} />
				</section>
			)}

			{status === 'failed' && (
				<section className="data-state-card data-state-error" role="alert">
					<p>{error ?? 'Failed to load orders.'}</p>
					<Button buttonStyle="Secondary" type="button" onClick={() => dispatch(retryLoadOrders())}>
						Retry
					</Button>
				</section>
			)}

			{status !== 'loading' && status !== 'failed' && orders.length === 0 && (
				<section className="data-state-card" role="status" aria-live="polite">
					<p>No orders yet. Create your first order to get started.</p>
				</section>
			)}

			{orders.length > 0 && (
				<section className="table-container" aria-label="Orders grid">
				<div className="orders-grid" role="table" aria-label="Orders">
					<div className="orders-grid-row orders-grid-header" role="row">
						<div role="columnheader">Order ID</div>
						<div role="columnheader">Customer</div>
						<div role="columnheader">Handler</div>
						<div role="columnheader">Date</div>
						<div role="columnheader">Status</div>
						<div role="columnheader">Amount</div>
						<div role="columnheader" aria-label="Actions" />
					</div>

					{orders.map((order) => (
						<div key={order.id} className="orders-grid-row" role="row">
							<div role="cell">{order.id}</div>
							<div role="cell">{order.customer}</div>
							<div role="cell" className="handler-cell">
                {order.handler === 'Not Assigned' ? (
                    <div className="handler-name">
                        <WarningCircle size={28} className="handler-warning" />
                        <span className="handler-unassigned">Not Assigned</span>
                    </div>
                ) : (
                    <div className="handler-name">
                        <span className="handler-avatar">{order.initials}</span>
                        <span>{order.handler}</span>
                    </div>
                )}
								<Button
									type="button"
                  buttonStyle="Tertiary"
                  isIconOnly
									onClick={() => openAssignModal(order.id)}
									aria-label={`Assign handler for order ${order.id}`}
									disabled={isOperationInProgress}
								>
									<PencilSimple size={20} className="handler-edit" />
								</Button>
							</div>
							<div role="cell">{order.date}</div>
							<div role="cell">
								<div className={`${statusClassName(order.status)} status-select-wrap`}>
									<select
										className="status-select"
										value={order.status}
										onChange={(event) => updateOrderStatus(order.id, event.target.value as OrderStatus)}
										disabled={updatingStatusOrderId === order.id || isOperationInProgress}
									>
										<option value="In Progress">In Progress</option>
										<option value="Incoming">Incoming</option>
										<option value="Deployed">Deployed</option>
										<option value="Cancelled">Cancelled</option>
									</select>
									<CaretDown size={14} className="status-select-chevron" />
								</div>
							</div>
							<div role="cell">{formatAmountEUR(order.amount)}</div>
							<div role="cell" className="actions-cell">
								<Button buttonStyle="Tertiary" type="button" onClick={() => navigate(`/orders/${order.id.replace('#', '')}/edit`)} disabled={isOperationInProgress}>
									Edit
								</Button>
								<Button
									buttonStyle="Tertiary"
									type="button"
									onClick={() => void removeOrder(order.id)}
									disabled={isOperationInProgress}
								>
									Delete
								</Button>
							</div>
						</div>
					))}
				</div>

				<div className="orders-cards">
					{orders.map((order) => (
						<article key={`mobile-${order.id}`} className="order-card">
							<div className="order-card-row">
								<strong>{order.id}</strong>
								<span>{formatAmountEUR(order.amount)}</span>
							</div>
							<div className="order-card-row muted">{order.customer}</div>
							<div className="order-card-row muted">{order.date}</div>
							<div className="order-card-row">
								<div className={`${statusClassName(order.status)} status-select-wrap`}>
									<select
										className="status-select"
										value={order.status}
										onChange={(event) => updateOrderStatus(order.id, event.target.value as OrderStatus)}
										disabled={updatingStatusOrderId === order.id || isOperationInProgress}
									>
										<option value="In Progress">In Progress</option>
										<option value="Incoming">Incoming</option>
										<option value="Deployed">Deployed</option>
										<option value="Cancelled">Cancelled</option>
									</select>
									<CaretDown size={14} className="status-select-chevron" />
								</div>
							</div>
              <div className="order-card-row handler-cell">
                {order.handler === 'Not Assigned' ? (
                    <div className="handler-name">
                        <WarningCircle size={28} className="handler-warning" />
                        <span className="handler-unassigned">Not Assigned</span>
                    </div>
                ) : (
                    <div className="handler-name">
                        <span className="handler-avatar">{order.initials}</span>
                        <span>{order.handler}</span>
                    </div>
                )}
								<Button
									type="button"
                  buttonStyle="Tertiary"
                  isIconOnly
									onClick={() => openAssignModal(order.id)}
									aria-label={`Assign handler for order ${order.id}`}
									disabled={isOperationInProgress}
								>
									<PencilSimple size={20} className="handler-edit" />
								</Button>
							</div>
							<div className="order-card-row card-actions">
								<Button buttonStyle="Tertiary" type="button" onClick={() => navigate(`/orders/${order.id.replace('#', '')}/edit`)} disabled={isOperationInProgress}>
									Edit
								</Button>
								<Button
									buttonStyle="Tertiary"
									type="button"
									onClick={() => void removeOrder(order.id)}
									disabled={isOperationInProgress}
								>
									Delete
								</Button>
							</div>
						</article>
					))}
				</div>
				</section>
			)}

			{isOperationInProgress && (
				<div className="operation-loading-backdrop" role="status" aria-live="polite" aria-label="Order update in progress">
					<div className="delete-order-loading">
						<Spinner size={30} />
						<p>{operationLoadingMessage}</p>
					</div>
				</div>
			)}

			{assignOrderId && (
				<div className="assign-modal-backdrop" role="presentation" onClick={closeAssignModal}>
					<div className="assign-modal" role="dialog" aria-modal="true" aria-label="Assign order handler" onClick={(event) => event.stopPropagation()}>
						<div className="assign-modal-header">
							<div>
								<h2>Assign Handler</h2>
								<p>{selectedOrder ? `Order ${selectedOrder.id}` : 'Select order handler'}</p>
							</div>
							<button type="button" className="assign-modal-close" onClick={closeAssignModal} aria-label="Close assign handler modal">
								<X size={18} />
							</button>
						</div>

						{usersStatus === 'loading' && users.length === 0 && (
							<div className="assign-modal-state">
								<Spinner size={28} />
							</div>
						)}

						{usersStatus === 'failed' && (
							<div className="assign-modal-state">
								<p>{usersError ?? 'Failed to load users.'}</p>
								<Button buttonStyle="Secondary" type="button" onClick={() => dispatch(retryLoadUsers())}>
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
										onClick={() => assignOrderToUser(user.name)}
										disabled={isOperationInProgress}
									>
										<span className="assign-user-avatar">{user.name.split(' ').map((part) => part[0]).join('')}</span>
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
	)
}

export default OrdersPage
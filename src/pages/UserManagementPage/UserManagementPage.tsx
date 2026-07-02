import {
  CaretDown,
  UserPlus,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/Button/Button";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  deleteUser,
  loadUsers,
  loadUsersIfNeeded,
  retryLoadUsers,
  selectUsersState,
  updateUser,
} from "../../store/service";
import type { UserStatus } from "../../store/types";
import "./UserManagementPage.css";
import Spinner from "../../components/Spinner/Spinner";

function UserManagementPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items: users, status, error } = useAppSelector(selectUsersState);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const isUpdating = updatingUserId !== null;
  const isDeleting = deletingUserId !== null;
  const isOperationInProgress = isUpdating || isDeleting;
  const operationLoadingMessage = isDeleting
    ? "Deleting user and refreshing list..."
    : "Updating user status...";

  useEffect(() => {
    dispatch(loadUsersIfNeeded());
  }, [dispatch]);

  const userStatusClassName = (statusValue: UserStatus) => {
    switch (statusValue) {
      case "Invited":
        return "status-badge incoming";
      case "Inactive":
        return "status-badge cancelled";
      default:
        return "status-badge deployed";
    }
  };

  const removeUser = async (userId: string) => {
    if (isOperationInProgress) {
      return;
    }

    const target = users.find((user) => user.id === userId);
    if (!target) {
      return;
    }

    const confirmed = window.confirm(
      `Delete user ${target.name} (${target.id})? This action cannot be undone.`,
    );
    if (!confirmed) {
      return;
    }

    setDeletingUserId(userId);
    try {
      await dispatch(deleteUser(userId)).unwrap();
      await dispatch(loadUsers()).unwrap();
    } finally {
      setDeletingUserId(null);
    }
  };

  const updateInlineUserStatus = async (
    userId: string,
    nextStatus: UserStatus,
  ) => {
    if (isOperationInProgress) {
      return;
    }

    const target = users.find((user) => user.id === userId);
    if (!target || target.status === nextStatus) {
      return;
    }

    setUpdatingUserId(userId);
    try {
      await dispatch(
        updateUser({
          id: target.id,
          name: target.name,
          role: target.role,
          team: target.team,
          status: nextStatus,
          email: target.email,
        }),
      ).unwrap();
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <>
      <section className="content-header">
        <div>
          <h1>User Management</h1>
          <p>Manage team members, roles and access across the dashboard</p>
        </div>
      </section>

	  <section>
        <Button
          buttonStyle="Primary"
          type="button"
          onClick={() => navigate("/users/new")}
          disabled={isOperationInProgress}
        >
          <UserPlus size={16} />
          Invite User
        </Button>
	  </section>

      {status === "loading" && users.length === 0 && (
        <section className="data-state-card" role="status" aria-live="polite">
			<Spinner size={32} />
		</section>
      )}

      {status === "failed" && (
        <section className="data-state-card data-state-error" role="alert">
          <p>{error ?? "Failed to load users."}</p>
          <Button
            buttonStyle="Secondary"
            type="button"
            onClick={() => dispatch(retryLoadUsers())}
          >
            Retry
          </Button>
        </section>
      )}

      {status !== "loading" && status !== "failed" && users.length === 0 && (
        <section className="data-state-card" role="status" aria-live="polite">
          <p>No users yet. Invite your first user to get started.</p>
        </section>
      )}

      {users.length > 0 && (
        <section className="table-container" aria-label="Users grid">
          <div className="users-grid" role="table" aria-label="Users">
            <div className="users-grid-row users-grid-header" role="row">
              <div role="columnheader">Name</div>
              <div role="columnheader">Role</div>
              <div role="columnheader">Team</div>
              <div role="columnheader">Status</div>
              <div role="columnheader">Email</div>
              <div role="columnheader" aria-label="Actions" />
            </div>

            {users.map((user) => (
              <div
                key={user.id}
                className={`users-grid-row`}
                role="row"
              >
                <div role="cell">
                  <div className="user-name-cell">
                    <span className="user-avatar">
                      {user.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </span>
                    <div className="user-name-stack">
                      <span>{user.name}</span>
                      <span className="user-id-text">{user.id}</span>
                    </div>
                  </div>
                </div>
                <div role="cell">{user.role}</div>
                <div role="cell">{user.team}</div>
                <div role="cell">
                  <div
                    className={`${userStatusClassName(user.status)} status-select-wrap`}
                  >
                    <select
                      className="status-select"
                      value={user.status}
                      onChange={(event) =>
                        void updateInlineUserStatus(
                          user.id,
                          event.target.value as UserStatus,
                        )
                      }
                      disabled={isOperationInProgress}
                    >
                      <option value="Active">Active</option>
                      <option value="Invited">Invited</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                    <CaretDown size={14} className="status-select-chevron" />
                  </div>
                </div>
                <div role="cell" className="user-email-cell">
                  {user.email}
                </div>
                <div role="cell" className="actions-cell">
                  <Button
                    buttonStyle="Tertiary"
                    type="button"
                    onClick={() => navigate(`/users/${user.id}/edit`)}
                    disabled={isOperationInProgress}
                  >
                    Edit
                  </Button>
                  <Button
                    buttonStyle="Tertiary"
                    type="button"
                    onClick={() => void removeUser(user.id)}
                    disabled={isOperationInProgress}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="users-cards">
            {users.map((user) => (
              <article key={`mobile-${user.id}`} className="user-card">
                <div className="user-card-row">
                  <strong>{user.name}</strong>
                  <div
                    className={`${userStatusClassName(user.status)} status-select-wrap`}
                  >
                    <select
                      className="status-select"
                      value={user.status}
                      onChange={(event) =>
                        void updateInlineUserStatus(
                          user.id,
                          event.target.value as UserStatus,
                        )
                      }
                      disabled={isOperationInProgress}
                    >
                      <option value="Active">Active</option>
                      <option value="Invited">Invited</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                    <CaretDown size={14} className="status-select-chevron" />
                  </div>
                </div>
                <div className="user-card-row muted">{user.role}</div>
                <div className="user-card-row muted">{user.team}</div>
                <div className="user-card-row muted user-email-card">
                  {user.email}
                </div>
                <div className="user-card-row card-actions">
                  <Button
                    buttonStyle="Tertiary"
                    type="button"
                    onClick={() => navigate(`/users/${user.id}/edit`)}
                    disabled={isOperationInProgress}
                  >
                    Edit
                  </Button>
                  <Button
                    buttonStyle="Tertiary"
                    type="button"
                    onClick={() => void removeUser(user.id)}
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
        <div
          className="operation-loading-backdrop"
          role="status"
          aria-live="polite"
          aria-label="User update in progress"
        >
          <div className="delete-order-loading">
            <Spinner size={30} />
            <p>{operationLoadingMessage}</p>
          </div>
        </div>
      )}
    </>
  );
}

export default UserManagementPage;

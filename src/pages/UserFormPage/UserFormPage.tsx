import { type FormEvent, useEffect, useState } from "react";
import { ArrowLeft } from "@phosphor-icons/react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/Button/Button";
import { Input } from "../../components/Input/Input";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import Spinner from "../../components/Spinner/Spinner";
import {
  createUser,
  loadUsersIfNeeded,
  selectUsersState,
  updateUser,
} from "../../store/service";
import type { CreateUserInput, UpdateUserInput } from "../../store/service";
import "./UserFormPage.css";

function UserFormPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { userId } = useParams<{ userId?: string }>();
  const { items: users, status: usersStatus } = useAppSelector(selectUsersState);
  const isEditMode = Boolean(userId);
  const existingUser = users.find((user) => user.id === userId);
  const [name, setName] = useState("");
  const [role, setRole] = useState("Administrator");
  const [team, setTeam] = useState("Operations");
  const [status, setStatus] = useState<"Active" | "Invited" | "Inactive">(
    "Active",
  );
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(loadUsersIfNeeded());
  }, [dispatch]);

  useEffect(() => {
    if (!existingUser) {
      return;
    }

    setName(existingUser.name);
    setRole(existingUser.role);
    setTeam(existingUser.team);
    setStatus(existingUser.status);
    setEmail(existingUser.email);
  }, [existingUser]);

  const isLoadingEditUser = isEditMode && usersStatus === "loading" && !existingUser;
  const isEditUserMissing = isEditMode && usersStatus === "succeeded" && !existingUser;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setSubmitError(null);
    try {
      if (isEditMode && existingUser) {
        const input: UpdateUserInput = {
          id: existingUser.id,
          name,
          role,
          team,
          status,
          email,
        };
        await dispatch(updateUser(input)).unwrap();
      } else {
        const input: CreateUserInput = {
          name,
          role,
          team,
          status,
          email,
        };
        await dispatch(createUser(input)).unwrap();
      }
      navigate("/users");
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to save user. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingEditUser) {
    return (
      <section className="data-state-card" role="status" aria-live="polite">
        <Spinner size={32} />
      </section>
    );
  }

  if (isEditUserMissing) {
    return (
      <section className="data-state-card data-state-error" role="alert">
        <p>User was not found.</p>
        <Button
          buttonStyle="Secondary"
          type="button"
          onClick={() => navigate("/users")}
        >
          Back to Users
        </Button>
      </section>
    );
  }

  return (
    <>
      <section className="content-header">
        <div>
          <h1>{isEditMode ? "Edit User" : "Invite User"}</h1>
          <p>
            {isEditMode
              ? "Update team member account details."
              : "Add a new team member to the dashboard."}
          </p>
        </div>
      </section>

      <form className="create-user-form" onSubmit={handleSubmit}>
        {submitError && (
          <section className="form-error" role="alert" aria-live="assertive">
            <p>{submitError}</p>
          </section>
        )}

        <div className="create-user-grid">
          <div>
            <label className="form-label" htmlFor="name">
              Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isLoading}
              required
              placeholder="Full name"
            />
          </div>

          <div>
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isLoading}
              required
              placeholder="user@example.local"
            />
          </div>

          <div>
            <label className="form-label" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              className="form-select"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              disabled={isLoading}
            >
              <option>Administrator</option>
              <option>Dispatcher</option>
              <option>Support Lead</option>
              <option>Warehouse</option>
            </select>
          </div>

          <div>
            <label className="form-label" htmlFor="team">
              Team
            </label>
            <select
              id="team"
              className="form-select"
              value={team}
              onChange={(event) => setTeam(event.target.value)}
              disabled={isLoading}
            >
              <option>Operations</option>
              <option>Orders</option>
              <option>Support</option>
              <option>Logistics</option>
            </select>
          </div>

          <div>
            <label className="form-label" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              className="form-select"
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value as "Active" | "Invited" | "Inactive",
                )
              }
              disabled={isLoading}
            >
              <option>Active</option>
              <option>Invited</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <Button
            buttonStyle="Secondary"
            type="button"
            onClick={() => navigate("/users")}
            disabled={isLoading}
          >
            <ArrowLeft size={16} />
            Back
          </Button>
          <Button buttonStyle="Primary" type="submit" isLoading={isLoading}>
            {isEditMode ? "Update User" : "Save User"}
          </Button>
        </div>
      </form>
    </>
  );
}

export default UserFormPage;

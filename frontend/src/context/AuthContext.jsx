import { createContext, useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadCurrentUser, loginUser, registerUser, logoutUser, clearError } from "../redux/slices/authSlice";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const { user, token, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(loadCurrentUser());
  }, [dispatch]);

  const login = async (email, password) => {
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.rejected.match(result)) {
      throw new Error(result.payload || "Login failed");
    }
    return result.payload.user;
  };

  const register = async (name, email, password, company, role = "admin") => {
    const result = await dispatch(registerUser({ name, email, password, role }));
    if (registerUser.rejected.match(result)) {
      throw new Error(result.payload || "Registration failed");
    }
    return result.payload.user;
  };

  const logout = () => {
    dispatch(logoutUser());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        clearAuthError: () => dispatch(clearError()),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

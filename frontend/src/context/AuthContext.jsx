import { createContext, useContext, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadCurrentUser, loginUser, registerUser, logoutUser, clearError } from "../redux/slices/authSlice";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const { user, token, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(loadCurrentUser());
  }, [dispatch]);

  const login = useCallback(async (email, password) => {
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.rejected.match(result)) {
      throw new Error(result.payload || "Login failed");
    }
    return result.payload;
  }, [dispatch]);

  const register = useCallback(async (name, email, password, company, role = "admin") => {
    const result = await dispatch(registerUser({ name, email, password, role }));
    if (registerUser.rejected.match(result)) {
      throw new Error(result.payload || "Registration failed");
    }
    return result.payload.user;
  }, [dispatch]);

  const logout = useCallback(() => {
    dispatch(logoutUser());
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const contextValue = useMemo(() => ({
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    clearAuthError,
  }), [user, token, loading, error, login, register, logout, clearAuthError]);

  return (
    <AuthContext.Provider value={contextValue}>
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

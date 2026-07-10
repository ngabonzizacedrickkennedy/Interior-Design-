import { createContext, useContext, useEffect, useState } from "react";
import { getToken, clearToken } from "../../api/client";
import {
  login as loginAction,
  register as registerAction,
  verifyOtp as verifyOtpAction,
  forgotPassword as forgotPasswordAction,
  resetPassword as resetPasswordAction,
  googleAuth as googleAuthAction,
  logout as logoutAction,
} from "../../api/actions/auth";
import { getMyProfile } from "../../api/actions/users";

const AuthContext = createContext(null);

function parseToken(token) {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      userId:   payload.userId,
      email:    payload.sub,
      role:     payload.role,
    };
  } catch {
    return null;
  }
}

function toUserObj(data) {
  return {
    userId:   data.userId,
    email:    data.email,
    fullName: data.fullName,
    role:     data.role,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => parseToken(getToken()));
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!user || (user.avatarUrl !== undefined && user.fullName !== undefined)) return;
    let cancelled = false;
    getMyProfile()
      .then((profile) => {
        if (!cancelled) {
          setUser((u) => (u ? { ...u, fullName: profile.fullName, avatarUrl: profile.avatarUrl || null } : u));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user]);

  function patchUser(patch) {
    setUser((u) => (u ? { ...u, ...patch } : u));
  }

  async function login(email, password) {
    setLoading(true);
    setError(null);
    try {
      const data = await loginAction(email, password);
      if (data.otpRequired) return { otpRequired: true, email: data.email };
      const userObj = toUserObj(data);
      setUser(userObj);
      return { otpRequired: false, ...userObj };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function register(fullName, email, password, role = "CLIENT") {
    setLoading(true);
    setError(null);
    try {
      const data = await registerAction(fullName, email, password, role);
      if (data.otpRequired) return { otpRequired: true, email: data.email };
      const userObj = toUserObj(data);
      setUser(userObj);
      return { otpRequired: false, ...userObj };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function loginWithGoogle(idToken, role) {
    setLoading(true);
    setError(null);
    try {
      const data = await googleAuthAction(idToken, role);
      const userObj = toUserObj(data);
      setUser(userObj);
      return userObj;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(email, code) {
    setLoading(true);
    setError(null);
    try {
      const data = await verifyOtpAction(email, code);
      const userObj = toUserObj(data);
      setUser(userObj);
      return userObj;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function forgotPassword(email) {
    setLoading(true);
    setError(null);
    try {
      await forgotPasswordAction(email);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(token, newPassword) {
    setLoading(true);
    setError(null);
    try {
      await resetPasswordAction(token, newPassword);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    logoutAction();
    clearToken();
    setUser(null);
  }

  function clearError() {
    setError(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        loginWithGoogle,
        verifyOtp,
        forgotPassword,
        resetPassword,
        logout,
        patchUser,
        loading,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

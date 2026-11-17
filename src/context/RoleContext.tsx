import React, { createContext, useContext, useMemo, useState } from 'react';
import { ROLE_PERMISSIONS, ROLE_USERS } from '../data/mockHospitalData';
import { PermissionCode, RoleId, RoleUserProfile } from '../types/sitnde';

const AUTH_STORAGE_KEY = 'sitnde_auth_role_id';

interface RoleContextValue {
  isAuthenticated: boolean;
  currentUser: RoleUserProfile;
  allRoleUsers: RoleUserProfile[];
  switchRole: (roleId: RoleId) => void;
  loginWithCredentials: (
    nip: string,
    password: string
  ) => Promise<RoleUserProfile>;
  logout: () => void;
  hasPermission: (permission: PermissionCode) => boolean;
  canAccessNav: (nav: string) => boolean;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activeRoleId, setActiveRoleId] = useState<RoleId>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY) as RoleId | null;
      if (saved && ROLE_USERS.some((u) => u.roleId === saved)) {
        return saved;
      }
    } catch {
      // Ignore storage access errors
    }
    return 'staf';
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY) as RoleId | null;
      return Boolean(saved && ROLE_USERS.some((u) => u.roleId === saved));
    } catch {
      return false;
    }
  });

  const currentUser = useMemo(
    () => ROLE_USERS.find((u) => u.roleId === activeRoleId) || ROLE_USERS[0],
    [activeRoleId]
  );

  const switchRole = (roleId: RoleId) => {
    setActiveRoleId(roleId);
    if (isAuthenticated) {
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, roleId);
      } catch {
        // Ignore storage write errors
      }
    }
  };

  const loginWithCredentials = async (
    nip: string,
    password: string
  ): Promise<RoleUserProfile> => {
    const res = await fetch('/api/auth/login-nip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nip, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'NIP atau kata sandi tidak valid.');
    }
    const matched = data.user as RoleUserProfile;
    setActiveRoleId(matched.roleId);
    setIsAuthenticated(true);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, matched.roleId);
    } catch {
      // Ignore storage write errors
    }
    return matched;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setActiveRoleId('staf');
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // Ignore storage removal errors
    }
  };

  const hasPermission = (permission: PermissionCode): boolean => {
    const perms = ROLE_PERMISSIONS[activeRoleId] || [];
    return perms.includes(permission);
  };

  const canAccessNav = (nav: string): boolean => {
    switch (nav) {
      case 'dashboard':
        return true;
      case 'create':
        return hasPermission('draft:create_ai') || activeRoleId === 'staf';
      case 'guard':
        return hasPermission('guard:run');
      case 'templates':
        return hasPermission('view:templates');
      case 'flow':
        return activeRoleId !== 'admin_it';
      case 'archive':
        return hasPermission('view:archive');
      case 'reports':
        return hasPermission('view:reports');
      case 'admin':
        return hasPermission('system:manage_sotk_tnd');
      default:
        return false;
    }
  };

  return (
    <RoleContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        allRoleUsers: ROLE_USERS,
        switchRole,
        loginWithCredentials,
        logout,
        hasPermission,
        canAccessNav,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    throw new Error('useRole must be used inside RoleProvider');
  }
  return ctx;
}

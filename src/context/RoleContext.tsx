import React, { createContext, useContext, useMemo, useState } from 'react';
import { ROLE_PERMISSIONS, ROLE_USERS } from '../data/mockHospitalData';
import { PermissionCode, RoleId, RoleUserProfile } from '../types/sitnde';

interface RoleContextValue {
  currentUser: RoleUserProfile;
  allRoleUsers: RoleUserProfile[];
  switchRole: (roleId: RoleId) => void;
  hasPermission: (permission: PermissionCode) => boolean;
  canAccessNav: (nav: string) => boolean;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activeRoleId, setActiveRoleId] = useState<RoleId>('staf');

  const currentUser = useMemo(
    () => ROLE_USERS.find((u) => u.roleId === activeRoleId) || ROLE_USERS[0],
    [activeRoleId]
  );

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
      case 'admin':
        return hasPermission('system:manage_sotk_tnd');
      default:
        return false;
    }
  };

  return (
    <RoleContext.Provider
      value={{
        currentUser,
        allRoleUsers: ROLE_USERS,
        switchRole: setActiveRoleId,
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

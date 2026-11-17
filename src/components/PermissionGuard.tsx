import React from 'react';
import { Lock } from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { PermissionCode, RoleId } from '../types/sitnde';

interface PermissionGuardProps {
  permission?: PermissionCode;
  allowedRoles?: RoleId[];
  mode?: 'hide' | 'fallback';
  fallbackMessage?: string;
  children: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  allowedRoles,
  mode = 'hide',
  fallbackMessage = 'Peran aktif Anda tidak memiliki kewenangan untuk mengakses tindakan atau modul ini.',
  children,
}) => {
  const { currentUser, hasPermission } = useRole();

  const isAllowedByPerm = permission ? hasPermission(permission) : true;
  const isAllowedByRole = allowedRoles
    ? allowedRoles.includes(currentUser.roleId)
    : true;

  if (isAllowedByPerm && isAllowedByRole) {
    return <>{children}</>;
  }

  if (mode === 'fallback') {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500">
          <Lock className="h-5 w-5" />
        </div>
        <h3 className="mt-3 font-display text-sm font-bold text-[#0F294A]">
          Akses Dibatasi Berdasarkan RBAC ({currentUser.shortRoleLabel})
        </h3>
        <p className="mx-auto mt-1 max-w-md text-xs text-slate-600">
          {fallbackMessage}
        </p>
      </div>
    );
  }

  return null;
};

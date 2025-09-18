import React, { createContext, useContext, useMemo } from 'react';
import { TENANTS, DEFAULT_TENANT } from '../config/tenants';
import { resolveTenantSlug } from '../utils/tenant';

const TenantContext = createContext({ tenant: TENANTS[DEFAULT_TENANT] });

export const TenantProvider = ({ children }) => {
  const slug = useMemo(() => resolveTenantSlug(window.location.hostname, window.location.search) || DEFAULT_TENANT, []);
  const tenant = TENANTS[slug] || TENANTS[DEFAULT_TENANT];
  return (
    <TenantContext.Provider value={{ slug, tenant }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => useContext(TenantContext);

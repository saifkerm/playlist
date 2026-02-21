import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { CatalogData } from '../../types';
import { loadCatalog } from './catalogApi';

type CatalogState = {
  loading: boolean;
  error: string | null;
  data: CatalogData | null;
};

const CatalogContext = createContext<CatalogState>({
  loading: true,
  error: null,
  data: null
});

export const CatalogProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [state, setState] = useState<CatalogState>({ loading: true, error: null, data: null });

  useEffect(() => {
    let cancelled = false;

    loadCatalog()
      .then((data) => {
        if (!cancelled) {
          setState({ loading: false, error: null, data });
        }
      })
      .catch((error: Error) => {
        if (!cancelled) {
          setState({ loading: false, error: error.message, data: null });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => state, [state]);
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
};

export const useCatalog = (): CatalogState => useContext(CatalogContext);

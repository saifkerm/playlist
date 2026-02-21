import { CatalogData } from '../../types';

const catalogUrl = `${import.meta.env.BASE_URL}content/catalog.json`;

export const loadCatalog = async (): Promise<CatalogData> => {
  const response = await fetch(catalogUrl, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Unable to load catalog.json (${response.status})`);
  }
  return (await response.json()) as CatalogData;
};

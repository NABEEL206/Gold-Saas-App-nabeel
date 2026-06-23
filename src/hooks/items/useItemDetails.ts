// src/hooks/items/useItemDetails.ts
import { useState, useCallback } from 'react';
export const useItemDetails = () => {
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchItem = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/items/${id}`);
      // const data = await response.json();
      // setItem(data);
      
      console.log('Fetching item with id:', id);
      // For now, set item to null to show "Item Not Found" state
      setItem(null);
      setError('Item not found');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch item');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/items/${id}`, { method: 'DELETE' });
      
      console.log('Deleting item with id:', id);
      setItem(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(async (id: string, status: any) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/items/${id}/status`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status })
      // });
      // const updated = await response.json();
      // setItem(updated);
      
      console.log('Updating status for item:', id, 'to:', status);
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    item,
    error,
    fetchItem,
    deleteItem,
    updateStatus,
  };
};
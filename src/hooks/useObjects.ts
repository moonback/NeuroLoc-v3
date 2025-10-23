import { useState, useEffect } from 'react';
import { objectsService } from '../services/objects.service';
import { RentalObject, SearchFilters } from '../types';

export const useObjects = (filters?: SearchFilters) => {
  const [objects, setObjects] = useState<RentalObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchObjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await objectsService.getObjects(filters);
      setObjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch objects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObjects();
  }, [JSON.stringify(filters)]);

  return {
    objects,
    loading,
    error,
    refetch: fetchObjects
  };
};

export const useObject = (id: string) => {
  const [object, setObject] = useState<RentalObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchObject = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await objectsService.getObjectById(id);
      setObject(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch object');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchObject();
    }
  }, [id]);

  return {
    object,
    loading,
    error,
    refetch: fetchObject
  };
};

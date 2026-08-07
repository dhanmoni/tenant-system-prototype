import { useState, useEffect } from 'react';
import api from '../api';

let cachedDistricts = null;
let fetchPromise = null;

export const invalidateDistrictsCache = () => {
    cachedDistricts = null;
    fetchPromise = null;
};

export const useDistricts = (enabled = true) => {
    const [districts, setDistricts] = useState(cachedDistricts || []);
    const [loading, setLoading] = useState(!cachedDistricts && enabled);

    useEffect(() => {
        if (!enabled) return;
        if (cachedDistricts) {
            setDistricts(cachedDistricts);
            setLoading(false);
            return;
        }

        if (!fetchPromise) {
            fetchPromise = api.get('/api/districts', { params: { all: true } })
                .then(({ data }) => {
                    const result = Array.isArray(data) ? data : (data.data || []);
                    cachedDistricts = result;
                    return result;
                })
                .catch(() => {
                    cachedDistricts = [];
                    return [];
                })
                .finally(() => {
                    fetchPromise = null;
                });
        }

        fetchPromise.then((data) => {
            setDistricts(data);
            setLoading(false);
        });

    }, [enabled]);

    const refetch = () => {
        invalidateDistrictsCache();
        setLoading(true);
        
        fetchPromise = api.get('/api/districts', { params: { all: true } })
            .then(({ data }) => {
                const result = Array.isArray(data) ? data : (data.data || []);
                cachedDistricts = result;
                setDistricts(result);
                return result;
            })
            .catch(() => {
                cachedDistricts = [];
                setDistricts([]);
                return [];
            })
            .finally(() => {
                fetchPromise = null;
                setLoading(false);
            });
            
        return fetchPromise;
    };

    return { districts, loading, refetch };
};

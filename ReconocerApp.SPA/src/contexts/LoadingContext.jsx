import React, { createContext, useState, useContext, useCallback } from 'react';
import { Dialog, Typography, LinearProgress } from '@mui/material';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState({
    loading: false,
    title: '',
    infinite: true,
    progress: 0,
    total: 0,
  });

  const showLoading = useCallback((title, infinite = true, progress = 0, total = 0) => {
    setLoading({ loading: true, title, infinite, progress, total });
  }, []);

  const updateProgress = useCallback((progress, total) => {
    setLoading((prev) => ({ ...prev, progress, total }));
  }, []);

  const hideLoading = useCallback(() => {
    setLoading({ loading: false, title: '', infinite: true, progress: 0, total: 0 });
  }, []);

  return (
    <LoadingContext.Provider value={{ showLoading, updateProgress, hideLoading }}>
      {children}
      <Dialog open={loading.loading}>
        <div style={{ padding: "20px", textAlign: "center" }}>
          <Typography variant="h5">{loading.title}</Typography>
          {loading.infinite ? (
            <LinearProgress style={{ margin: "20px 0" }} />
          ) : (
            <LinearProgress
              variant="determinate"
              value={(loading.progress / loading.total) * 100}
              style={{ margin: "20px 0" }}
            />
          )}
          {!loading.infinite && (
            <Typography variant="body1">{`Progreso: ${loading.progress} de ${loading.total}`}</Typography>
          )}
        </div>
      </Dialog>
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);

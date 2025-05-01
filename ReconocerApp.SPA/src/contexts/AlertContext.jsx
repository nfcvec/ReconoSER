import React, { createContext, useState, useContext, useCallback } from 'react';
import { Alert, Stack } from '@mui/material';

export const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
    const [alerts, setAlerts] = useState([]);

    const showAlert = useCallback((message, severity) => {
        const id = new Date().getTime();
        setAlerts((prevAlerts) => [...prevAlerts, { id, message, severity }]);
        setTimeout(() => {
            setAlerts((prevAlerts) => prevAlerts.filter(alert => alert.id !== id));
        }, 3000);
    }, []);

    return (
        <AlertContext.Provider value={showAlert}>
            {children}
            <Stack sx={{ position: 'fixed', top: 0, left: window.innerWidth / 2 - 150, width: 300, zIndex: 9999 }} spacing={2}>
                {alerts.map((alert) => (
                    <Alert key={alert.id} severity={alert.severity} onClose={() => {
                        setAlerts((prevAlerts) => prevAlerts.filter(a => a.id !== alert.id));
                    }}>
                        {alert.message}
                    </Alert>
                ))}
            </Stack>
        </AlertContext.Provider>
    );
};

export const useAlert = () => {
    return useContext(AlertContext);
};

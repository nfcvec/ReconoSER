import React from 'react';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useWallet } from '../contexts/WalletContext';


const WalletBalance = () => {
  const { wallet, loading, error, refreshWallet } = useWallet();
  const balance = wallet?.saldoActual;

  return (
    <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
      <AccountBalanceWalletIcon sx={{ fontSize: 40, color: 'white', mr: 2 }} />
      {error ? null : loading ? (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CircularProgress size={32} sx={{ color: 'white' }} />
        </Box>
      ) : (
        <Typography variant="h5" onClick={refreshWallet} sx={{ cursor: 'pointer', color: 'white' }}>
          {balance !== undefined ? `$${balance.toFixed(2)}` : 'Sin saldo'}
        </Typography>
      )}
    </Box>
  );
};

export default WalletBalance;
import React from 'react';
import { useMsal } from "@azure/msal-react";
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import { loginRequest } from "../authConfig";

export const AccountPicker = (props) => {
  const { instance, accounts } = useMsal();
  const { onClose, open } = props;

  const handleListItemClick = async (account) => {
    const activeAccount = instance.getActiveAccount();
    if (!account) {
      instance.setActiveAccount(account);
      instance.loginRedirect({
        ...loginRequest,
        prompt: 'login',
      });
    } else if (account && activeAccount.homeAccountId != account.homeAccountId) {
      instance.setActiveAccount(account);
      try {
        await instance.ssoSilent({
          ...loginRequest,
          account: account,
        });

        props.handleSwitchAccount(false);

        // To ensure account related page attributes update after the account is changed
        window.location.reload();
      } catch (error) {
        if (error instanceof InteractionRequiredAuthError) {
          instance.loginRedirect({
            ...loginRequest,
            prompt: 'login',
          });
        }
      }
    } else {
      props.handleSwitchAccount(false);
    }

    onClose(account);
  };

  return (
    <Dialog onClose={onClose} aria-labelledby="simple-dialog-title" open={open}>
      <DialogTitle id="simple-dialog-title">Seleccionar cuenta</DialogTitle>
      <List>
        {accounts.map((account) => (
          <ListItem button onClick={() => handleListItemClick(account)} key={account.homeAccountId}>
            <ListItemAvatar>
              <Avatar>
                <PersonIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={account.name} secondary={account.username} />
          </ListItem>
        ))}

        <ListItem autoFocus button onClick={() => handleListItemClick(null)}>
          <ListItemAvatar>
            <Avatar>
              <AddIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Añadir cuenta" />
        </ListItem>
      </List>
    </Dialog>
  );
};
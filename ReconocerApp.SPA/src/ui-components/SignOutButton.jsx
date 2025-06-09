import { useState } from "react";
import { useMsal } from "@azure/msal-react";
import IconButton from '@mui/material/IconButton';
import AccountCircle from "@mui/icons-material/AccountCircle";
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Typography from '@mui/material/Typography';
import { Box, Avatar, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";

export const SignOutButton = ({ iconSize = 40 }) => {
    const { instance } = useMsal();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const navigate = useNavigate();

    const handleLogout = (logoutType) => {
        setAnchorEl(null);

        const afterLogout = () => {
            navigate('/', { replace: true });
        };

        if (logoutType === "popup") {
            instance.logoutPopup().then(afterLogout);
        } else if (logoutType === "redirect") {
            instance.logoutRedirect({ onRedirectNavigate: () => {
                afterLogout();
                return false;
            }});
        }
    }

    return (
        <Box>
            <IconButton
                onClick={(event) => setAnchorEl(event.currentTarget)}
                color="inherit"
            >
                <AccountCircle sx={{ fontSize: iconSize }} />
            </IconButton>

            <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                open={open}
                onClose={() => setAnchorEl(null)}
            >
                {instance.getActiveAccount() && (
                    <Box display="flex" flexDirection="column" alignItems="center" px={3} py={2}>
                        <Avatar sx={{ bgcolor: 'primary.main', mb: 1, width: 32, height: 32, fontSize: 18 }}>
                            {instance.getActiveAccount().name ? instance.getActiveAccount().name.charAt(0).toUpperCase() : <AccountCircle sx={{ fontSize: 18 }} />}
                        </Avatar>
                        <Typography variant="subtitle1" fontWeight={600} align="center">
                            {instance.getActiveAccount().name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" align="center">
                            {instance.getActiveAccount().username}
                        </Typography>
                    </Box>
                )}
                <Divider sx={{ my: 1 }} />
                <MenuItem onClick={() => handleLogout("popup")} key="logoutPopup" sx={{ justifyContent: 'center', fontWeight: 500 }}>
                    Cerrar sesión
                </MenuItem>
            </Menu>
        </Box>
    )
};
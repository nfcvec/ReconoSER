import { useState } from "react";
import { useMsal } from "@azure/msal-react";
import Button from "@mui/material/Button";
import Menu from '@mui/material/Menu';
import { loginRequest } from "../authConfig";

export const SignInButton = () => {
    const { instance } = useMsal();

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleLogin = (loginType) => {
        setAnchorEl(null);

        if (loginType === "popup") {
            /**
             * When using popup and silent APIs, we recommend setting the redirectUri to a blank page or a page 
             * that does not implement MSAL. Keep in mind that all redirect routes must be registered with the application
             * For more information, visit: https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/login-user.md#redirecturi-considerations 
             */
            instance.loginPopup({
                ...loginRequest,
                redirectUri: import.meta.env.VITE_POPUP_REDIRECT_URI, // e.g. /redirect
            });
        } else if (loginType === "redirect") {
            instance.loginRedirect(loginRequest);
        }
    }

    return (
        <div>
            <Button
                variant="contained"
                onClick={() => handleLogin("popup")}
                key="loginPopup"
                sx={{ bgcolor: '#0847fc', color: '#fff', '&:hover': { bgcolor: '#063bb3' }, display: 'flex', alignItems: 'center', gap: 1, textTransform: 'none' }}
            >
                <strong>Iniciar sesión con Microsoft</strong>
                <svg width="30" height="30" viewBox="0 0 24 24"><rect fill="#F35325" x="2" y="2" width="9" height="9" /><rect fill="#81BC06" x="13" y="2" width="9" height="9" /><rect fill="#05A6F0" x="2" y="13" width="9" height="9" /><rect fill="#FFBA08" x="13" y="13" width="9" height="9" /></svg>
            </Button>
            <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'top',
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
                {/* <MenuItem onClick={() => handleLogin("popup")} key="loginPopup">Iniciar sesión</MenuItem> */}
            </Menu>
        </div>
    )
};
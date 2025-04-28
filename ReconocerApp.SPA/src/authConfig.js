import { LogLevel } from "@azure/msal-browser";
// Browser check variables
// If you support IE, our recommendation is that you sign-in using Redirect APIs
// If you as a developer are testing using Edge InPrivate mode, please add "isEdge" to the if check
const ua = window.navigator.userAgent;
const msie = ua.indexOf("MSIE ");
const msie11 = ua.indexOf("Trident/");
const msedge = ua.indexOf("Edge/");
const firefox = ua.indexOf("Firefox");
const isIE = msie > 0 || msie11 > 0;
const isEdge = msedge > 0;
const isFirefox = firefox > 0; // Only needed if you need to support the redirect flow in Firefox incognito

// Config object to be passed to Msal on creation
export const msalConfig = {
    auth: {
        clientId: import.meta.env.VITE_CLIENT_ID,
        authority: import.meta.env.VITE_AUTHORITY,
        redirectUri: "/",
        postLogoutRedirectUri: "/",
    },
    cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: isIE || isEdge || isFirefox,
    },
    system: {
        allowPlatformBroker: false, // Disables WAM Broker
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) {
                    return;
                }
                switch (level) {
                    case LogLevel.Error:
                        console.error(message);
                        return;
                    case LogLevel.Info:
                        console.info(message);
                        return;
                    case LogLevel.Verbose:
                        console.debug(message);
                        return;
                    case LogLevel.Warning:
                        console.warn(message);
                        return;
                    default:
                        return;
                }
            },
        },
    },
};

export const protectedResources = {
    graph: {
        me: {
            endpoint: "https://graph.microsoft.com/v1.0/me",
            scopes: ["User.Read"],
        },
        users: {
            endpoint: "https://graph.microsoft.com/v1.0/users",
            scopes: ["User.Read.All"],
        },
        photo: {
            endpoint: "https://graph.microsoft.com/v1.0/users/{id}/photo/$value",
            scopes: [],
        }
    }
};

/**
 * Scopes you add here will be prompted for user consent during sign-in.
 * By default, MSAL.js will add OIDC scopes (openid, profile, email) to any login request.
 * For more information about OIDC scopes, visit:
 * https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
 */
export const loginRequest = {
    scopes: [
        ...protectedResources.graph.me.scopes,
        ...protectedResources.graph.users.scopes
    ],
};

export const graphRequest = {
    scopes: protectedResources.graph.me.scopes,
};

export const graphUsersRequest = {
    scopes: protectedResources.graph.users.scopes,
};

// Add here the endpoints for MS Graph API services you would like to use.
export const graphConfig = {
    graphMeEndpoint: protectedResources.graph.me.endpoint,
    graphUsersEndpoint: protectedResources.graph.users.endpoint,
    graphPhotoEndpoint: protectedResources.graph.photo.endpoint,
};

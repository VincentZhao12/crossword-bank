import {
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect,
} from 'react';

const parseJwt = (token: string) => {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(
        window
            .atob(base64)
            .split('')
            .map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join(''),
    );

    return JSON.parse(jsonPayload);
};

interface AuthContextType {
    loggedIn: boolean;
    setLoggedIn: (val: boolean) => any;
    logout: () => any;
}

const AuthContext = createContext<AuthContextType>({
    loggedIn: false,
    setLoggedIn: () => {},
    logout: () => {},
});

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [loggedIn, setLoggedIn] = useState<boolean>(false);

    useEffect(() => {
        const jwt = localStorage.getItem('token');
        if (jwt === null) {
            setLoggedIn(false);
            return;
        }

        const { exp } = parseJwt(jwt);

        if (!exp) {
            setLoggedIn(false);
            return;
        }

        if (exp * 1000 > Date.now()) {
            setLoggedIn(true);
        } else {
            setLoggedIn(false);
        }
    }, []);

    const logout = () => {
        localStorage.removeItem('token');
        setLoggedIn(false);
    };

    const value: AuthContextType = { loggedIn, setLoggedIn, logout };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => useContext(AuthContext);

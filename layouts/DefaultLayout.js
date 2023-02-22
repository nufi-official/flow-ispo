import * as fcl from "@onflow/fcl";
import Sidebar from "../components/Sidebar";
import { AppBar, Box, Button, Toolbar } from "@mui/material";
import useCurrentUser from "../hooks/useCurrentUser";

const appTopBar = 64;
const sideBarWidth = 300;

export default function DefaultLayout({ children }) {
  const user = useCurrentUser();
  return (
    <Box display="flex" minHeight="100vh">
      <Sidebar width={sideBarWidth} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "grey.100",
          p: 3,
          pt: `${appTopBar}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AppBar color="transparent" sx={{ boxShadow: "none" }}>
          <Toolbar sx={{ justifyContent: "flex-end", height: appTopBar }}>
            {!user.loggedIn && (
              <Button variant="contained" onClick={fcl.authenticate}>
                Log In With Wallet
              </Button>
            )}
            {user.loggedIn && (
              <Button variant="contained" onClick={fcl.unauthenticate}>
                Log Out Of Wallet
              </Button>
            )}
          </Toolbar>
        </AppBar>
        {children}
      </Box>
    </Box>
  );
}

import * as fcl from "@onflow/fcl";
import useCurrentUser from "../hooks/useCurrentUser";
import Link from "next/link";
import {
  AppBar,
  Box,
  Typography,
  Button,
  Toolbar,
  Link as MuiLink,
} from "@mui/material";

export default function NavigationBar() {
  const user = useCurrentUser();
  return (
    <AppBar
      color="transparent"
      position="relative"
      sx={{ boxShadow: "none", maxWidth: "1980px", margin: "0 auto" }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box display="flex" gap={2} alignItems="center">
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Flow ISPO
          </Typography>
          <MuiLink component={Link} href="/create">
            Create
          </MuiLink>
          <MuiLink component={Link} href="/participate">
            Participate
          </MuiLink>
        </Box>

        <div>
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
        </div>
      </Toolbar>
    </AppBar>
  );
}

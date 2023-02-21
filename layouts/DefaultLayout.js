import NavigationBar from "../components/NavigationBar";
import { Box } from "@mui/material";

export default function DefaultLayout({ children }) {
  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <NavigationBar />
      <Box component="main" flex={1}>
        {children}
      </Box>
    </Box>
  );
}

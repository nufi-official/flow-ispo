import { createTheme } from "@mui/material/styles";

// Create a theme instance.
const theme = createTheme({
  components: {
    MuiLink: {
      defaultProps: {
        underline: "hover",
      },
    },
  },
  palette: {
    primary: {
      light: "#42424a",
      main: "#191919",
    },
  },
});

export default theme;

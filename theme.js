import {createTheme} from '@mui/material/styles'

export const generateGradient = (alphaLeft, alphaRight) =>
  `linear-gradient(103.7427deg, rgba(159, 238, 255, ${alphaLeft}) 30%, rgba(186, 117, 255, ${alphaRight}) 100%)`

// Create a theme instance.
const theme = createTheme({
  components: {
    MuiChip: {
      variants: [
        {
          props: {variant: 'gradient'},
          style: {
            overflow: 'hidden',
            color: '#191919',
            border: 'none',
            fontWeight: 'bold',
            backgroundImage: generateGradient(0.6, 0.6),
          },
        },
      ],
    },
    MuiButton: {
      variants: [
        {
          props: {variant: 'gradient'},
          style: {
            overflow: 'hidden',
            color: '#191919',
            border: '1px solid #191919',
            // Workaround for creating transitioned linear-gradient hover effect
            // it is not possible to transition backgroundImage
            // HOW DOES IT WORK?
            // pseudo element positioned absolutely outside of the button is being "bring in" on hover effect
            // the actual change in positioning CAN be transitioned
            '&:after': {
              backgroundImage: generateGradient(0.6, 0.6),
              height: '200%',
              // positions button outside of the viewport
              left: '-121%',
              position: 'absolute',
              top: '-50%',
              transform: 'skewX(0deg)',
              transition: 'all .35s',
              width: 0,
              zIndex: -1,
              content: "''",
            },
            '&:hover': {
              borderColor: 'rgba(159, 238, 255, 0.6)',
              '&:after': {
                content: "''",
                // brings pseudo element to the button viewport
                left: '-10%',
                transform: 'skewX(-30deg)',
                width: '120%',
              },
            },
          },
        },
        {
          props: {variant: 'gradient-solid'},
          style: {
            overflow: 'hidden',
            color: '#191919',
            backgroundImage: generateGradient(0.6, 0.6),
            '&:after': {
              backgroundImage: generateGradient(0.6, 0.6),
              height: '200%',
              // positions button outside of the viewport
              left: '-121%',
              position: 'absolute',
              top: '-50%',
              transform: 'skewX(0deg)',
              transition: 'all .35s',
              width: 0,
              zIndex: -1,
              content: "''",
            },
            '&:hover': {
              borderColor: 'rgba(159, 238, 255, 0.6)',
              '&:after': {
                content: "''",
                // brings pseudo element to the button viewport
                left: '-10%',
                transform: 'skewX(-30deg)',
                width: '120%',
              },
            },
          },
        },
      ],
    },
    MuiListItemButton: {
      styleOverrides: {
        color: 'pink',
        root: {
          position: 'relative',
          overflow: 'hidden',
          '&:after': {
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            backgroundImage: generateGradient(1, 1),
            transition: 'all .5s ease-in',
            opacity: 0,
            content: "''",
            zIndex: -1,
          },
          '&.Mui-selected': {
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: 'transparent',
            },
            '&:after': {
              opacity: 0.2,
              content: "''",
            },
          },
          '&:hover': {
            backgroundColor: 'transparent',
            '&:after': {
              opacity: 0.4,
              content: "''",
            },
          },
        },
      },
    },
  },
  palette: {
    primary: {
      light: '#42424a',
      main: '#191919',
    },
    secondary: {
      main: 'rgb(186, 117, 255)',
    },
  },
})

export default theme

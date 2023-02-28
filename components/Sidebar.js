import Link from 'next/link'
import {useRouter} from 'next/router'
import {
  Drawer,
  Toolbar,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Link as MuiLink,
} from '@mui/material'
import {
  Apps as MyParticipationIcon,
  ManageSearch as ParticipationOfferingsIcon,
  Add as CreateISPOIcon,
  AccountBox as OverviewIcon,
  SettingsApplications as MyISPOIcon,
  Launch as ExternalIcon,
} from '@mui/icons-material'
import {learnMoreLink} from '../constants'
import {generateGradient} from '../theme'

const defaultSidebarWidth = 300

const navList = [
  {
    category: 'General',
    links: [
      {
        label: 'Home',
        href: '/',
        Icon: OverviewIcon,
        external: false,
      },
    ],
  },
  {
    category: 'Participate',
    links: [
      {
        label: 'My Participations',
        href: '/my-participations',
        Icon: MyParticipationIcon,
        external: false,
      },
      {
        label: 'Participation Offerings',
        href: '/participate',
        Icon: ParticipationOfferingsIcon,
        external: false,
      },
    ],
  },
  {
    category: 'ISPO Management',
    links: [
      {
        label: 'Create ISPO',
        href: '/create',
        Icon: CreateISPOIcon,
        external: false,
      },
      {
        label: 'My ISPOS',
        href: '/my-ispos',
        Icon: MyISPOIcon,
        external: false,
      },
    ],
  },
  {
    category: 'Docs',
    links: [
      {
        label: 'Learn More',
        href: learnMoreLink,
        Icon: ExternalIcon,
        external: true,
      },
    ],
  },
]

export default function Sidebar(props) {
  const router = useRouter()
  return (
    <Drawer
      sx={{
        width: props.width || defaultSidebarWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: props.width || defaultSidebarWidth,
          boxSizing: 'border-box',
          border: 'none',
          boxShadow: ({shadows}) => shadows[1],
          background: 'rgba(255,255,255,0.3)',
          backdropFilter: 'blur(5px)',
        },
        border: 'none',
      }}
      variant="permanent"
      anchor="left"
    >
      <Toolbar
        sx={{
          justifyContent: 'center',
          px: {md: 2},
          fontSize: 30,
          textTransform: 'uppercase',
          letterSpacing: 6,
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <img src="/veleslogo.png" alt="Veles logo" height={40} width={40} />
        <Box
          sx={{
            background: `-webkit-${generateGradient(1, 1)}`,
            '-webkit-background-clip': 'text',
            '-webkit-text-fill-color': 'transparent',
            fontWeight: 700,
          }}
        >
          Veles
        </Box>
      </Toolbar>

      <List sx={{px: 1}}>
        {navList.map(({category, links}, index) => (
          <Box key={category} pb={2}>
            <Typography
              variant="body2"
              sx={{
                color: 'text.disabled',
                fontWeight: 'bold',
                pb: 1,
                ml: 1,
              }}
            >
              {category}
            </Typography>
            <Divider />
            {links.map(({label, href, external, Icon}) => (
              <ListItem key={label + href} sx={{p: 1}}>
                <ListItemButton
                  component={Link}
                  href={href}
                  target={external ? '_blank' : undefined}
                  selected={router.pathname === href}
                  sx={{borderRadius: 1, p: 1}}
                >
                  <ListItemIcon sx={{minWidth: '35px'}}>
                    <Icon />
                  </ListItemIcon>
                  <ListItemText
                    primary={label}
                    disableTypography
                    sx={{fontWeight: 500}}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </Box>
        ))}
      </List>
      <Typography
        sx={{mt: 'auto', pb: 2}}
        color="textSecondary"
        variant="caption"
        textAlign="center"
      >
        Enjoying Veles? Join our{' '}
        <MuiLink
          underline="hover"
          href="https://discord.gg/NuFi"
          target="_blank"
          color="info.main"
        >
          Discord
        </MuiLink>
        .
      </Typography>
    </Drawer>
  )
}
